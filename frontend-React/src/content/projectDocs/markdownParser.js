/**
 * Markdown parser for project documentation.
 *
 * Converts raw markdown into renderable block objects consumed by
 * MarkdownContent.jsx. Supports headings, lists, tables, code fences,
 * callouts, Mermaid diagrams, images, and embedded demo directives.
 */

const calloutTypes = new Set([
  "note",
  "info",
  "tip",
  "warning",
  "danger",
  "success",
  "aws",
  "gcp",
]);

export const validHeadingPattern = /^(#{1,6})\s+(.+)$/;

function getMarkdownWarningContext(context) {
  return context?.filename ?? context?.documentId ?? "markdown document";
}

function logMarkdownWarning(message, context, details) {
  const contextLabel = getMarkdownWarningContext(context);

  if (details) {
    console.warn(`[Markdown Warning]\n${message} in ${contextLabel}`, details);
    return;
  }

  console.warn(`[Markdown Warning]\n${message} in ${contextLabel}`);
}

export function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) {
    return { metadata: {}, body: markdown };
  }

  const endIndex = markdown.indexOf("\n---", 3);

  if (endIndex === -1) {
    return { metadata: {}, body: markdown };
  }

  const metadata = {};
  const frontmatter = markdown.slice(3, endIndex).trim();

  frontmatter.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);

    if (match) {
      metadata[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  });

  return {
    metadata,
    body: markdown.slice(endIndex + 4).replace(/^\r?\n/, ""),
  };
}

function parseTable(lines, startIndex) {
  const rows = [];
  let index = startIndex;

  while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
    rows.push(
      lines[index]
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim()),
    );
    index += 1;
  }

  if (rows.length < 2 || !rows[1].every((cell) => /^:?-{3,}:?$/.test(cell))) {
    return null;
  }

  return {
    block: {
      type: "table",
      headers: rows[0],
      rows: rows.slice(2),
    },
    nextIndex: index,
  };
}

function collectFencedLines(lines, startIndex) {
  const codeLines = [];
  let index = startIndex + 1;
  let isClosed = false;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    const isFence = trimmed.startsWith("```");

    if (isFence) {
      isClosed = true;
      break;
    }

    codeLines.push(lines[index]);
    index += 1;
  }

  return {
    codeLines,
    isClosed,
    nextIndex: isClosed ? index + 1 : index,
  };
}

export function parseMarkdownBlocks(markdown, context = {}) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^([-*_])(?:\s*\1){2,}\s*$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    const calloutMatch = trimmed.match(/^:::\s*([A-Za-z-]+)(?:\s+(.+))?$/);
    if (calloutMatch) {
      const blockStartIndex = index;
      const requestedType = calloutMatch[1].toLowerCase();
      const calloutLines = [];
      let isClosed = false;
      index += 1;

      while (index < lines.length && lines[index].trim() !== ":::") {
        calloutLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length && lines[index].trim() === ":::") {
        isClosed = true;
      }

      if (!isClosed) {
        logMarkdownWarning("Unclosed callout block", context);
        index = blockStartIndex + 1;
        continue;
      }

      // :::demo <demoId> is a special directive that embeds a React demo component.
      // It does not have inner markdown content — the closing ::: is just a terminator.
      if (requestedType === "demo") {
        const demoId = calloutMatch[2]?.trim() ?? "";
        if (!demoId) {
          logMarkdownWarning(
            "Demo block missing demoId — use :::demo <id>",
            context,
          );
        }
        blocks.push({ type: "demo", demoId });
        index += 1;
        continue;
      }

      if (!calloutTypes.has(requestedType)) {
        logMarkdownWarning("Invalid custom block syntax", context, {
          blockType: requestedType,
        });
      }

      blocks.push({
        type: "callout",
        calloutType: calloutTypes.has(requestedType) ? requestedType : "note",
        title: calloutMatch[2]?.trim() ?? "",
        blocks: parseMarkdownBlocks(calloutLines.join("\n"), context),
      });
      index += 1;
      continue;
    }

    if (trimmed.startsWith(":::")) {
      logMarkdownWarning("Invalid markdown block detected", context, {
        block: trimmed,
      });
      index += 1;
      continue;
    }

    const fenceMatch = trimmed.match(/^```([A-Za-z][\w-]*)?(?:\s+(.+))?\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1] ?? "";
      const normalizedLanguage = language.toLowerCase();
      const { codeLines, isClosed, nextIndex } = collectFencedLines(lines, index);
      const code = codeLines.join("\n");

      if (!isClosed) {
        const blockLabel = normalizedLanguage || "fenced code";
        logMarkdownWarning(`Unclosed ${blockLabel} block`, context);
        index += 1;
        continue;
      }

      if (normalizedLanguage === "mermaid") {
        blocks.push({ type: "mermaid", code });
      } else if (normalizedLanguage === "gallery") {
        const images = codeLines
          .map((galleryLine) => galleryLine.trim())
          .filter(Boolean)
          .map((galleryLine) => {
            const [src, ...titleParts] = galleryLine.split("|");

            if (!src.trim()) {
              logMarkdownWarning("Invalid gallery image entry", context, {
                entry: galleryLine,
              });
            }

            return {
              src: src.trim(),
              title: titleParts.join("|").trim(),
            };
          })
          .filter((image) => image.src);

        blocks.push({
          type: "gallery",
          images,
        });
      } else if (normalizedLanguage === "text") {
        blocks.push({ type: "workflow", code });
      } else {
        blocks.push({
          type: "code",
          language,
          code,
        });
      }
      index = nextIndex;
      continue;
    }

    if (trimmed.startsWith("```")) {
      logMarkdownWarning("Invalid markdown block detected", context, {
        block: trimmed,
      });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(validHeadingPattern);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      index += 1;
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      blocks.push({
        type: "image",
        alt: imageMatch[1],
        src: imageMatch[2],
        caption: imageMatch[1],
      });
      index += 1;
      continue;
    }

    const tableResult = parseTable(lines, index);
    if (tableResult) {
      blocks.push(tableResult.block);
      index = tableResult.nextIndex;
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      logMarkdownWarning("Invalid markdown block detected", context, {
        block: "table",
        line,
      });
      index += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoteLines = [];

      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, "").trim());
        index += 1;
      }

      blocks.push({ type: "list", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, "").trim());
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !validHeadingPattern.test(lines[index].trim()) &&
      !/^```/.test(lines[index].trim()) &&
      !/^([-*_])(?:\s*\1){2,}\s*$/.test(lines[index].trim()) &&
      !/^!\[([^\]]*)\]\(([^)]+)\)$/.test(lines[index].trim()) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*\|.*\|\s*$/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length === 0) {
      logMarkdownWarning("Invalid markdown block detected", context, {
        block: trimmed,
      });
      index += 1;
      continue;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}
