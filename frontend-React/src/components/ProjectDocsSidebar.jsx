/**
 * ProjectDocsSidebar — Documentation navigation sidebar.
 *
 * Three-level hierarchy: Category (folder) → Document (file) → Section (H1)
 *
 * Single-file category: a folder whose entire subtree contains exactly one
 *   Markdown file, regardless of the file's name or how deeply it is nested.
 *   The filename is hidden; the folder acts as the document entry and its H1
 *   headings appear directly beneath the category when expanded and active.
 *
 * Multi-file category: a folder containing more than one Markdown file.
 *   Documents are listed as children; only the active document expands to
 *   reveal its H1 headings.
 *
 * Empty folders (no Markdown files anywhere in their subtree) are not rendered.
 */

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Node helpers
// ---------------------------------------------------------------------------

/** Total Markdown files in a folder's subtree. */
function countFilesInNode(node) {
  if (node.type === "file") return 1;
  return node.children.reduce((sum, child) => sum + countFilesInNode(child), 0);
}

/** True when a folder's entire subtree contains exactly one Markdown file. */
function isSingleFileCategory(folderNode) {
  return countFilesInNode(folderNode) === 1;
}

/** Returns the first (depth-first) file node found in a subtree. */
function findFirstFileInNode(node) {
  if (node.type === "file") return node;
  for (const child of node.children) {
    const found = findFirstFileInNode(child);
    if (found) return found;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Section item — H1 heading navigation link
// ---------------------------------------------------------------------------

function SectionItem({ section, activeSectionId, onSelectSection }) {
  return (
    <button
      className={`project-doc-tree-section ${
        activeSectionId === section.id ? "is-active" : ""
      }`}
      onClick={() => onSelectSection(section.id)}
      type="button"
    >
      {section.title}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Document node — a visible Markdown file inside a multi-file category
// Shows its H1 headings only when it is the active document.
// ---------------------------------------------------------------------------

function DocumentNode({
  node,
  activeFilePath,
  activeSectionId,
  activeSections,
  onSelectFile,
  onSelectSection,
}) {
  const isActive = activeFilePath === node.path;

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

      {isActive && activeSections.length > 0 && (
        <div className="project-doc-tree-children is-expanded">
          <div>
            {activeSections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                activeSectionId={activeSectionId}
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
// Single-file category node
// The folder acts as the document entry — the filename is never shown.
// H1 headings appear directly beneath the category when it is both expanded
// and the active document. The single file may be nested at any depth.
// ---------------------------------------------------------------------------

function SingleFileCategoryNode({
  node,
  activeFilePath,
  activeSectionId,
  activeSections,
  activeFolderIds,
  isExpanded,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
}) {
  const fileNode = findFirstFileInNode(node);
  const isFileActive = fileNode !== null && activeFilePath === fileNode.path;
  const isCategoryActive = activeFolderIds.has(node.id);

  return (
    <div className="project-doc-tree-folder">
      <div
        className={`project-doc-tree-parent project-doc-tree-parent--folder ${
          isCategoryActive ? "is-active" : ""
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
          className={`project-doc-tree-folder-name ${
            isCategoryActive ? "is-active" : ""
          }`}
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
          {isFileActive &&
            activeSections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                activeSectionId={activeSectionId}
                onSelectSection={onSelectSection}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category node — folder with more than one Markdown file
// ---------------------------------------------------------------------------

function CategoryNode({
  node,
  activeFilePath,
  activeSectionId,
  activeSections,
  activeFolderIds,
  expandedFolderIds,
  onSelectFile,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
}) {
  const isExpanded = expandedFolderIds.has(node.id);
  const isCategoryActive = activeFolderIds.has(node.id);

  return (
    <div className="project-doc-tree-folder">
      <div
        className={`project-doc-tree-parent project-doc-tree-parent--folder ${
          isCategoryActive ? "is-active" : ""
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
          className={`project-doc-tree-folder-name ${
            isCategoryActive ? "is-active" : ""
          }`}
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
            nodes={node.children}
            activeFilePath={activeFilePath}
            activeSectionId={activeSectionId}
            activeSections={activeSections}
            activeFolderIds={activeFolderIds}
            expandedFolderIds={expandedFolderIds}
            onSelectFile={onSelectFile}
            onSelectFolder={onSelectFolder}
            onSelectSection={onSelectSection}
            onToggleFolder={onToggleFolder}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tree renderer — dispatches each node to the correct component
// ---------------------------------------------------------------------------

function TreeChildren({
  nodes,
  activeFilePath,
  activeSectionId,
  activeSections,
  activeFolderIds,
  expandedFolderIds,
  onSelectFile,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
}) {
  return nodes.map((node) => {
    if (node.type === "folder") {
      // Rule 7: skip folders that contain no Markdown files at any depth.
      if (countFilesInNode(node) === 0) return null;

      if (isSingleFileCategory(node)) {
        return (
          <SingleFileCategoryNode
            key={node.id}
            node={node}
            activeFilePath={activeFilePath}
            activeSectionId={activeSectionId}
            activeSections={activeSections}
            activeFolderIds={activeFolderIds}
            isExpanded={expandedFolderIds.has(node.id)}
            onSelectFolder={onSelectFolder}
            onSelectSection={onSelectSection}
            onToggleFolder={onToggleFolder}
          />
        );
      }

      return (
        <CategoryNode
          key={node.id}
          node={node}
          activeFilePath={activeFilePath}
          activeSectionId={activeSectionId}
          activeSections={activeSections}
          activeFolderIds={activeFolderIds}
          expandedFolderIds={expandedFolderIds}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
          onSelectSection={onSelectSection}
          onToggleFolder={onToggleFolder}
        />
      );
    }

    // Root-level file (no enclosing folder in the tree)
    return (
      <DocumentNode
        key={node.id}
        node={node}
        activeFilePath={activeFilePath}
        activeSectionId={activeSectionId}
        activeSections={activeSections}
        onSelectFile={onSelectFile}
        onSelectSection={onSelectSection}
      />
    );
  });
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function ProjectDocsSidebar({
  activeFilePath,
  activeFolderIds,
  activeSectionId,
  activeSections,
  expandedFolderIds,
  onSelectFile,
  onSelectFolder,
  onSelectSection,
  onToggleFolder,
  tree,
}) {
  const navRef = useRef(null);

  // Keep the active sidebar item visible by scrolling it into view when the
  // active file or section changes. We only scroll when the item is outside
  // the visible scroll port to avoid jarring jumps on user interaction.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeEl =
      nav.querySelector("button.project-doc-tree-section.is-active") ??
      nav.querySelector(".project-doc-tree-parent--file.is-active") ??
      nav.querySelector("button.project-doc-tree-folder-name.is-active");

    if (!activeEl) return;

    const navRect = nav.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();

    if (elRect.top < navRect.top || elRect.bottom > navRect.bottom) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeFilePath, activeSectionId]);

  return (
    <nav
      className="project-doc-sidebar"
      aria-label="Project documentation"
      ref={navRef}
    >
      <div className="project-doc-nav-pages">
        <TreeChildren
          nodes={tree}
          activeFilePath={activeFilePath}
          activeSectionId={activeSectionId}
          activeSections={activeSections}
          activeFolderIds={activeFolderIds}
          expandedFolderIds={expandedFolderIds}
          onSelectFile={onSelectFile}
          onSelectFolder={onSelectFolder}
          onSelectSection={onSelectSection}
          onToggleFolder={onToggleFolder}
        />
      </div>
    </nav>
  );
}
