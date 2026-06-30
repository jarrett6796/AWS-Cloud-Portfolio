import { useEffect, useState } from "react";

const DEFAULT_SECTION_IDS = ["about", "skills", "portfolio", "contact"];

export function useScrollTracker(sectionIds = DEFAULT_SECTION_IDS) {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const updateScrollPercent = () => {
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextPercent =
        scrollRange > 0 ? Math.round((window.scrollY / scrollRange) * 100) : 0;

      setScrollPercent(Math.min(100, Math.max(0, nextPercent)));
    };

    updateScrollPercent();
    window.addEventListener("scroll", updateScrollPercent, { passive: true });
    window.addEventListener("resize", updateScrollPercent);

    return () => {
      window.removeEventListener("scroll", updateScrollPercent);
      window.removeEventListener("resize", updateScrollPercent);
    };
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const sections = sectionIds
        .map((sectionId) => document.getElementById(sectionId))
        .filter(Boolean);

      const activationOffset =
        Math.max(
          Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--portfolio-sticky-offset",
            ),
          ) + 24,
          window.innerHeight * 0.2,
        );
      const activeTarget =
        sections
          .filter(
            (section) =>
              section.getBoundingClientRect().top <= activationOffset,
          )
          .at(-1) ?? sections[0];

      if (activeTarget) {
        setActiveSection(activeTarget.id);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sectionIds]);

  return {
    scrollPercent,
    activeSection,
    setActiveSection,
  };
}
