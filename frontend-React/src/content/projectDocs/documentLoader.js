/**
 * Project documentation loader.
 *
 * Resolves project documentation folders, loads raw markdown files through
 * Vite's glob import system, handles language fallback, and returns document
 * IDs/markdown for the Project Modal.
 *
 * Supports arbitrary folder depth under each project/language directory.
 * The glob captures `project/language/[subfolders...]/file.md`.
 * Tree structure is built from file paths alone — no markdown is parsed here.
 */

import {
  sortDocumentIds,
  getDocMetadata,
  getDocumentTitle,
  DOC_ID_ALIASES,
  titleizeDocumentId,
} from "./documentMetadata.js";
import { fallbackMarkdown } from "./fallbackMarkdown.js";

// Eager glob: all markdown bundled as strings, available synchronously.
// The `**` pattern supports arbitrarily nested subfolders.
// Root-level files (< 3 path segments) are excluded by parseDocPath().
const rawProjectDocs = import.meta.glob("../projects/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const legacyFallbackDocumentIds = ["overview", "architecture", "implementation"];
const projectDocsPrefix = "../projects/";

// ---------------------------------------------------------------------------
// Path parsing
// ---------------------------------------------------------------------------

/**
 * Parses a glob path into { folder, language, relPath } or null.
 * relPath is the path relative to the language directory (e.g., "Overview.md"
 * or "Implementation/AWS/overview.md").
 */
function parseDocPath(path) {
  if (!path.startsWith(projectDocsPrefix)) return null;
  const rest = path.slice(projectDocsPrefix.length);
  const parts = rest.split("/");
  if (parts.length < 3) return null; // Must be at least project/language/file.md
  const [folder, language, ...remaining] = parts;
  return { folder, language, relPath: remaining.join("/"), path };
}

// ---------------------------------------------------------------------------
// Legacy flat entries (root-level files only) — used by backward-compat APIs
// ---------------------------------------------------------------------------

const rawProjectDocEntries = Object.keys(rawProjectDocs)
  .map((path) => {
    const parsed = parseDocPath(path);
    if (!parsed) return null;
    const relParts = parsed.relPath.split("/");
    if (relParts.length !== 1) return null; // Skip nested files for legacy API
    return {
      documentId: relParts[0].replace(/\.md$/, ""),
      folder: parsed.folder,
      language: parsed.language,
      path,
    };
  })
  .filter(Boolean);

export const availableProjectFolders = [
  ...new Set(
    Object.keys(rawProjectDocs)
      .map(parseDocPath)
      .filter(Boolean)
      .map((e) => e.folder),
  ),
];

// ---------------------------------------------------------------------------
// Project folder resolution (unchanged)
// ---------------------------------------------------------------------------

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

export function getProjectDocFolder(selectedProject) {
  const directCandidates = [
    selectedProject.id,
    selectedProject.projectId,
    slugify(selectedProject.title),
  ].filter(Boolean);
  const directMatch = directCandidates.find((candidate) =>
    availableProjectFolders.includes(candidate),
  );

  if (directMatch) return directMatch;

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

// ---------------------------------------------------------------------------
// Document tree builder
// ---------------------------------------------------------------------------

/**
 * Sorts tree entries: known-order documents first, then alphabetically.
 * Sorting only inspects the final filename, not the full path.
 */
function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const aFile = a.rel.split("/").pop().replace(/\.md$/, "");
    const bFile = b.rel.split("/").pop().replace(/\.md$/, "");
    const aCanonical = DOC_ID_ALIASES[aFile] ?? aFile.toLowerCase();
    const bCanonical = DOC_ID_ALIASES[bFile] ?? bFile.toLowerCase();
    const aOrder = getDocMetadata(aCanonical)?.order ?? Infinity;
    const bOrder = getDocMetadata(bCanonical)?.order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.rel.localeCompare(b.rel);
  });
}

/**
 * Builds a recursive tree of FolderNode | FileNode from a list of
 * { rel, path } entries where `rel` is the path relative to the language dir.
 */
