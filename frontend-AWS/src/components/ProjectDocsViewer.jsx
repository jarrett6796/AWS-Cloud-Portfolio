import MarkdownContent from "./MarkdownContent";

export default function ProjectDocsViewer({ document, viewerRef }) {
  return (
    <article
      className="project-doc-viewer"
      id={`project-doc-document-${document.id}`}
      ref={viewerRef}
      tabIndex={-1}
    >
      <div className="project-markdown-document">
        {document.sections.map((section) => (
          <section
            className="project-markdown-section"
            data-section-id={section.id}
            id={section.id}
            key={section.id}
          >
            <h2>{section.title}</h2>
            <MarkdownContent blocks={section.blocks} />
          </section>
        ))}
      </div>
    </article>
  );
}
