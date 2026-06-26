import { useEffect, useMemo, useRef, useState } from "react";
import ProjectDocsSidebar from "./ProjectDocsSidebar";
import ProjectDocsViewer from "./ProjectDocsViewer";
import {
  getProjectDocument,
  getProjectDocumentOutlines,
} from "../content/projectDocs";

const defaultDocumentId = "overview";
const defaultSectionId = "overview-1";

function getFirstSectionId(document) {
  return document?.sections[0]?.id ?? "";
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
  const [pendingSectionId, setPendingSectionId] = useState(defaultSectionId);
  const [expandedDocumentIds, setExpandedDocumentIds] = useState([
    defaultDocumentId,
  ]);
  const documents = useMemo(
    () => getProjectDocumentOutlines(selectedProject, language),
    [language, selectedProject],
  );
  const activeDocumentIdOrDefault = documents.some(
    (document) => document.id === activeDocumentId,
  )
    ? activeDocumentId
    : (documents[0]?.id ?? defaultDocumentId);
  const activeDocumentOutline = documents.find(
    (document) => document.id === activeDocumentIdOrDefault,
  );
  const activeSectionIdOrDefault = activeDocumentOutline?.sections.some(
    (section) => section.id === activeSectionId,
  )
    ? activeSectionId
    : (activeDocumentOutline?.sections[0]?.id ?? "");
  const activeDocument = useMemo(
    () =>
      getProjectDocument(selectedProject, language, activeDocumentIdOrDefault),
    [activeDocumentIdOrDefault, language, selectedProject],
  );

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

  const selectDocument = (documentId) => {
    const selectedDocument = documents.find((document) => document.id === documentId);

    if (!selectedDocument) {
      return;
    }

    const firstSectionId = getFirstSectionId(selectedDocument);

    setActiveDocumentId(documentId);
    setActiveSectionId(firstSectionId);
    setPendingSectionId(firstSectionId);
    setExpandedDocumentIds([documentId]);
  };

  const toggleDocument = (documentId) => {
    setExpandedDocumentIds((currentDocumentIds) =>
      currentDocumentIds.includes(documentId)
        ? currentDocumentIds.filter((currentId) => currentId !== documentId)
        : [...currentDocumentIds, documentId],
    );
  };

  const selectSection = (documentId, sectionId) => {
    const documentOutline = documents.find(
      (document) => document.id === documentId,
    );

    if (
      !documentOutline?.sections.some(
        (sectionItem) => sectionItem.id === sectionId,
      )
    ) {
      return;
    }

    setActiveDocumentId(documentId);
    setActiveSectionId(sectionId);
    setPendingSectionId(sectionId);
    setExpandedDocumentIds([documentId]);
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
          <div className="project-docs-layout">
            <ProjectDocsSidebar
              activeDocumentId={activeDocumentIdOrDefault}
              activeSectionId={activeSectionIdOrDefault}
              documents={documents}
              expandedDocumentIds={expandedDocumentIds}
              onSelectDocument={selectDocument}
              onSelectSection={selectSection}
              onToggleDocument={toggleDocument}
            />
            <ProjectDocsViewer document={activeDocument} viewerRef={viewerRef} />
          </div>
        </div>
      </section>
    </div>
  );
}
