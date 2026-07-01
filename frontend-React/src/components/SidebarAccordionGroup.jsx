/**
 * SidebarAccordionGroup — single collapsible section used by the Project
 * Modal sidebar. Only one group is ever expanded at a time; ProjectModal
 * owns that state and passes `isExpanded` + `onExpand` down.
 */

export default function SidebarAccordionGroup({
  label,
  isExpanded,
  onExpand,
  children,
}) {
  return (
    <div
      className={`project-sidebar-group ${isExpanded ? "is-expanded" : ""}`}
    >
      <button
        aria-expanded={isExpanded}
        className="project-sidebar-group-header"
        onClick={onExpand}
        type="button"
      >
        <span>{label}</span>
        <span aria-hidden="true" className="project-sidebar-group-chevron">
          ›
        </span>
      </button>

      <div className="project-sidebar-group-body">{children}</div>
    </div>
  );
}
