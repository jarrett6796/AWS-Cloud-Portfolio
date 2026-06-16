export default function ProjectDocsSidebar({
  documents,
  activeSectionId,
  expandedDocumentIds,
  onToggleDocument,
  onSelectSection,
}) {
  return (
    <nav className="project-doc-sidebar" aria-label="Project documentation">
      {documents.map((documentItem) => {
        const isOpen = expandedDocumentIds.includes(documentItem.id);

        return (
          <div className="project-doc-nav-section" key={documentItem.id}>
            <button
              className={isOpen ? "is-open" : ""}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`project-doc-nav-${documentItem.id}`}
              onClick={() => onToggleDocument(documentItem.id)}
            >
              <span aria-hidden="true">{isOpen ? "v" : ">"}</span>
              {documentItem.title}
            </button>

            <div
              className="project-doc-nav-pages"
              id={`project-doc-nav-${documentItem.id}`}
            >
              <div>
                {documentItem.sections.map((section) => (
                  <button
                    className={activeSectionId === section.id ? "is-active" : ""}
                    key={section.id}
                    type="button"
                    onClick={() => onSelectSection(section.id)}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
