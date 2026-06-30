/**
 * Documentation metadata registry.
 *
 * Defines canonical document IDs, sidebar display order, localized titles,
 * and filename/title aliases used by the Project Modal documentation system.
 */

export const DOC_METADATA = {
  overview: {
    order: 1,
    titles: { en: "Overview", "zh-TW": "專題綜覽" },
  },
  architecture: {
    order: 2,
    titles: { en: "Architecture", "zh-TW": "專題架構" },
  },
  implementation: {
    order: 3,
    titles: { en: "Implementation", "zh-TW": "實作流程" },
  },
};

// Maps localized or capitalized document IDs to their canonical (lowercase) IDs.
// Add an entry here when a project uses non-standard filenames.
export const DOC_ID_ALIASES = {
  "專題綜覽": "overview",
  "專題架構": "architecture",
  "實作流程": "implementation",
};

export function getDocMetadata(documentId) {
  const canonical = DOC_ID_ALIASES[documentId] ?? documentId.toLowerCase();
  return DOC_METADATA[canonical] ?? null;
}

export function getDocumentTitle(documentId, language) {
  const meta = getDocMetadata(documentId);
  if (!meta) {
    return titleizeDocumentId(documentId);
  }
  return meta.titles[language] ?? meta.titles.en ?? titleizeDocumentId(documentId);
}

export function titleizeDocumentId(documentId) {
  return documentId
    .split(/[-_]+/)
    .filter(Boolean)
    .filter((word, index) => !(index === 0 && /^\d+$/.test(word)))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function sortDocumentIds(documentIds) {
  return [...documentIds].sort((a, b) => {
    const aOrder = getDocMetadata(a)?.order ?? Infinity;
    const bOrder = getDocMetadata(b)?.order ?? Infinity;
    return aOrder - bOrder;
  });
}
