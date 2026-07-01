/**
 * ContinuousJourneyReader — renders every Project Journey step as one
 * continuous scrollable stream, mirroring the Documentation reader's
 * continuous-scroll behavior. Chapters with sub-outline items expand into
 * one reading section per sub-item (so reading always starts from the first
 * sub-outline entry); chapters without sub-outlines keep a single section.
 * Each section keeps the shared Phase 1 placeholder template (title / 16:9
 * hero / reserved area) and reuses the Documentation reader's sticky
 * "continue reading" hint styling between sections.
 *
 * Also owns the fullscreen image viewer: it holds the flattened list of
 * sections that actually have a PNG (in reading order) plus which one, if
 * any, is currently open in JourneyImageViewer.
 */

import { useMemo, useRef, useState } from "react";
import ProjectJourneyPage from "./ProjectJourneyPage";
import JourneyImageViewer from "./JourneyImageViewer";
import { useNearSectionEnd } from "../hooks/useNearSectionEnd.js";

function flattenJourneySteps(steps) {
  const list = [];

  steps.forEach((step) => {
    const subsections = step.subsections ?? [];

    if (subsections.length > 0) {
      subsections.forEach((sub) => {
        list.push({
          chapterId: step.id,
          subId: sub.id,
          title: sub.title,
          image: sub.image ?? null,
        });
      });
    } else {
      list.push({
        chapterId: step.id,
        subId: null,
        title: step.title,
        image: step.image ?? null,
      });
    }
  });

  return list;
}

function JourneySection({ item, isLast, comingSoonLabel, continueLabel, onExpandImage }) {
  const sectionRef = useRef(null);
  const isNearEnd = useNearSectionEnd(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="journey-reader-section"
      data-journey-step-id={item.chapterId}
      data-journey-sub-id={item.subId ?? ""}
    >
      <ProjectJourneyPage
        title={item.title}
        image={item.image}
        comingSoonLabel={comingSoonLabel}
        onExpand={onExpandImage}
      />

      {!isLast && (
        <div
          className={`doc-reader-continue-hint${isNearEnd ? " is-visible" : ""}`}
          aria-hidden="true"
        >
          <span className="doc-reader-continue-hint-arrow">↓</span>
          <span>{continueLabel}</span>
        </div>
      )}
    </section>
  );
}

export default function ContinuousJourneyReader({
  steps,
  comingSoonLabel,
  continueLabel,
}) {
  const readingList = useMemo(() => flattenJourneySteps(steps), [steps]);

  // Only sections with a real PNG participate in fullscreen navigation —
  // placeholders are excluded by construction, not filtered at click time.
  const images = useMemo(
    () =>
      readingList
        .filter((item) => item.image)
        .map((item) => ({ src: item.image, title: item.title })),
    [readingList],
  );

  const [viewerIndex, setViewerIndex] = useState(null);

  const openImageAt = (src) => {
    const index = images.findIndex((image) => image.src === src);
    if (index !== -1) setViewerIndex(index);
  };

  return (
    <div className="journey-reader">
      {readingList.map((item, index) => (
        <JourneySection
          key={`${item.chapterId}-${item.subId ?? "main"}`}
          item={item}
          isLast={index === readingList.length - 1}
          comingSoonLabel={comingSoonLabel}
          continueLabel={continueLabel}
          onExpandImage={openImageAt}
        />
      ))}

      <JourneyImageViewer
        images={images}
        currentIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onNavigate={setViewerIndex}
      />
    </div>
  );
}
