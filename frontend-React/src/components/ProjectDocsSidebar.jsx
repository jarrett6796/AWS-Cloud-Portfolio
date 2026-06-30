/**
 * ProjectDocsSidebar — Documentation Explorer sidebar.
 *
 * Renders a recursive tree of FolderNodes and FileNodes built from the
 * project's markdown directory structure. Folders expand/collapse on click.
 * Clicking a folder name triggers folder reading mode (onSelectFolder).
 * Heading navigation is shown only under the currently active document.
 */

// ---------------------------------------------------------------------------
// Heading section tree (H1 → H2 hierarchy)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// File node — a clickable document button with optional section list
// ---------------------------------------------------------------------------

function FileNode({
  node,
  activeFilePath,
  activeSectionId,
  activeSections,
  onSelectFile,
  onSelectSection,
}) {
  const isActive = activeFilePath === node.path;
  const sectionTree = isActive ? buildSectionTree(activeSections) : [];

  return (
    <div className="project-doc-tree-group">
      <div
        className={`project-doc-tree-parent project-doc-tree-parent--file ${
          isActive ? "is-active" : ""
        }`}
      >
        <button
          className="project-doc-tree-document"
          onClick={() => onSelectFile(node)}
          type="button"
        >
          {node.name}
        </button>
      </div>

      {isActive && sectionTree.length > 0 && (
        <div className="project-doc-tree-children is-expanded">
          <div>
            {sectionTree.map((sectionNode) => (
              <SectionTreeNode
                activeSectionId={activeSectionId}
                key={sectionNode.section.id}
                node={sectionNode}
                onSelectSection={onSelectSection}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Folder node — collapsible group with recursive children
// ---------------------------------------------------------------------------

function FolderNode({
  node,
  activeFilePath,
  activeFolderPath,
  activeSectionId,
  activeSections,
  expandedFolderIds,
  onSelectFile,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
  depth,
}) {
  const isExpanded = expandedFolderIds.has(node.id);
  const isFolderActive = activeFolderPath === node.id;

  return (
    <div className="project-doc-tree-folder">
      <div
        className={`project-doc-tree-parent project-doc-tree-parent--folder ${
          isFolderActive ? "is-active" : ""
        }`}
      >
        <button
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name}`}
          className="project-doc-tree-toggle"
          onClick={() => onToggleFolder(node.id)}
          type="button"
        >
          <span aria-hidden="true">›</span>
        </button>
        <button
          className={`project-doc-tree-folder-name ${isFolderActive ? "is-active" : ""}`}
          onClick={() => onSelectFolder(node)}
          type="button"
        >
          {node.name}
        </button>
      </div>

      <div
        className={`project-doc-tree-children ${isExpanded ? "is-expanded" : ""}`}
      >
        <div>
          <TreeChildren
            activeFilePath={activeFilePath}
            activeFolderPath={activeFolderPath}
            activeSectionId={activeSectionId}
            activeSections={activeSections}
            expandedFolderIds={expandedFolderIds}
            nodes={node.children}
            onSelectFile={onSelectFile}
            onSelectFolder={onSelectFolder}
            onSelectSection={onSelectSection}
            onToggleFolder={onToggleFolder}
            depth={depth + 1}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tree renderer — dispatches to FolderNode or FileNode
// ---------------------------------------------------------------------------

function TreeChildren({
  nodes,
  activeFilePath,
  activeFolderPath,
  activeSectionId,
  activeSections,
  expandedFolderIds,
  onSelectFile,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
  depth,
}) {
  return nodes.map((node) =>
    node.type === "folder" ? (
      <FolderNode
        activeFilePath={activeFilePath}
        activeFolderPath={activeFolderPath}
        activeSectionId={activeSectionId}
        activeSections={activeSections}
        expandedFolderIds={expandedFolderIds}
        key={node.id}
        node={node}
        onSelectFile={onSelectFile}
        onSelectFolder={onSelectFolder}
        onSelectSection={onSelectSection}
        onToggleFolder={onToggleFolder}
        depth={depth}
      />
    ) : (
      <FileNode
        activeFilePath={activeFilePath}
        activeSectionId={activeSectionId}
        activeSections={activeSections}
        key={node.id}
        node={node}
        onSelectFile={onSelectFile}
        onSelectSection={onSelectSection}
      />
    ),
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function ProjectDocsSidebar({
  activeFilePath,
  activeFolderPath,
  activeSectionId,
  activeSections,
  expandedFolderIds,
  onSelectFile,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
  tree,
}) {
  return (
    <nav className="project-doc-sidebar" aria-label="Project documentation">
      <div className="project-doc-nav-pages">
        <TreeChildren
          activeFilePath={activeFilePath}
          activeFolderPath={activeFolderPath}
          activeSectionId={activeSectionId}
          activeSections={activeSections}
          expandedFolderIds={expandedFolderIds}
          nodes={tree}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
          onSelectSection={onSelectSection}
          onToggleFolder={onToggleFolder}
          depth={0}
        />
      </div>
    </nav>
  );
}
