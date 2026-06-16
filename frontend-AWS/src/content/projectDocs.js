const rawProjectDocs = import.meta.glob("./projects/*/*/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const documentIds = ["overview", "architecture", "implementation"];

const projectDocFolders = {
  "cloud-resume-rag": "cloud-resume-rag",
  "event-system": "event-announcement-system",
  "recipe-sharing-app": "recipe-sharing-app",
  "jenkins-cicd": "jenkins-cicd",
  "ec2-apache-website": "ec2-apache-website",
};

const defaultDocumentTitles = {
  overview: "Overview",
  architecture: "Architecture",
  implementation: "Implementation",
};

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

function parseMarkdownBlocks(markdown) {
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

    const fenceMatch = trimmed.match(/^```(\w+)?\s*$/);
    if (fenceMatch) {
      const codeLines = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push({
        type: "code",
        language: fenceMatch[1] ?? "",
        code: codeLines.join("\n"),
      });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{2,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length >= 3 ? 3 : 2,
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
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^```/.test(lines[index].trim()) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*\|.*\|\s*$/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function parseMarkdownDocument(documentId, markdown) {
  const sections = [];
  const { metadata, body } = parseFrontmatter(markdown);
  const sectionMatches = [...body.matchAll(/^#\s+(.+)$/gm)];

  if (sectionMatches.length === 0) {
    return {
      title: metadata.title ?? getDocumentTitle(documentId),
      sections: [
        {
          id: `${documentId}-1`,
          title: getDocumentTitle(documentId),
          blocks: parseMarkdownBlocks(body),
        },
      ],
    };
  }

  sectionMatches.forEach((match, index) => {
    const title = match[1].trim();
    const contentStart = match.index + match[0].length;
    const contentEnd =
      index + 1 < sectionMatches.length
        ? sectionMatches[index + 1].index
        : body.length;

    sections.push({
      id: `${documentId}-${index + 1}`,
      title,
      blocks: parseMarkdownBlocks(body.slice(contentStart, contentEnd)),
    });
  });

  return {
    title: metadata.title ?? getDocumentTitle(documentId),
    sections,
  };
}

function getMarkdownForProject(projectId, language, documentId) {
  const folder = projectDocFolders[projectId] ?? projectId;
  const localizedKey = `./projects/${folder}/${language}/${documentId}.md`;
  const fallbackKey = `./projects/${folder}/en/${documentId}.md`;

  return rawProjectDocs[localizedKey] ?? rawProjectDocs[fallbackKey];
}

function fallbackMarkdown(selectedProject, documentId) {
  if (documentId === "overview") {
    return `---
title: Overview
---
# Project Summary
> ${selectedProject.type}

${selectedProject.body}

${selectedProject.solution}

# Features
- ${selectedProject.problem}
- ${selectedProject.solution}
- ${selectedProject.notes}`;
  }

  if (documentId === "architecture") {
    return `---
title: Architecture
---
# Architecture Diagram
${selectedProject.architecture}

# System Module
| Layer | Component |
| --- | --- |
${selectedProject.services.map((service) => `| Project Service | ${service} |`).join("\n")}

# Workflow
${selectedProject.architecture}

# Technology Stack
${selectedProject.services.map((service) => `- ${service}`).join("\n")}`;
  }

  return `---
title: Implementation
---
# Frontend
${selectedProject.body}

# Backend
${selectedProject.solution}

# Database
Project data storage depends on the selected implementation.

# API
Project API details are documented as the implementation matures.

# Network
Network flow follows the project architecture.

# Security
Security controls should be documented with deployment details.

# Deployment
Deployment notes should be maintained with the project.

# CI/CD
CI/CD notes should be maintained with the project.

# IaC
Infrastructure as Code is a future documentation area.

# Monitoring
Monitoring notes should be maintained with the project.

# Troubleshooting
${selectedProject.notes}`;
}

export function getProjectDocuments(selectedProject, language = "en") {
  return documentIds.map((documentId) => {
    const markdown =
      getMarkdownForProject(selectedProject.id, language, documentId) ??
      fallbackMarkdown(selectedProject, documentId);
    const parsedDocument = parseMarkdownDocument(documentId, markdown);

    return {
      id: documentId,
      filename: `${documentId}.md`,
      title: parsedDocument.title,
      sections: parsedDocument.sections,
    };
  });
}
