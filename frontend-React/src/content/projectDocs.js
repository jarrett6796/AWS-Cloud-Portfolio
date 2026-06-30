/**
 * Bridge re-export — kept for backwards compatibility.
 *
 * All documentation logic has moved to src/content/projectDocs/.
 * Import from there for new code; existing imports continue to work here.
 */
export {
  getProjectDocument,
  getProjectDocumentByPath,
  getProjectDocumentOutlines,
  getProjectDocumentSections,
  getProjectDocTree,
} from "./projectDocs/index.js";