function buildDocumentTree(entries, language) {
  const sorted = sortEntries(entries);
  const root = [];
  // Maps lowercased folder path → that folder's children array.
  // Empty string '' maps to root.
  const folderChildrenMap = new Map([["", root]]);

  for (const entry of sorted) {
    const relWithoutExt = entry.rel.replace(/\.md$/, "");
    const segments = relWithoutExt.split("/");
    const filename = segments[segments.length - 1];
    const folderSegments = segments.slice(0, -1);

    // Display name: look up via metadata, fall back to titleized filename
    const canonicalFilename = DOC_ID_ALIASES[filename] ?? filename.toLowerCase();
    const displayName = getDocumentTitle(canonicalFilename, language);

    // Ensure each parent folder exists in the map
    let parentKey = "";
    for (let i = 0; i < folderSegments.length; i++) {
      const folderName = folderSegments[i];
      const folderKey = folderSegments
        .slice(0, i + 1)
        .join("/")
        .toLowerCase();

      if (!folderChildrenMap.has(folderKey)) {
        const folderNode = {
          type: "folder",
          id: folderKey,
          name: titleizeDocumentId(folderName),
          children: [],
        };
        (folderChildrenMap.get(parentKey) ?? root).push(folderNode);
        folderChildrenMap.set(folderKey, folderNode.children);
      }
      parentKey = folderKey;
    }

    // Add the file node to its parent
    (folderChildrenMap.get(parentKey) ?? root).push({
      type: "file",
      // Canonical document ID: lowercased relative path without extension
      id: relWithoutExt.toLowerCase(),
      name: displayName,
      path: entry.path,
    });
  }

  return root;
}

// ---------------------------------------------------------------------------
// Public tree API
// ---------------------------------------------------------------------------

/**
 * Returns a recursive document tree for the given project and language.
 * Each node is either a FileNode or a FolderNode. No markdown is parsed.
 *
 * FileNode:  { type: 'file',   id, name, path }
 * FolderNode:{ type: 'folder', id, name, children }
 */
export function getProjectDocTree(selectedProject, language) {
  const folder = getProjectDocFolder(selectedProject);
  const enPrefix = `${projectDocsPrefix}${folder}/en/`;
  const allPaths = Object.keys(rawProjectDocs);
  const enPaths = allPaths.filter((p) => p.startsWith(enPrefix));

  let primaryPaths = enPaths;
  let primaryPrefix = enPrefix;

  if (language !== "en") {
    const langPrefix = `${projectDocsPrefix}${folder}/${language}/`;
    const langPaths = allPaths.filter((p) => p.startsWith(langPrefix));
    if (langPaths.length > 0) {
      primaryPaths = langPaths;
      primaryPrefix = langPrefix;
    }
  }

  // Fallback: no markdown files found — return placeholder nodes
  if (primaryPaths.length === 0) {
    return legacyFallbackDocumentIds.map((docId) => ({
      type: "file",
      id: docId,
      name: getDocumentTitle(docId, language),
      path: null,
    }));
  }

  const entries = primaryPaths.map((p) => ({
    rel: p.slice(primaryPrefix.length),
    path: p,
  }));

  return buildDocumentTree(entries, language);
}

// ---------------------------------------------------------------------------
// Markdown access
// ---------------------------------------------------------------------------

/**
 * Returns the raw markdown string for a FileNode.
 * Falls back to generated markdown if the path is missing.
 */
export function getProjectMarkdownByPath(fileNode, selectedProject) {
  if (fileNode.path && rawProjectDocs[fileNode.path] !== undefined) {
    return rawProjectDocs[fileNode.path];
  }
  // Use just the final filename segment as the legacy document ID for fallback
  const docId = fileNode.id.split("/").pop();
  return fallbackMarkdown(selectedProject, docId);
}

// ---------------------------------------------------------------------------
// Legacy backward-compatible APIs
// ---------------------------------------------------------------------------

function getMarkdownForProject(selectedProject, language, documentId) {
  const folder = getProjectDocFolder(selectedProject);
  const localizedKey = `${projectDocsPrefix}${folder}/${language}/${documentId}.md`;
  const fallbackKey = `${projectDocsPrefix}${folder}/en/${documentId}.md`;
  return rawProjectDocs[localizedKey] ?? rawProjectDocs[fallbackKey];
}

export function sortDocumentIdsLegacy(documentIds) {
  return sortDocumentIds(documentIds);
}

export function getProjectDocumentIds(selectedProject, language) {
  const folder = getProjectDocFolder(selectedProject);
  const localizedDocumentIds = rawProjectDocEntries
    .filter((entry) => entry.folder === folder && entry.language === language)
    .map((entry) => entry.documentId)
    .filter(Boolean);

  if (localizedDocumentIds.length > 0 && language !== "en") {
    return sortDocumentIds(localizedDocumentIds);
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

export function getProjectMarkdown(selectedProject, language, documentId) {
  return (
    getMarkdownForProject(selectedProject, language, documentId) ??
    fallbackMarkdown(selectedProject, documentId)
  );
}
