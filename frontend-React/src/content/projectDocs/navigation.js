/**
 * Documentation navigation helpers.
 *
 * Builds stable heading IDs and sidebar section outlines for markdown
 * documents displayed inside the Project Modal.
 */

import { parseFrontmatter, validHeadingPattern } from "./markdownParser.js";

const maxSidebarHeadingLevel = 1;

function isSidebarHeadingLevel(level) {
  return level >= 1 && level <= maxSidebarHeadingLevel;
}

export function addNavigationIds(blocks, documentId) {
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

export function collectNavigationHeadings(markdown, documentId) {
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
