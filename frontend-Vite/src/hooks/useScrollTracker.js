import { useEffect, useState } from "react";

const DEFAULT_SECTION_IDS = ["about", "skills", "projects", "contact"];

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
    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -56% 0px",
        threshold: [0.12, 0.32, 0.56],
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    return () => {
      sectionObserver.disconnect();
    };
  }, [sectionIds]);

  return {
    scrollPercent,
    activeSection,
  };
}
