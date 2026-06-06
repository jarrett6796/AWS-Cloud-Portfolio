export default function ProjectModal({
  selectedProject,
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
}) {
  const modal = selectedProject.modal ?? {};
  const overview = {
    summary: modal.summary ?? selectedProject.body,
    goal: modal.goal ?? selectedProject.solution,
    technologies: modal.technologies ?? selectedProject.services,
    status: modal.status,
  };
  const architecture = {
    diagram: modal.architecture?.diagram ?? selectedProject.previewImage,
    diagramLabel:
      modal.architecture?.diagramLabel ?? content.projects.architectureDiagram,
    flow: modal.architecture?.flow ?? selectedProject.services,
    explanation: modal.architecture?.explanation ?? selectedProject.architecture,
    layers:
      modal.architecture?.layers ?? [
        {
          title: content.projects.systemLayers,
          items: selectedProject.services,
        },
      ],
  };
  const challenges =
    modal.challenges ?? [
      {
        title: selectedProject.problem,
        problem: selectedProject.problem,
        solution: selectedProject.solution,
        outcome: selectedProject.notes,
      },
    ];
  const documentation =
    modal.documentation ?? [
      content.projects.defaultDocs.architecture,
      content.projects.defaultDocs.development,
      content.projects.defaultDocs.tests,
      content.projects.defaultDocs.deployment,
      content.projects.defaultDocs.roadmap,
    ];

  const handleTabKeyDown = (event, currentIndex) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const lastIndex = projectTabs.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : event.key === "ArrowRight"
            ? currentIndex === lastIndex
              ? 0
              : currentIndex + 1
            : currentIndex === 0
              ? lastIndex
              : currentIndex - 1;
    const nextTab = projectTabs[nextIndex];

    setActiveProjectTab(nextTab.id);
    requestAnimationFrame(() => {
      document.getElementById(`project-tab-${nextTab.id}`)?.focus();
    });
  };

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="project-modal-header">
          <div>
            <h2 id="project-detail-title">{selectedProject.title}</h2>
            <div
              className="project-modal-tags"
              aria-label={content.projects.primaryTechnologies}
            >
              {overview.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
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
            {projectTabs.map((tab, index) => (
              <button
                className={activeProjectTab === tab.id ? "is-active" : ""}
                id={`project-tab-${tab.id}`}
                key={tab.id}
                type="button"
                role="tab"
                aria-controls={`project-panel-${tab.id}`}
                aria-selected={activeProjectTab === tab.id}
                onClick={() => setActiveProjectTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                tabIndex={activeProjectTab === tab.id ? 0 : -1}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="project-workspace">
          <div
            className="project-tab-panel"
            id={`project-panel-${activeProjectTab}`}
            role="tabpanel"
            aria-labelledby={`project-tab-${activeProjectTab}`}
          >
            {activeProjectTab === "overview" && (
              <div className="project-tab-stack project-overview-panel">
                <article className="project-modal-card project-overview-lead">
                  <p className="project-type">{selectedProject.type}</p>
                  <h3>{selectedProject.title}</h3>
                  <p>{overview.summary}</p>
                </article>

                <div className="project-card-grid project-detail-grid project-detail-grid--compact">
                  <article className="project-modal-card">
                    <h3>{content.projects.goal}</h3>
                    <p>{overview.goal}</p>
                  </article>
                  <article className="project-modal-card">
                    <h3>{content.projects.currentStatus}</h3>
                    <p>{overview.status ?? content.projects.statusUnavailable}</p>
                  </article>
                </div>
              </div>
            )}

            {activeProjectTab === "architecture" && (
              <div className="project-tab-stack project-architecture-panel">
                <article className="project-modal-card">
                  <h3>{content.projects.architecture}</h3>
                  <div className="modal-architecture-diagram">
                    {architecture.diagram?.src ? (
                      <>
                        <img
                          src={architecture.diagram.src}
                          alt={architecture.diagram.alt ?? architecture.diagramLabel}
                          onError={(event) => {
                            event.currentTarget.parentElement?.classList.add(
                              "is-image-missing",
                            );
                          }}
                        />
                        <div>
                          <span>{architecture.diagramLabel}</span>
                          <p>{content.projects.diagramPlaceholder}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span>{architecture.diagramLabel}</span>
                        <p>{content.projects.diagramPlaceholder}</p>
                      </div>
                    )}
                  </div>
                </article>

                <article className="project-modal-card">
                  <h4>{content.projects.serviceFlow}</h4>
                  <div
                    className="architecture-flow"
                    aria-label={content.projects.serviceFlow}
                  >
                    {architecture.flow.map((service, index) => (
                      <button
                        className={`architecture-step ${
                          activeArchitectureStep === service
                            ? "is-highlighted"
                            : ""
                        }`}
                        key={service}
                        type="button"
                        onMouseEnter={() => setActiveArchitectureStep(service)}
                        onMouseLeave={() => setActiveArchitectureStep(null)}
                        onFocus={() => setActiveArchitectureStep(service)}
                        onBlur={() => setActiveArchitectureStep(null)}
                      >
                        <span>{service}</span>
                        {index < architecture.flow.length - 1 && (
                          <span className="architecture-arrow" aria-hidden="true">
                            →
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </article>

                <article className="project-modal-card">
                  <h4>{content.projects.architecture}</h4>
                  <p>{architecture.explanation}</p>
                </article>

                <div className="project-card-grid system-layer-grid">
                  {architecture.layers.map((layer) => (
                    <article className="project-modal-card" key={layer.title}>
                      <h4>{layer.title}</h4>
                      <ul>
                        {layer.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeProjectTab === "challenges" && (
              <div className="project-tab-stack project-challenges-panel">
                {challenges.map((challenge) => (
                  <article className="project-modal-card" key={challenge.title}>
                    <h3>{challenge.title}</h3>
                    <div>
                      <h4>{content.projects.challenge}</h4>
                      <p>{challenge.problem}</p>
                    </div>
                    <div>
                      <h4>{content.projects.solution}</h4>
                      <p>{challenge.solution}</p>
                    </div>
                    <div>
                      <h4>{content.projects.outcome}</h4>
                      <p>{challenge.outcome}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeProjectTab === "documentation" && (
              <div className="project-tab-stack project-documentation-panel">
                <article className="project-modal-card">
                  <h3>{content.projects.documentationHub}</h3>
                  <p>{content.projects.documentationIntro}</p>
                </article>

                <div className="project-card-grid project-documentation-grid">
                  {documentation.map((item) => (
                    <article className="project-modal-card" key={item.title}>
                      <span>{item.type}</span>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
