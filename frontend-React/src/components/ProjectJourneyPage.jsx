/**
 * ProjectJourneyPage — shared template for every Project Journey timeline
 * step: a large hero area and a reserved area for content authored later.
 * No on-page title — the sidebar already indicates the active chapter.
 *
 * The hero renders the section's real PNG once one is authored (`image`);
 * until then it falls back to the original placeholder box. When an image
 * is present, a small expand button opens it in JourneyImageViewer — all
 * fullscreen viewer logic lives there, keeping this component lightweight.
 */

import { Maximize2 } from "lucide-react";

export default function ProjectJourneyPage({ title, image, comingSoonLabel, onExpand }) {
  return (
    <div className="project-journey-page" aria-label={title}>
      {image ? (
        <div className="project-journey-page-hero-frame">
          <img
            alt={title}
            className="project-journey-page-hero project-journey-page-hero--image"
            src={image}
          />
          <button
            aria-label={`Expand ${title}`}
            className="project-journey-page-expand"
            onClick={() => onExpand?.(image)}
            type="button"
          >
            <Maximize2 aria-hidden="true" size={18} />
          </button>
        </div>
      ) : (
        <div className="project-journey-page-hero" aria-hidden="true">
          <span>PNG</span>
        </div>
      )}

      <div className="project-journey-page-reserved">
        <span>{comingSoonLabel}</span>
      </div>
    </div>
  );
}
