import MarkdownContent from "./MarkdownContent";

export default function ProjectDocsViewer({ document, viewerRef }) {
  return (
    <article
      className="project-doc-viewer"
      id={`project-doc-document-${document?.id ?? "fallback"}`}
      ref={viewerRef}
      tabIndex={-1}
    >
      <div className="project-markdown-document">
        {document?.title ? (
          <h1 className="project-markdown-document-title">{document.title}</h1>
        ) : null}
        {document?.blocks?.length ? (
          <MarkdownContent blocks={document.blocks} />
        ) : null}
      </div>
    </article>
  );
}
