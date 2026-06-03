export default function ProjectModal({
  selectedProject,
  isProjectAiOpen,
  isProjectAiExpanded,
  language,
  theme,
  projectTabs,
  activeProjectTab,
  activeArchitectureStep,
  content,
  onClose,
  setLanguage,
  onToggleTheme,
  setActiveProjectTab,
  setActiveArchitectureStep,
  setIsProjectAiOpen,
  setIsProjectAiExpanded,
}) {
  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <section
        className={`project-modal ${isProjectAiOpen ? "is-workspace" : ""} ${
          isProjectAiExpanded ? "is-ai-expanded" : ""
        }`}
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

        <div className="project-modal-tabs">
          <div role="tablist">
            {projectTabs.map((tab) => (
              <button
                className={activeProjectTab === tab.id ? "is-active" : ""}
                id={`project-tab-${tab.id}`}
                key={tab.id}
                type="button"
                role="tab"
                aria-controls={`project-panel-${tab.id}`}
                aria-selected={activeProjectTab === tab.id}
                onClick={() => setActiveProjectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="project-ai-controls">
            <button
              className={`project-ai-toggle ${isProjectAiOpen ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                setIsProjectAiOpen(!isProjectAiOpen);

                if (isProjectAiOpen) {
                  setIsProjectAiExpanded(false);
                }
              }}
              aria-expanded={isProjectAiOpen}
              aria-controls="project-ai-panel"
              aria-label={
                isProjectAiOpen ? content.chat.closePanel : content.chat.openPanel
              }
            >
              AI Assistant
            </button>

            {isProjectAiOpen && (
              <button
                className={`project-ai-expand ${isProjectAiExpanded ? "is-active" : ""}`}
                type="button"
                onClick={() => setIsProjectAiExpanded(!isProjectAiExpanded)}
                aria-pressed={isProjectAiExpanded}
                aria-label={
                  isProjectAiExpanded ? "Restore Layout" : "Expand Layout"
                }
              >
                <span aria-hidden="true">
                  {isProjectAiExpanded ? "⤢" : "⤡"}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className={`project-workspace ${isProjectAiOpen ? "has-ai" : ""}`}>
          <div
            className="project-tab-panel"
            id={`project-panel-${activeProjectTab}`}
            role="tabpanel"
            aria-labelledby={`project-tab-${activeProjectTab}`}
          >
            {activeProjectTab === "overview" && (
              <div className="project-detail-grid compact-grid">
                <article>
                  <h3>{content.projects.problem}</h3>
                  <p>{selectedProject.problem}</p>
                </article>
                <article>
                  <h3>{content.projects.solution}</h3>
                  <p>{selectedProject.solution}</p>
                </article>
              </div>
            )}

            {activeProjectTab === "architecture" && (
              <article className="project-architecture-panel">
                <h3>{content.projects.architecture}</h3>
                <div
                  className="architecture-flow"
                  aria-label={content.projects.architecture}
                >
                  {selectedProject.services.map((service, index) => (
                    <button
                      className={`architecture-step ${
                        activeArchitectureStep === service ? "is-highlighted" : ""
                      }`}
                      key={service}
                      type="button"
                      onMouseEnter={() => setActiveArchitectureStep(service)}
                      onMouseLeave={() => setActiveArchitectureStep(null)}
                      onFocus={() => setActiveArchitectureStep(service)}
                      onBlur={() => setActiveArchitectureStep(null)}
                    >
                      <span>{service}</span>
                      {index < selectedProject.services.length - 1 && (
                        <span className="architecture-arrow" aria-hidden="true">
                          →
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p>{selectedProject.architecture}</p>
              </article>
            )}

            {activeProjectTab === "stack" && (
              <article className="project-stack-panel">
                <h3>{content.projects.services}</h3>
                <ul>
                  {selectedProject.services.map((service) => (
                    <li
                      className={
                        activeArchitectureStep === service ? "is-highlighted" : ""
                      }
                      key={service}
                      onMouseEnter={() => setActiveArchitectureStep(service)}
                      onMouseLeave={() => setActiveArchitectureStep(null)}
                    >
                      {service}
                    </li>
                  ))}
                </ul>
                <div className="architecture-flow compact-flow">
                  {selectedProject.services.map((service, index) => (
                    <button
                      className={`architecture-step ${
                        activeArchitectureStep === service ? "is-highlighted" : ""
                      }`}
                      key={service}
                      type="button"
                      onMouseEnter={() => setActiveArchitectureStep(service)}
                      onMouseLeave={() => setActiveArchitectureStep(null)}
                      onFocus={() => setActiveArchitectureStep(service)}
                      onBlur={() => setActiveArchitectureStep(null)}
                    >
                      <span>{service}</span>
                      {index < selectedProject.services.length - 1 && (
                        <span className="architecture-arrow" aria-hidden="true">
                          →
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </article>
            )}

            {activeProjectTab === "lessons" && (
              <article className="project-lessons-panel">
                <h3>{content.projects.notes}</h3>
                <p>{selectedProject.notes}</p>
              </article>
            )}
          </div>

          {isProjectAiOpen && (
            <aside
              className="project-ai-panel"
              id="project-ai-panel"
              aria-labelledby="project-ai-title"
            >
              <div className="chat-suggestions">
                <p>{content.chat.suggestionsLabel}</p>
                <div>
                  {content.chat.projectSuggestions.slice(0, 3).map((suggestion) => (
                    <span key={suggestion}>{suggestion}</span>
                  ))}
                </div>
              </div>

              <article className="assistant-message">
                <span>{content.chat.sampleLabel}</span>
                <p>{content.chat.sampleResponse}</p>
              </article>

              <div className="chat-composer" aria-label={content.chat.composer}>
                <span>{content.chat.placeholder}</span>
                <button type="button" aria-label={content.chat.send} disabled>
                  <span aria-hidden="true" />
                </button>
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
