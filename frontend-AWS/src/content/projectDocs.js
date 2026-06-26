const rawProjectDocs = import.meta.glob("./projects/*/*/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const defaultDocumentIds = ["overview", "architecture", "implementation"];

const projectDocFolders = {
  "cloud-resume-rag": "cloud-resume-rag",
  "event-system": "event-announcement-system",
  "url-shortener": "url-shortener",
  "qr-code-generator": "qr-code-generator",
  "real-time-chat": "real-time-application",
  "video-streaming-platform": "video-streaming-platform",
  "recipe-sharing-app": "recipe-sharing-app",
  "jenkins-cicd": "jenkins-cicd",
  "ec2-apache-website": "ec2-apache-website",
};

const defaultDocumentTitles = {
  overview: "Overview",
  architecture: "Architecture",
  implementation: "Implementation",
};

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
const validH1Pattern = /^#\s+(.+)$/m;
const validH2Pattern = /^##\s+(.+)$/gm;

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

function getDocumentTitle(documentId) {
  return defaultDocumentTitles[documentId] ?? documentId;
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

function stripDocumentTitleHeadings(markdown) {
  const lines = markdown.split(/\r?\n/);
  let isFencedBlock = false;

  return lines
    .filter((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        isFencedBlock = !isFencedBlock;
        return true;
      }

      return isFencedBlock || !validH1Pattern.test(trimmed);
    })
    .join("\n");
}

function getMarkdownDocumentTitle(markdown) {
  const lines = markdown.split(/\r?\n/);
  let isFencedBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      isFencedBlock = !isFencedBlock;
      continue;
    }

    if (!isFencedBlock) {
      const titleMatch = trimmed.match(validH1Pattern);

      if (titleMatch) {
        return titleMatch[1].trim();
      }
    }
  }

  return "";
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

function parseMarkdownDocument(documentId, markdown, context = {}) {
  const sections = [];
  const { metadata, body } = parseFrontmatter(markdown);
  const markdownTitle = getMarkdownDocumentTitle(body);
  const bodyWithoutDocumentTitles = stripDocumentTitleHeadings(body);
  const sectionMatches = [...bodyWithoutDocumentTitles.matchAll(validH2Pattern)];
  const parseContext = { ...context, documentId };
  const documentTitle =
    metadata.title ?? (markdownTitle || getDocumentTitle(documentId));
  const introEnd = sectionMatches[0]?.index ?? bodyWithoutDocumentTitles.length;
  const introBlocks = parseMarkdownBlocks(
    bodyWithoutDocumentTitles.slice(0, introEnd),
    parseContext,
  );

  if (sectionMatches.length === 0) {
    logMarkdownWarning("Missing markdown sections", parseContext);

    return {
      title: documentTitle,
      blocks: introBlocks,
      sections: [],
    };
  }

  sectionMatches.forEach((match, index) => {
    const title = match[1].trim();
    const contentStart = match.index + match[0].length;
    const contentEnd =
      index + 1 < sectionMatches.length
        ? sectionMatches[index + 1].index
        : bodyWithoutDocumentTitles.length;

    try {
      sections.push({
        id: `${documentId}-${index + 1}`,
        title,
        blocks: parseMarkdownBlocks(
          bodyWithoutDocumentTitles.slice(contentStart, contentEnd),
          {
            ...parseContext,
            sectionTitle: title,
          },
        ),
      });
    } catch (error) {
      logMarkdownWarning("Invalid markdown block detected", parseContext, error);
      sections.push({
        id: `${documentId}-${index + 1}`,
        title,
        blocks: [
          {
            type: "warning",
            message: "This section could not be parsed safely.",
          },
        ],
      });
    }
  });

  return {
    title: documentTitle,
    blocks: introBlocks,
    sections,
  };
}

function parseMarkdownDocumentOutline(documentId, markdown) {
  const { metadata, body } = parseFrontmatter(markdown);
  const markdownTitle = getMarkdownDocumentTitle(body);
  const bodyWithoutDocumentTitles = stripDocumentTitleHeadings(body);
  const sectionMatches = [...bodyWithoutDocumentTitles.matchAll(validH2Pattern)];
  const documentTitle =
    metadata.title ?? (markdownTitle || getDocumentTitle(documentId));

  if (sectionMatches.length === 0) {
    return {
      title: documentTitle,
      sections: [],
    };
  }

  return {
    title: documentTitle,
    sections: sectionMatches.map((match, index) => ({
      id: `${documentId}-${index + 1}`,
      title: match[1].trim(),
    })),
  };
}

function getMarkdownForProject(projectId, language, documentId) {
  const folder = projectDocFolders[projectId] ?? projectId;
  const localizedKey = `./projects/${folder}/${language}/${documentId}.md`;
  const fallbackKey = `./projects/${folder}/en/${documentId}.md`;

  return rawProjectDocs[localizedKey] ?? rawProjectDocs[fallbackKey];
}

function getProjectDocumentIds() {
  return defaultDocumentIds;
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
    getMarkdownForProject(selectedProject.id, language, documentId) ??
    fallbackMarkdown(selectedProject, documentId)
  );
}

export function getProjectDocumentOutlines(selectedProject, language = "en") {
  const documentIds = getProjectDocumentIds();

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
  documentId = defaultDocumentIds[0],
) {
  const documentIds = getProjectDocumentIds();
  const resolvedDocumentId = documentIds.includes(documentId)
    ? documentId
    : defaultDocumentIds[0];
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
