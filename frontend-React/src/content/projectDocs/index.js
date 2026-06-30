/**
 * Public Project Documentation API.
 *
 * Provides the Project Modal with document outlines and parsed document
 * content while hiding parser, loader, metadata, and fallback implementation
 * details behind a stable interface.
 *
 * New primary API: getProjectDocTree + getProjectDocumentByPath
 * Legacy API:      getProjectDocument + getProjectDocumentOutlines (still work)
 */

import { getDocumentTitle, titleizeDocumentId } from "./documentMetadata.js";
import { parseFrontmatter, parseMarkdownBlocks } from "./markdownParser.js";
import { addNavigationIds, collectNavigationHeadings } from "./navigation.js";
import {
  getProjectDocumentIds,
  getProjectMarkdown,
  getProjectMarkdownByPath,
} from "./documentLoader.js";

export { getProjectDocTree } from "./documentLoader.js";

function logMarkdownWarning(message, context) {
  const contextLabel =
    context?.filename ?? context?.documentId ?? "markdown document";
  console.warn(`[Markdown Warning]\n${message} in ${contextLabel}`);
}

function parseMarkdownDocument(documentId, markdown, context = {}) {
  const { body } = parseFrontmatter(markdown);
  const parseContext = { ...context, documentId };
  const parsedBlocks = parseMarkdownBlocks(body, parseContext);
  const { blocks, sections } = addNavigationIds(parsedBlocks, documentId);

  if (sections.length === 0) {
    logMarkdownWarning("Missing markdown navigation headings", parseContext);
  }

  return { title: titleizeDocumentId(documentId), blocks, sections };
}

function parseMarkdownDocumentOutline(documentId, markdown) {
  return {
    title: titleizeDocumentId(documentId),
    sections: collectNavigationHeadings(markdown, documentId),
  };
}

// ---------------------------------------------------------------------------
// New API: tree-based, parse-on-demand
// ---------------------------------------------------------------------------

/**
 * Parses a single FileNode's markdown into { id, title, blocks, sections }.
 * Only the active document should be parsed — not the whole tree.
 *
 * @param {object} selectedProject - the project object from portfolio content
 * @param {object} fileNode - a FileNode from getProjectDocTree()
 * @returns {{ id: string, title: string, blocks: object[], sections: object[] }}
 */
/**
 * Returns lightweight heading sections for a FileNode without full block parsing.
 * Used by scroll-spy in folder reading mode to update the sidebar quickly.
 */
export function getProjectDocumentSections(selectedProject, fileNode) {
  const markdown = getProjectMarkdownByPath(fileNode, selectedProject);
  return collectNavigationHeadings(markdown, fileNode.id);
}

export function getProjectDocumentByPath(selectedProject, fileNode) {
  const markdown = getProjectMarkdownByPath(fileNode, selectedProject);
  const { body } = parseFrontmatter(markdown);
  const parseContext = {
    filename: `${fileNode.id}.md`,
    projectId: selectedProject.id,
  };
  const parsedBlocks = parseMarkdownBlocks(body, parseContext);
  const { blocks, sections } = addNavigationIds(parsedBlocks, fileNode.id);

  if (sections.length === 0) {
    logMarkdownWarning("Missing markdown navigation headings", parseContext);
  }

  return {
    id: fileNode.id,
    title: fileNode.name,
    blocks,
    sections,
  };
}

// ---------------------------------------------------------------------------
// Legacy API — kept for backward compatibility
// ---------------------------------------------------------------------------

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
      title: getDocumentTitle(documentId, language),
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
    title: getDocumentTitle(resolvedDocumentId, language),
    sections: parsedDocument.sections,
  };
}
