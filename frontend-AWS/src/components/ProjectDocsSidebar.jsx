export default function ProjectDocsSidebar({
  activeSectionId,
  sections,
  onSelectSection,
}) {
  return (
    <nav className="project-doc-sidebar" aria-label="Project documentation">
      <div className="project-doc-nav-pages">
        <div>
          {sections.map((section) => (
            <button
              className={activeSectionId === section.id ? "is-active" : ""}
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
