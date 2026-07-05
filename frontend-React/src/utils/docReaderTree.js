// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

function countFilesInNode(node) {
  if (node.type === "file") return 1;
  return node.children.reduce((sum, child) => sum + countFilesInNode(child), 0);
}

function findFirstFileInNode(node) {
  if (node.type === "file") return node;
  for (const child of node.children) {
    const found = findFirstFileInNode(child);
    if (found) return found;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Reading list builder (shared by ContinuousDocReader and ProjectModal so
// both surfaces walk the doc tree in the same order)
// ---------------------------------------------------------------------------

/**
 * Flattens the doc tree into an ordered list of { fileNode, displayPath }.
 *
 * displayPath is used in chapter transitions:
 *   - Root file              → "Overview"
 *   - Single-file category   → "Implementation / 前端React+Vite"  (folder name, no filename)
 *   - Multi-file category    → "Implementation / GCP / RAG Pipeline"
 *
 * Empty folders are skipped.
 */
export function flattenTreeToReadingList(nodes, folderPath = []) {
  const list = [];

  for (const node of nodes) {
    if (node.type === "file") {
      list.push({
        fileNode: node,
        displayPath: [...folderPath, node.name].join(" / "),
      });
    } else if (node.type === "folder") {
      const fileCount = countFilesInNode(node);
      if (fileCount === 0) continue;

      if (fileCount === 1) {
        // Single-file category: use the folder name as the display label
        // so the filename is never surfaced.
        const fileNode = findFirstFileInNode(node);
        list.push({
          fileNode,
          displayPath: [...folderPath, node.name].join(" / "),
        });
      } else {
        // Multi-file folder: recurse with this folder prepended to the path.
        flattenTreeToReadingList(node.children, [...folderPath, node.name])
          .forEach((item) => list.push(item));
      }
    }
  }

  return list;
}
