export default function ProjectDocsSidebar({
  activeDocumentId,
  activeSectionId,
  documents,
  expandedDocumentIds,
  onSelectDocument,
  onSelectSection,
  onToggleDocument,
}) {
  return (
    <nav className="project-doc-sidebar" aria-label="Project documentation">
      <div className="project-doc-nav-pages">
        {documents.map((documentItem) => {
          const isExpanded = expandedDocumentIds.includes(documentItem.id);
          const isActiveDocument = activeDocumentId === documentItem.id;

          return (
            <div className="project-doc-tree-group" key={documentItem.id}>
              <div
                className={`project-doc-tree-parent ${
                  isActiveDocument ? "is-active" : ""
                }`}
              >
                <button
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
                    documentItem.title
                  }`}
                  className="project-doc-tree-toggle"
                  onClick={() => onToggleDocument(documentItem.id)}
                  type="button"
                >
                  <span aria-hidden="true">›</span>
                </button>
                <button
                  className="project-doc-tree-document"
                  onClick={() => onSelectDocument(documentItem.id)}
                  type="button"
                >
                  {documentItem.title}
                </button>
              </div>

              <div
                className={`project-doc-tree-children ${
                  isExpanded ? "is-expanded" : ""
                }`}
              >
                <div>
                  {documentItem.sections.map((section) => (
                    <button
                      className={`project-doc-tree-section project-doc-tree-section-level-${section.level} ${
                        activeSectionId === section.id ? "is-active" : ""
                      }`}
                      key={section.id}
                      onClick={() =>
                        onSelectSection(documentItem.id, section.id)
                      }
                      type="button"
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
