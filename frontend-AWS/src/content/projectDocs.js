const rawProjectDocs = import.meta.glob("./projects/*/*/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const legacyFallbackDocumentIds = ["overview", "architecture", "implementation"];
const preferredDocumentOrder = ["overview", "architecture", "implementation"];
const rawProjectDocEntries = Object.entries(rawProjectDocs).map(
  ([path, markdown]) => {
    const match = path.match(/^\.\/projects\/([^/]+)\/([^/]+)\/([^/]+)\.md$/);

    return {
      documentId: match?.[3] ?? "",
      folder: match?.[1] ?? "",
      language: match?.[2] ?? "",
      markdown,
      path,
    };
  },
);
const availableProjectFolders = [
  ...new Set(rawProjectDocEntries.map((entry) => entry.folder).filter(Boolean)),
];

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

const validHeadingPattern = /^(#{1,6})\s+(.+)$/;
const maxSidebarHeadingLevel = 2;

function isSidebarHeadingLevel(level) {
  return level >= 1 && level <= maxSidebarHeadingLevel;
}

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

function titleizeDocumentId(documentId) {
  return documentId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseFrontmatter(markdown) {
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

function parseMarkdownBlocks(markdown, context = {}) {
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

function addNavigationIds(blocks, documentId) {
  let headingIndex = 0;
  const sections = [];

  const blocksWithIds = blocks.map((block) => {
    if (block.type !== "heading" || !isSidebarHeadingLevel(block.level)) {
      return block;
    }

    headingIndex += 1;

    const section = {
      id: `${documentId}-${headingIndex}`,
      level: block.level,
      title: block.text,
    };

    sections.push(section);

    return {
      ...block,
      id: section.id,
    };
  });

  return { blocks: blocksWithIds, sections };
}

function collectNavigationHeadings(markdown, documentId) {
  const { body } = parseFrontmatter(markdown);
  const lines = body.split(/\r?\n/);
  const sections = [];
  let headingIndex = 0;
  let isFencedBlock = false;

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      isFencedBlock = !isFencedBlock;
      return;
    }

    if (isFencedBlock) {
      return;
    }

    const headingMatch = trimmed.match(validHeadingPattern);

    if (!headingMatch) {
      return;
    }

    const level = headingMatch[1].length;

    if (!isSidebarHeadingLevel(level)) {
      return;
    }

    headingIndex += 1;
    sections.push({
      id: `${documentId}-${headingIndex}`,
      level,
      title: headingMatch[2].trim(),
    });
  });

  return sections;
}

function parseMarkdownDocument(documentId, markdown, context = {}) {
  const { body } = parseFrontmatter(markdown);
  const parseContext = { ...context, documentId };
  const documentTitle = titleizeDocumentId(documentId);
  const parsedBlocks = parseMarkdownBlocks(body, parseContext);
  const { blocks, sections } = addNavigationIds(parsedBlocks, documentId);

  if (sections.length === 0) {
    logMarkdownWarning("Missing markdown navigation headings", parseContext);
  }

  return {
    title: documentTitle,
    blocks,
    sections,
  };
}

function parseMarkdownDocumentOutline(documentId, markdown) {
  return {
    title: titleizeDocumentId(documentId),
    sections: collectNavigationHeadings(markdown, documentId),
  };
}

function tokenize(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function slugify(value = "") {
  return tokenize(value).join("-");
}

function scoreProjectFolder(folder, selectedProject) {
  const folderTokens = new Set(tokenize(folder));
  const projectTokens = new Set([
    ...tokenize(selectedProject.id),
    ...tokenize(selectedProject.projectId),
    ...tokenize(selectedProject.title),
  ]);

  return [...folderTokens].filter((token) => projectTokens.has(token)).length;
}

function getProjectDocFolder(selectedProject) {
  const directCandidates = [
    selectedProject.id,
    selectedProject.projectId,
    slugify(selectedProject.title),
  ].filter(Boolean);
  const directMatch = directCandidates.find((candidate) =>
    availableProjectFolders.includes(candidate),
  );

  if (directMatch) {
    return directMatch;
  }

  return (
    [...availableProjectFolders]
      .map((folder) => ({
        folder,
        score: scoreProjectFolder(folder, selectedProject),
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.folder.localeCompare(b.folder))[0]
      ?.folder ?? selectedProject.id
  );
}

function getMarkdownForProject(selectedProject, language, documentId) {
  const folder = getProjectDocFolder(selectedProject);
  const localizedKey = `./projects/${folder}/${language}/${documentId}.md`;
  const fallbackKey = `./projects/${folder}/en/${documentId}.md`;

  return rawProjectDocs[localizedKey] ?? rawProjectDocs[fallbackKey];
}

function sortDocumentIds(documentIds) {
  return [...documentIds].sort((a, b) => {
    const aPreferredIndex = preferredDocumentOrder.indexOf(a);
    const bPreferredIndex = preferredDocumentOrder.indexOf(b);
    const aIsPreferred = aPreferredIndex !== -1;
    const bIsPreferred = bPreferredIndex !== -1;

    if (aIsPreferred && bIsPreferred) {
      return aPreferredIndex - bPreferredIndex;
    }

    if (aIsPreferred) {
      return -1;
    }

    if (bIsPreferred) {
      return 1;
    }

    return a.localeCompare(b);
  });
}

function getProjectDocumentIds(selectedProject, language) {
  const folder = getProjectDocFolder(selectedProject);
  const localizedDocumentIds = rawProjectDocEntries
    .filter((entry) => entry.folder === folder && entry.language === language)
    .map((entry) => entry.documentId)
    .filter(Boolean);

  if (localizedDocumentIds.length > 0 && language !== "en") {
    return localizedDocumentIds;
  }

  const englishDocumentIds = rawProjectDocEntries
    .filter((entry) => entry.folder === folder && entry.language === "en")
    .map((entry) => entry.documentId);
  const documentIds = [
    ...new Set([...localizedDocumentIds, ...englishDocumentIds]),
  ].filter(Boolean);

  return documentIds.length
    ? sortDocumentIds(documentIds)
    : legacyFallbackDocumentIds;
}

function fallbackMarkdown(selectedProject, documentId) {
  if (documentId === "overview") {
    return `---
title: Overview
---
# Overview

## Project Summary
> ${selectedProject.type}

${selectedProject.body}

## Solution
${selectedProject.solution}

## Features
- ${selectedProject.problem}
- ${selectedProject.solution}
- ${selectedProject.notes}`;
  }

  if (documentId === "architecture") {
    return `---
title: Architecture
---
# Architecture

## Architecture Diagram
${selectedProject.architecture}

## System Module
| Layer | Component |
| --- | --- |
${selectedProject.services.map((service) => `| Project Service | ${service} |`).join("\n")}

## Workflow
${selectedProject.architecture}

## Technology Stack
${selectedProject.services.map((service) => `- ${service}`).join("\n")}`;
  }

  return `---
title: Implementation
---
# Implementation

## Frontend
${selectedProject.body}

## Backend
${selectedProject.solution}

## Database
Project data storage depends on the selected implementation.

## API
Project API details are documented as the implementation matures.

## Network
Network flow follows the project architecture.

## Security
Security controls should be documented with deployment details.

## Deployment
Deployment notes should be maintained with the project.

## CI/CD
CI/CD notes should be maintained with the project.

## IaC
Infrastructure as Code is a future documentation area.

## Monitoring
Monitoring notes should be maintained with the project.

## Troubleshooting
${selectedProject.notes}`;
}

function getProjectMarkdown(selectedProject, language, documentId) {
  return (
    getMarkdownForProject(selectedProject, language, documentId) ??
    fallbackMarkdown(selectedProject, documentId)
  );
}

export function getProjectDocumentOutlines(selectedProject, language = "en") {
  const documentIds = getProjectDocumentIds(selectedProject, language);

  return documentIds.map((documentId) => {
    const markdown = getProjectMarkdown(selectedProject, language, documentId);
    const filename = `${documentId}.md`;
    const parsedDocument = parseMarkdownDocumentOutline(documentId, markdown, {
      filename,
      projectId: selectedProject.id,
    });

    return {
      id: documentId,
      filename,
      title: parsedDocument.title,
      sections: parsedDocument.sections,
    };
  });
}

export function getProjectDocument(
  selectedProject,
  language = "en",
  documentId,
) {
  const documentIds = getProjectDocumentIds(selectedProject, language);
  const resolvedDocumentId = documentIds.includes(documentId)
    ? documentId
    : documentIds[0];
  const markdown = getProjectMarkdown(
    selectedProject,
    language,
    resolvedDocumentId,
  );
  const filename = `${resolvedDocumentId}.md`;
  const parsedDocument = parseMarkdownDocument(resolvedDocumentId, markdown, {
    filename,
    projectId: selectedProject.id,
  });

  return {
    id: resolvedDocumentId,
    filename,
    blocks: parsedDocument.blocks,
    title: parsedDocument.title,
    sections: parsedDocument.sections,
  };
}
