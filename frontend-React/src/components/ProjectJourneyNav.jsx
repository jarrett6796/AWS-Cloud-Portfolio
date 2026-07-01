/**
 * ProjectJourneyNav — presentation-agenda navigation for the Project Journey
 * accordion. A single solid rail runs behind a column of square chapter
 * blocks; the active chapter (if it has sub-outline items) reveals a
 * display-only sub-outline of smaller diamond markers beneath it. No icons.
 */

import { useEffect, useRef } from "react";

function subStatusOf(subIndex, activeSubIndex) {
  if (subIndex === activeSubIndex) return "active";
  if (subIndex < activeSubIndex) return "completed";
  return "unread";
}

export default function ProjectJourneyNav({
  steps,
  activeStepId,
  activeSubId,
  onSelectStep,
}) {
  const navRef = useRef(null);

  // Keep the active chapter/sub-item visible as continuous-scroll updates
  // it, mirroring ProjectDocsSidebar's existing active-item auto-scroll.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeEl =
      nav.querySelector(".project-journey-nav-subitem.is-active") ??
      nav.querySelector(".project-journey-nav-item.is-active");
    if (!activeEl) return;

    const navRect = nav.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();

    if (elRect.top < navRect.top || elRect.bottom > navRect.bottom) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeStepId, activeSubId]);

  const activeChapterIndex = steps.findIndex((step) => step.id === activeStepId);

  return (
    <nav className="project-journey-nav" aria-label="Project journey" ref={navRef}>
      <div className="project-journey-nav-track">
        <div aria-hidden="true" className="project-journey-nav-rail" />

        {steps.map((step, index) => {
          const chapterStatus =
            index === activeChapterIndex
              ? "active"
              : index < activeChapterIndex
                ? "completed"
                : "unread";

          const subsections = step.subsections ?? [];
          const isExpanded = subsections.length > 0 && index === activeChapterIndex;

          let activeSubIndex = -1;
          if (isExpanded) {
            activeSubIndex = subsections.findIndex((sub) => sub.id === activeSubId);
            if (activeSubIndex === -1) activeSubIndex = 0;
          }

          return (
            <div key={step.id} className="project-journey-nav-chapter">
              <button
                className={`project-journey-nav-item is-${chapterStatus}`}
                onClick={() => onSelectStep(step.id)}
                type="button"
              >
                <span className="project-journey-nav-number">{index + 1}.</span>
                <span className="project-journey-nav-label">{step.title}</span>
              </button>

              {isExpanded && (
                <div className="project-journey-nav-suboutline">
                  {subsections.map((sub, subIndex) => {
                    const subStatus = subStatusOf(subIndex, activeSubIndex);

                    return (
                      <div
                        key={sub.id}
                        className={`project-journey-nav-subitem is-${subStatus}`}
                      >
                        <span
                          aria-hidden="true"
                          className="project-journey-nav-sub-marker-slot"
                        >
                          <span className="project-journey-nav-sub-marker" />
                        </span>
                        <span className="project-journey-nav-sub-label">
                          {sub.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
