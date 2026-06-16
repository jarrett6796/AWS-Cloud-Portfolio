import MarkdownContent from "./MarkdownContent";

export default function ProjectDocsViewer({ document, labels, viewerRef }) {
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
            <h2>{labels.sections[section.id] ?? section.id}</h2>
            <MarkdownContent blocks={section.blocks} />
          </section>
        ))}
      </div>
    </article>
  );
}
