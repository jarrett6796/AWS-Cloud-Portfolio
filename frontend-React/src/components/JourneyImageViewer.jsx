/**
 * JourneyImageViewer — fullscreen overlay for inspecting a Project Journey
 * PNG at full resolution. Navigates only across sections that actually have
 * an image (placeholders are skipped by construction — the `images` array
 * passed in already excludes them).
 *
 * Rendered through a portal to document.body: the project modal's entrance
 * animation leaves it with a non-"none" computed transform (an identity
 * matrix), which — per the CSS spec — makes it a containing block for
 * position:fixed descendants. Without the portal this overlay would be
 * clipped to the modal's box instead of covering the real viewport.
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function JourneyImageViewer({ images, currentIndex, onClose, onNavigate }) {
  const isOpen = currentIndex !== null && currentIndex >= 0;
  const dialogRef = useRef(null);

  // Functional updates so rapid key-repeat can never drop a step by reading
  // a stale currentIndex from an earlier render's closure.
  const goToPrevious = () => {
    onNavigate((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    onNavigate((prev) => (prev + 1) % images.length);
  };

  // Focus the dialog on open so keyboard/focus starts inside the overlay.
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  // Escape / arrow-key navigation, plus a lightweight Tab focus trap.
  //
  // Registered on the CAPTURE phase and stopped there: the project modal
  // (Home.jsx) already has its own bubble-phase window "Escape closes the
  // modal" listener. Listeners on the same target fire in registration
  // order, and that one is always registered first (the modal opens before
  // this viewer can). A capture-phase listener runs before any bubble-phase
  // listener on the same target, so stopping propagation here is what keeps
  // Escape from also closing the project modal underneath.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.stopPropagation();
        goToPrevious();
        return;
      }
      if (event.key === "ArrowRight") {
        event.stopPropagation();
        goToNext();
        return;
      }
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        event.stopPropagation();
        const focusable = dialog.querySelectorAll("button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length]);

  if (!isOpen) return null;

  const current = images[currentIndex];

  return createPortal(
    <div className="journey-image-viewer-backdrop" onClick={onClose}>
      <div
        aria-label={current.title}
        aria-modal="true"
        className="journey-image-viewer"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="journey-image-viewer-header">
          <button
            className="journey-image-viewer-close"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">✕</span>
            <span>Close</span>
          </button>

          <span className="journey-image-viewer-counter">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="journey-image-viewer-body">
          <img alt={current.title} className="journey-image-viewer-image" src={current.src} />
        </div>

        <div className="journey-image-viewer-nav">
          <button
            className="journey-image-viewer-nav-btn"
            disabled={images.length <= 1}
            onClick={goToPrevious}
            type="button"
          >
            <span aria-hidden="true">◀</span>
            Previous
          </button>

          <button
            className="journey-image-viewer-nav-btn"
            disabled={images.length <= 1}
            onClick={goToNext}
            type="button"
          >
            Next
            <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
