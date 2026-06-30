import { useEffect, useMemo, useRef, useState } from "react";
import ProjectDocsSidebar from "./ProjectDocsSidebar";
import ProjectDocsViewer from "./ProjectDocsViewer";
import {
  getProjectDocTree,
  getProjectDocumentByPath,
  getProjectDocumentSections,
} from "../content/projectDocs";

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

function findFirstFile(nodes) {
  for (const node of nodes) {
    if (node.type === "file") return node;
    if (node.type === "folder") {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
}

function findFirstFileInNode(node) {
  if (node.type === "file") return node;
  for (const child of node.children) {
    const found = findFirstFileInNode(child);
    if (found) return found;
  }
  return null;
}

function findFileNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.type === "file" && node.id === id) return node;
    if (node.type === "folder") {
      const found = findFileNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getParentFolderIds(fileId) {
  const parts = fileId.split("/");
  const result = new Set();
  for (let i = 1; i < parts.length; i++) {
    result.add(parts.slice(0, i).join("/"));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectModal({
  selectedProject,
  language,
  theme,
  content,
  onClose,
  setLanguage,
  onToggleTheme,
}) {
  const viewerRef = useRef(null);

  // -- Document tree (built from file paths, no markdown parsing) -----------
  const docTree = useMemo(
    () => getProjectDocTree(selectedProject, language),
    [selectedProject, language],
  );

  // -- Default file: first file in tree -------------------------------------
  const defaultFileNode = useMemo(() => findFirstFile(docTree) ?? null, [docTree]);
  const defaultFileId = defaultFileNode?.id ?? null;

  // -- State ----------------------------------------------------------------
  const [viewMode, setViewMode] = useState("file"); // "file" | "folder"
  const [activeFileNode, setActiveFileNode] = useState(defaultFileNode);
  const [activeFolderNode, setActiveFolderNode] = useState(null);

  // Expanded folder state is derived from three parts so that auto-expand
  // and manual user toggles never fight each other:
  //   expandedFolderIds = (autoExpandedIds ∪ userExpandedIds) − userCollapsedIds
  //
  // autoExpandedIds  — driven by navigation (file clicks, scroll spy)
  // userExpandedIds  — folders the user explicitly opened
  // userCollapsedIds — folders the user explicitly closed (overrides auto)
  const [autoExpandedIds, setAutoExpandedIds] = useState(
    () => (defaultFileNode ? getParentFolderIds(defaultFileNode.id) : new Set()),
  );
  const [userExpandedIds, setUserExpandedIds] = useState(() => new Set());
  const [userCollapsedIds, setUserCollapsedIds] = useState(() => new Set());

  const expandedFolderIds = useMemo(() => {
    const result = new Set([...autoExpandedIds, ...userExpandedIds]);
    userCollapsedIds.forEach((id) => result.delete(id));
    return result;
  }, [autoExpandedIds, userExpandedIds, userCollapsedIds]);

  const [activeSectionId, setActiveSectionId] = useState("");
  const [pendingSectionId, setPendingSectionId] = useState(null);
  const [folderModeSections, setFolderModeSections] = useState([]);
  const [isDocsSidebarCollapsed, setIsDocsSidebarCollapsed] = useState(false);

  // -- Reading position cache — persists scroll position per document/folder
  //    while the modal remains open; cleared on project/language change.
  const readingStateCacheRef = useRef(new Map()); // docId → { scrollTop }
  const prevDocIdRef = useRef(null);

  // -- Reset state when project or language changes -------------------------
  const [prevDefaultFileId, setPrevDefaultFileId] = useState(defaultFileId);
  if (defaultFileId !== prevDefaultFileId) {
    setPrevDefaultFileId(defaultFileId);
    setViewMode("file");
    setActiveFileNode(defaultFileNode);
    setActiveFolderNode(null);
    setFolderModeSections([]);
    setAutoExpandedIds(
      defaultFileNode ? getParentFolderIds(defaultFileNode.id) : new Set(),
    );
    setUserExpandedIds(new Set());
    setUserCollapsedIds(new Set());
    setActiveSectionId("");
    setPendingSectionId(null);
  }

  // Clear reading position cache when the project / language changes.
  useEffect(() => {
    readingStateCacheRef.current.clear();
    prevDocIdRef.current = null;
  }, [defaultFileId]);

  // -- Active document (file mode only, parsed on demand) -------------------
  const activeDocument = useMemo(
    () =>
      viewMode === "file" && activeFileNode
        ? getProjectDocumentByPath(selectedProject, activeFileNode)
        : null,
    [viewMode, activeFileNode, selectedProject],
  );

  // Sections shown in sidebar: file mode uses parsed doc; folder mode uses cache.
  const activeSections =
    viewMode === "file" ? (activeDocument?.sections ?? []) : folderModeSections;

  // The "logical document ID" that uniquely identifies what is currently shown.
  // Changes whenever the user navigates to a different file or folder.
  const currentDocId = activeDocument?.id ?? activeFolderNode?.id ?? null;

  // -- Refs for stable scroll handler (avoids stale closures) ---------------
  const viewModeRef = useRef(viewMode);
  const activeFileNodeRef = useRef(activeFileNode);
  const docTreeRef = useRef(docTree);
  const selectedProjectRef = useRef(selectedProject);

  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { activeFileNodeRef.current = activeFileNode; }, [activeFileNode]);
  useEffect(() => { docTreeRef.current = docTree; }, [docTree]);
  useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);

  // -- Restore scroll position when the current document changes -------------
  //
  // Scroll position is saved explicitly in selectFile / selectFolder before
  // state changes. This effect only handles restoration (returning visitor) or
  // smooth scroll to top (first visit).
  //
  // prevDocIdRef guards against React StrictMode double-invocation: the first
  // run updates prevDocIdRef to currentDocId so the second run detects no
  // change and skips, leaving the first run's animation intact.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || currentDocId === null) return;

    const savedState = readingStateCacheRef.current.get(currentDocId);
    if (savedState && savedState.scrollTop > 0) {
      // Returning to a previously visited document — restore instantly.
      viewer.scrollTo({ top: savedState.scrollTop, behavior: "instant" });
    } else if (prevDocIdRef.current !== currentDocId) {
      // First visit — jump to top (content change is already the visual transition).
      viewer.scrollTo({ top: 0, behavior: "instant" });
    }

    prevDocIdRef.current = currentDocId;
  }, [currentDocId]);

  // -- Scroll to pending section after render --------------------------------
  useEffect(() => {
    if (!pendingSectionId || !viewerRef.current) return;
    const target = viewerRef.current.querySelector(
      `[data-section-id="${pendingSectionId}"]`,
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionId(pendingSectionId);
      setPendingSectionId(null);
    }
  }, [pendingSectionId, activeDocument?.id, activeFolderNode?.id]);

  // -- Unified scroll-spy (file mode: headings; folder mode: file + headings)
  //
  // All mutable values are accessed through refs so the listener is created
  // once and never stale. useState setters (setActiveFileNode, etc.) are
  // stable across renders and safe to call from a captured closure.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    const updateScrollSpy = () => {
      const viewerTop = viewer.getBoundingClientRect().top;

      // Track visible heading (both modes).
      const sectionElements = [...viewer.querySelectorAll("[data-section-id]")];
      if (sectionElements.length > 0) {
        const closest = sectionElements
          .map((el) => ({
            id: el.dataset.sectionId,
            distance: Math.abs(el.getBoundingClientRect().top - viewerTop),
          }))
          .sort((a, b) => a.distance - b.distance)[0];
        if (closest?.id) setActiveSectionId(closest.id);
      }

      // Folder mode: also track visible file section.
      if (viewModeRef.current === "folder") {
        const fileSections = [...viewer.querySelectorAll("[data-file-section-id]")];
        if (fileSections.length === 0) return;

        const closestFile = fileSections
          .map((el) => ({
            id: el.dataset.fileSectionId,
            distance: Math.abs(el.getBoundingClientRect().top - viewerTop),
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (closestFile?.id && closestFile.id !== activeFileNodeRef.current?.id) {
          const newFileNode = findFileNodeById(docTreeRef.current, closestFile.id);
          if (newFileNode) {
            activeFileNodeRef.current = newFileNode;
            setActiveFileNode(newFileNode);
            const sections = getProjectDocumentSections(
              selectedProjectRef.current,
              newFileNode,
            );
            setFolderModeSections(sections);

            // Adaptive sidebar: auto-expand ancestors of the newly visible file.
            const newAncestors = getParentFolderIds(newFileNode.id);
            setAutoExpandedIds(newAncestors);

            // Clear any manual-collapse the user set for the new active path —
            // the user is physically reading there, so it should be open.
            setUserCollapsedIds((prev) => {
              let changed = false;
              const next = new Set(prev);
              newAncestors.forEach((id) => {
                if (next.has(id)) { next.delete(id); changed = true; }
              });
              return changed ? next : prev;
            });
          }
        }
      }

    };

    viewer.addEventListener("scroll", updateScrollSpy, { passive: true });
    return () => viewer.removeEventListener("scroll", updateScrollSpy);
  }, []); // stable — mutable values accessed via refs

  // -- Navigation handlers --------------------------------------------------

  const selectFile = (fileNode) => {
    if (viewMode === "file" && fileNode.path === activeFileNode?.path) return;

    // Save current document's scroll position before switching.
    const outgoingId = currentDocId;
    if (outgoingId && viewerRef.current) {
      readingStateCacheRef.current.set(outgoingId, {
        scrollTop: viewerRef.current.scrollTop,
      });
    }

    setViewMode("file");
    setActiveFolderNode(null);
    setFolderModeSections([]);
    setActiveFileNode(fileNode);
    setActiveSectionId("");
    setPendingSectionId(null);
    // Auto-expand ancestors of the selected file.
    setAutoExpandedIds(getParentFolderIds(fileNode.id));
  };

  const selectFolder = (folderNode) => {
    // Save current document's scroll position before switching.
    const outgoingId = currentDocId;
    if (outgoingId && viewerRef.current) {
      readingStateCacheRef.current.set(outgoingId, {
        scrollTop: viewerRef.current.scrollTop,
      });
    }

    setViewMode("folder");
    setActiveFolderNode(folderNode);
    setActiveSectionId("");
    setPendingSectionId(null);

    const firstFile = findFirstFileInNode(folderNode);
    if (firstFile) {
      setActiveFileNode(firstFile);
      setFolderModeSections(
        getProjectDocumentSections(selectedProject, firstFile),
      );
      // Auto-expand ancestors of the first file (includes the folder itself).
      setAutoExpandedIds(getParentFolderIds(firstFile.id));
    } else {
      // Folder with no files — just expand it.
      setAutoExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(folderNode.id);
        return next;
      });
    }
  };

  const toggleFolder = (folderId) => {
    if (expandedFolderIds.has(folderId)) {
      // User is manually collapsing — record override, clear any manual-expand.
      setUserCollapsedIds((prev) => {
        const next = new Set(prev);
        next.add(folderId);
        return next;
      });
      setUserExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    } else {
      // User is manually expanding — record intent, clear any manual-collapse.
      setUserExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(folderId);
        return next;
      });
      setUserCollapsedIds((prev) => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    }
  };

  const selectSection = (sectionId) => {
    setPendingSectionId(sectionId);
  };

  // -- Render ---------------------------------------------------------------

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <section
        className="project-modal project-doc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="project-modal-header">
          <div className="project-modal-title-group">
            <h2 id="project-detail-title">{selectedProject.title}</h2>
          </div>

          <div className="project-modal-controls">
            <div
              className="language-switch modal-language-switch"
              role="group"
              aria-label={content.controls.language}
            >
              <button
                className={language === "en" ? "is-active" : ""}
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
              >
                EN
              </button>
              <button
                className={language === "zh-TW" ? "is-active" : ""}
                type="button"
                onClick={() => setLanguage("zh-TW")}
                aria-pressed={language === "zh-TW"}
              >
                繁中
              </button>
            </div>

            <button
              className="theme-toggle modal-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === "light"
                  ? content.controls.switchToDark
                  : content.controls.switchToLight
              }
            >
              <span className="theme-icon" aria-hidden="true">
                {theme === "light" ? "☾" : "☀"}
              </span>
            </button>

            <button
              className="project-modal-close"
              type="button"
              onClick={onClose}
              aria-label={content.projects.closeModal}
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>
        </div>

        <div className="project-docs-shell">
          <div
            className={`project-docs-layout ${
              isDocsSidebarCollapsed ? "is-sidebar-collapsed" : ""
            }`}
          >
            <ProjectDocsSidebar
              activeFilePath={activeFileNode?.path ?? null}
              activeFolderPath={activeFolderNode?.id ?? null}
              activeSectionId={activeSectionId}
              activeSections={activeSections}
              expandedFolderIds={expandedFolderIds}
              onSelectFile={selectFile}
              onSelectFolder={selectFolder}
              onSelectSection={selectSection}
              onToggleFolder={toggleFolder}
              tree={docTree}
            />
            <div className="project-doc-content-shell">
              <button
                aria-label={
                  isDocsSidebarCollapsed
                    ? "Open documentation sidebar"
                    : "Collapse documentation sidebar"
                }
                aria-pressed={isDocsSidebarCollapsed}
                className="project-doc-sidebar-collapse"
                onClick={() => setIsDocsSidebarCollapsed((value) => !value)}
                title={
                  isDocsSidebarCollapsed
                    ? "Open documentation sidebar"
                    : "Collapse documentation sidebar"
                }
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="18"
                  viewBox="0 0 18 18"
                  width="18"
                >
                  <rect height="13" rx="2" width="13" x="2.5" y="2.5" />
                  <path d="M7 3v12" />
                  <path
                    d={
                      isDocsSidebarCollapsed
                        ? "M10 7l2 2-2 2"
                        : "M12 7l-2 2 2 2"
                    }
                  />
                </svg>
              </button>
              <ProjectDocsViewer
                document={viewMode === "file" ? activeDocument : null}
                folderNode={viewMode === "folder" ? activeFolderNode : null}
                selectedProject={selectedProject}
                viewerRef={viewerRef}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
