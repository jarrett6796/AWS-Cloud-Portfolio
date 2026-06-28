function buildSectionTree(sections) {
  const sectionTree = [];
  let currentParent = null;

  sections.forEach((section) => {
    const sectionNode = { section, children: [] };

    if (section.level === 1) {
      sectionTree.push(sectionNode);
      currentParent = sectionNode;
      return;
    }

    if (section.level === 2 && currentParent) {
      currentParent.children.push(sectionNode);
      return;
    }

    sectionTree.push(sectionNode);
  });

  return sectionTree;
}

function SectionTreeNode({ activeSectionId, node, onSelectSection }) {
  const { section, children } = node;

  return (
    <div
      className={`project-doc-tree-section-node project-doc-tree-section-node-level-${section.level}`}
    >
      <button
        className={`project-doc-tree-section project-doc-tree-section-level-${section.level} ${
          activeSectionId === section.id ? "is-active" : ""
        }`}
        onClick={() => onSelectSection(section.id)}
        type="button"
      >
        {section.title}
      </button>

      {children.length > 0 && (
        <div className="project-doc-tree-section-children">
          {children.map((childNode) => (
            <SectionTreeNode
              activeSectionId={activeSectionId}
              key={childNode.section.id}
              node={childNode}
              onSelectSection={onSelectSection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
          const sectionTree = buildSectionTree(documentItem.sections);

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
                  {sectionTree.map((sectionNode) => (
                    <SectionTreeNode
                      activeSectionId={activeSectionId}
                      key={sectionNode.section.id}
                      node={sectionNode}
                      onSelectSection={(sectionId) =>
                        onSelectSection(documentItem.id, sectionId)
                      }
                    />
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
