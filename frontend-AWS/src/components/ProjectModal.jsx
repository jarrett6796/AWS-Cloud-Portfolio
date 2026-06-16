import { useEffect, useMemo, useRef, useState } from "react";
import ProjectDocsSidebar from "./ProjectDocsSidebar";
import ProjectDocsViewer from "./ProjectDocsViewer";
import { getProjectDocsLabels } from "../content/projectDocsNavigation";
import { getProjectDocuments } from "../content/projectDocs";

const defaultDocumentId = "overview";
const defaultSectionId = "overview-summary";

function findDocumentBySection(documents, sectionId) {
  return documents.find((document) =>
    document.sections.some((sectionItem) => sectionItem.id === sectionId),
  );
}

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
  const [activeDocumentId, setActiveDocumentId] = useState(defaultDocumentId);
  const [activeSectionId, setActiveSectionId] = useState(defaultSectionId);
  const [expandedDocumentIds, setExpandedDocumentIds] = useState([
    defaultDocumentId,
  ]);
  const [pendingSectionId, setPendingSectionId] = useState(defaultSectionId);
  const documents = useMemo(
    () => getProjectDocuments(selectedProject),
    [selectedProject],
  );
  const navigationLabels = useMemo(
    () => getProjectDocsLabels(language),
    [language],
  );
  const activeDocument =
    documents.find((document) => document.id === activeDocumentId) ??
    documents[0];

  useEffect(() => {
    if (!pendingSectionId || !viewerRef.current) {
      return;
    }

    const target = viewerRef.current.querySelector(
      `[data-section-id="${pendingSectionId}"]`,
    );

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionId(pendingSectionId);
      setPendingSectionId(null);
    }
  }, [activeDocumentId, pendingSectionId]);

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer) {
      return undefined;
    }

    const updateActiveSection = () => {
      const sectionElements = [
        ...viewer.querySelectorAll("[data-section-id]"),
      ];
      const viewerTop = viewer.getBoundingClientRect().top;
      const currentSection = sectionElements
        .map((element) => ({
          id: element.dataset.sectionId,
          distance: Math.abs(element.getBoundingClientRect().top - viewerTop),
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (currentSection?.id) {
        setActiveSectionId(currentSection.id);
      }
    };

    viewer.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      viewer.removeEventListener("scroll", updateActiveSection);
    };
  }, [activeDocumentId]);

  const toggleDocument = (documentId) => {
    setExpandedDocumentIds((currentIds) =>
      currentIds.includes(documentId)
        ? currentIds.filter((id) => id !== documentId)
        : [...currentIds, documentId],
    );
  };

  const selectSection = (sectionId) => {
    const documentForSection = findDocumentBySection(documents, sectionId);

    if (!documentForSection) {
      return;
    }

    setExpandedDocumentIds((currentIds) =>
      currentIds.includes(documentForSection.id)
        ? currentIds
        : [...currentIds, documentForSection.id],
    );
    setActiveSectionId(sectionId);
    setPendingSectionId(sectionId);

    if (documentForSection.id !== activeDocumentId) {
      setActiveDocumentId(documentForSection.id);
    }
  };

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
          <div>
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

        <div className="project-docs-layout">
          <ProjectDocsSidebar
            activeSectionId={activeSectionId}
            documents={documents}
            expandedDocumentIds={expandedDocumentIds}
            labels={navigationLabels}
            onSelectSection={selectSection}
            onToggleDocument={toggleDocument}
          />
          <ProjectDocsViewer
            document={activeDocument}
            labels={navigationLabels}
            viewerRef={viewerRef}
          />
        </div>
      </section>
    </div>
  );
}
