import { useEffect, useMemo, useRef, useState } from "react";
import ProjectDocsSidebar from "./ProjectDocsSidebar";
import SidebarAccordionGroup from "./SidebarAccordionGroup";
import ResourceLinks from "./ResourceLinks";
import ProjectJourneyNav from "./ProjectJourneyNav";
import ContinuousJourneyReader from "./ContinuousJourneyReader";
import ContinuousDocReader from "./ContinuousDocReader";
import {
  getProjectDocTree,
  getProjectDocumentSections,
} from "../content/projectDocs";
import { flattenTreeToReadingList } from "../utils/docReaderTree.js";

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

function findFirstFileInNode(node) {
  if (node.type === "file") return node;
  for (const child of node.children) {
    const found = findFirstFileInNode(child);
    if (found) return found;
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

  // -- Document tree and flat reading list ----------------------------------
  const docTree = useMemo(
    () => getProjectDocTree(selectedProject, language),
    [selectedProject, language],
  );

  // Flat ordered list of every file in reading order. Shared with the
  // ContinuousDocReader so both always use the same order.
  const readingList = useMemo(
    () => flattenTreeToReadingList(docTree),
    [docTree],
  );

  const defaultFileNode = useMemo(
    () => readingList[0]?.fileNode ?? null,
    [readingList],
  );
  const defaultFileId = defaultFileNode?.id ?? null;

  // -- State ----------------------------------------------------------------
  const [activeFileNode, setActiveFileNode] = useState(defaultFileNode);

  // Three-part expansion model:
  //   expandedFolderIds = (autoExpandedIds ∪ userExpandedIds) − userCollapsedIds
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
  const [isDocsSidebarCollapsed, setIsDocsSidebarCollapsed] = useState(false);

  // -- Project Journey state -------------------------------------------------
  // Each project supplies its own timeline via selectedProject.journeySteps
  // (content.projects.projectJourney only holds shared UI labels below) —
  // this is what keeps each project's Journey independent of the others.
  const journeySteps = selectedProject.journeySteps ?? [];
  const [expandedGroup, setExpandedGroup] = useState("journey");
  const [activeJourneyId, setActiveJourneyId] = useState(
    journeySteps[0]?.id ?? null,
  );
  // Sub-outline entry within the active chapter (null for chapters that have
  // no sub-outline). Reading always starts from the first sub-outline item.
  const [activeJourneySubId, setActiveJourneySubId] = useState(
    journeySteps[0]?.subsections?.[0]?.id ?? null,
  );

  // Reset journey navigation whenever a different project is opened.
  const [prevProjectId, setPrevProjectId] = useState(selectedProject.id);
  if (selectedProject.id !== prevProjectId) {
    setPrevProjectId(selectedProject.id);
    setExpandedGroup("journey");
    setActiveJourneyId(journeySteps[0]?.id ?? null);
    setActiveJourneySubId(journeySteps[0]?.subsections?.[0]?.id ?? null);
  }

  // -- Stable refs for scroll-spy (avoids stale closures) ------------------
  const activeFileNodeRef = useRef(activeFileNode);
  const readingListRef = useRef(readingList);
  const activeJourneyIdRef = useRef(activeJourneyId);
  const activeJourneySubIdRef = useRef(activeJourneySubId);
  useEffect(() => { activeFileNodeRef.current = activeFileNode; }, [activeFileNode]);
  useEffect(() => { readingListRef.current = readingList; }, [readingList]);
  useEffect(() => { activeJourneyIdRef.current = activeJourneyId; }, [activeJourneyId]);
  useEffect(() => { activeJourneySubIdRef.current = activeJourneySubId; }, [activeJourneySubId]);

  // -- Reset when project or language changes -------------------------------
  const [prevDefaultFileId, setPrevDefaultFileId] = useState(defaultFileId);
  if (defaultFileId !== prevDefaultFileId) {
    setPrevDefaultFileId(defaultFileId);
    setActiveFileNode(defaultFileNode);
    setAutoExpandedIds(
      defaultFileNode ? getParentFolderIds(defaultFileNode.id) : new Set(),
    );
    setUserExpandedIds(new Set());
    setUserCollapsedIds(new Set());
    setActiveSectionId("");
    setPendingSectionId(null);
  }

  // Scroll the reader back to the top when the project / language changes.
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [defaultFileId]);

  // Journey and Documentation share the same scroll container; reset to the
  // top whenever the visible accordion changes so switching never leaves the
  // newly shown reader mid-scroll relative to unrelated content.
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [expandedGroup]);

  // -- Sidebar data derived from active file --------------------------------

  // Lightweight heading extraction — no full block parse needed here.
  const activeSections = useMemo(
    () =>
      activeFileNode
        ? getProjectDocumentSections(selectedProject, activeFileNode)
        : [],
    [activeFileNode, selectedProject],
  );

  // Ancestor folder IDs of the active file — used to highlight the active
  // category path in the sidebar.
  const activeFolderIds = useMemo(
    () =>
      activeFileNode ? getParentFolderIds(activeFileNode.id) : new Set(),
    [activeFileNode],
  );

  // -- Scroll to pending section after render -------------------------------
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
  }, [pendingSectionId, activeFileNode?.id]);

  // -- Scroll-spy: continuous reader tracks both active file and section ----
  //
  // All mutable state is accessed through refs so the listener is created
  // once and never goes stale.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    const updateScrollSpy = () => {
      const viewerRect = viewer.getBoundingClientRect();

      // ---- Active document -----------------------------------------------
      // "Active" = the last file section whose top edge is at or above
      // 50 px below the viewer's top edge. This matches natural reading:
      // a document becomes active as it reaches the upper portion of view.
      const fileSections = [
        ...viewer.querySelectorAll("[data-reader-file-id]"),
      ];
      if (fileSections.length > 0) {
        const threshold = viewerRect.top + 50;
        let activeSection = null;
        for (const el of fileSections) {
          if (el.getBoundingClientRect().top <= threshold) {
            activeSection = el;
          }
        }

        if (activeSection) {
          const newFileId = activeSection.dataset.readerFileId;
          if (newFileId !== activeFileNodeRef.current?.id) {
            const newItem = readingListRef.current.find(
              (item) => item.fileNode.id === newFileId,
            );
            if (newItem) {
              activeFileNodeRef.current = newItem.fileNode;
              setActiveFileNode(newItem.fileNode);

              // Keep the active path expanded in the sidebar.
              const ancestors = getParentFolderIds(newItem.fileNode.id);
              setAutoExpandedIds(ancestors);
              setUserCollapsedIds((prev) => {
                let changed = false;
                const next = new Set(prev);
                ancestors.forEach((id) => {
                  if (next.has(id)) { next.delete(id); changed = true; }
                });
                return changed ? next : prev;
              });
            }
          }
        }
      }

      // ---- Active Project Journey step ------------------------------------
      // Same "last section whose top edge has crossed the threshold" rule,
      // applied to journey steps instead of documentation files.
      const journeySections = [
        ...viewer.querySelectorAll("[data-journey-step-id]"),
      ];
      if (journeySections.length > 0) {
        const threshold = viewerRect.top + 50;
        let activeJourneySection = null;
        for (const el of journeySections) {
          if (el.getBoundingClientRect().top <= threshold) {
            activeJourneySection = el;
          }
        }

        if (activeJourneySection) {
          const newStepId = activeJourneySection.dataset.journeyStepId;
          const newSubId = activeJourneySection.dataset.journeySubId || null;
          if (
            newStepId !== activeJourneyIdRef.current ||
            newSubId !== activeJourneySubIdRef.current
          ) {
            activeJourneyIdRef.current = newStepId;
            activeJourneySubIdRef.current = newSubId;
            setActiveJourneyId(newStepId);
            setActiveJourneySubId(newSubId);
          }
        }
      }

      // ---- Active section heading ----------------------------------------
      const sectionEls = [
        ...viewer.querySelectorAll("[data-section-id]"),
      ];
      if (sectionEls.length === 0) return;

      const closest = sectionEls
        .map((el) => ({
          id: el.dataset.sectionId,
          distance: Math.abs(el.getBoundingClientRect().top - viewerRect.top),
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (closest?.id) setActiveSectionId(closest.id);
    };

    viewer.addEventListener("scroll", updateScrollSpy, { passive: true });
    return () => viewer.removeEventListener("scroll", updateScrollSpy);
  }, []);

  // -- Navigation handlers --------------------------------------------------

  // Expand ancestor folders and clear any manual-collapse overrides.
  function expandPath(ancestors) {
    setAutoExpandedIds(ancestors);
    setUserCollapsedIds((prev) => {
      let changed = false;
      const next = new Set(prev);
      ancestors.forEach((id) => {
        if (next.has(id)) { next.delete(id); changed = true; }
      });
      return changed ? next : prev;
    });
  }

  // Scroll within the continuous reader to the given file section.
  function scrollToFile(fileNode) {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const target = viewer.querySelector(
      `[data-reader-file-id="${fileNode.id}"]`,
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Scroll within the continuous journey reader to the given step section.
  function scrollToJourneyStep(stepId) {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const target = viewer.querySelector(`[data-journey-step-id="${stepId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const selectJourneyStep = (stepId) => {
    // Instant sidebar feedback (matches selectFile's pattern); the scroll-spy
    // reconciles activeJourneySubId once the smooth scroll settles.
    const step = journeySteps.find((candidate) => candidate.id === stepId);
    setActiveJourneyId(stepId);
    setActiveJourneySubId(step?.subsections?.[0]?.id ?? null);
    scrollToJourneyStep(stepId);
  };

  const selectFile = (fileNode) => {
    // Update active state immediately for instant sidebar feedback,
    // then scroll — the scroll-spy keeps state in sync during the animation.
    setActiveFileNode(fileNode);
    expandPath(getParentFolderIds(fileNode.id));
    scrollToFile(fileNode);
  };

  const selectFolder = (folderNode) => {
    const firstFile = findFirstFileInNode(folderNode);
    const ancestors = firstFile
      ? getParentFolderIds(firstFile.id)
      : new Set([folderNode.id]);

    expandPath(ancestors);

    if (firstFile) {
      setActiveFileNode(firstFile);
      scrollToFile(firstFile);
    }
  };

  const toggleFolder = (folderId) => {
    if (expandedFolderIds.has(folderId)) {
      setUserCollapsedIds((prev) => new Set([...prev, folderId]));
      setUserExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    } else {
      setUserExpandedIds((prev) => new Set([...prev, folderId]));
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
            <div className="project-modal-sidebar">
              <SidebarAccordionGroup
                label={content.projects.projectJourney.label}
                isExpanded={expandedGroup === "journey"}
                onExpand={() => setExpandedGroup("journey")}
              >
                <ProjectJourneyNav
                  steps={journeySteps}
                  activeStepId={activeJourneyId}
                  activeSubId={activeJourneySubId}
                  onSelectStep={selectJourneyStep}
                />
              </SidebarAccordionGroup>

              <SidebarAccordionGroup
                label={content.projects.resources.label}
                isExpanded={expandedGroup === "documentation"}
                onExpand={() => setExpandedGroup("documentation")}
              >
                <div className="project-resources-panel">
                  <ProjectDocsSidebar
                    activeFilePath={activeFileNode?.path ?? null}
                    activeFolderIds={activeFolderIds}
                    activeSectionId={activeSectionId}
                    activeSections={activeSections}
                    expandedFolderIds={expandedFolderIds}
                    onSelectFile={selectFile}
                    onSelectFolder={selectFolder}
                    onSelectSection={selectSection}
                    onToggleFolder={toggleFolder}
                    tree={docTree}
                  />
                  <ResourceLinks resources={content.projects.resources} />
                </div>
              </SidebarAccordionGroup>
            </div>
            <div className="project-doc-content-shell">
              <button
                aria-label={
                  isDocsSidebarCollapsed ? "Open sidebar" : "Collapse sidebar"
                }
                aria-pressed={isDocsSidebarCollapsed}
                className="project-doc-sidebar-collapse"
                onClick={() => setIsDocsSidebarCollapsed((v) => !v)}
                title={isDocsSidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
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
              <article
                className={`project-doc-viewer ${
                  expandedGroup === "journey" ? "project-doc-viewer--journey" : ""
                }`}
                ref={viewerRef}
                tabIndex={-1}
              >
                {expandedGroup === "journey" ? (
                  <ContinuousJourneyReader
                    steps={journeySteps}
                    comingSoonLabel={content.projects.projectJourney.comingSoon}
                    continueLabel={content.projects.continueReading}
                  />
                ) : (
                  <ContinuousDocReader
                    tree={docTree}
                    selectedProject={selectedProject}
                    content={content}
                  />
                )}
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
