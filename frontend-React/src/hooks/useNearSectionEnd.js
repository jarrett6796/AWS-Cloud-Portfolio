import { useEffect, useState } from "react";

const DEFAULT_THRESHOLD = 0.85;

/**
 * True once the reader has scrolled through `threshold` (default 85%) of a
 * section's height — i.e. only the last 10-15% of the section remains below
 * the viewer's visible area. Used to delay the "continue reading" hint until
 * the reader is actually approaching the end of the current document.
 */
export function useNearSectionEnd(sectionRef, threshold = DEFAULT_THRESHOLD) {
  const [isNearEnd, setIsNearEnd] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const scrollParent = section.closest(".project-doc-viewer");
    if (!scrollParent) return undefined;

    const update = () => {
      const sectionRect = section.getBoundingClientRect();
      if (sectionRect.height === 0) return;

      const viewerRect = scrollParent.getBoundingClientRect();
      const progress = (viewerRect.bottom - sectionRect.top) / sectionRect.height;

      setIsNearEnd(progress >= threshold);
    };

    update();
    scrollParent.addEventListener("scroll", update, { passive: true });
    return () => scrollParent.removeEventListener("scroll", update);
  }, [sectionRef, threshold]);

  return isNearEnd;
}
