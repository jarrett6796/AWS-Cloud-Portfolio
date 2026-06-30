import FolderReadingView from "./FolderReadingView";
import MarkdownContent from "./MarkdownContent";

export default function ProjectDocsViewer({
  document,
  folderNode,
  selectedProject,
  viewerRef,
}) {
  return (
    <article
      className="project-doc-viewer"
      id={`project-doc-document-${document?.id ?? folderNode?.id ?? "fallback"}`}
      ref={viewerRef}
      tabIndex={-1}
    >
      {folderNode ? (
        <FolderReadingView
          folderNode={folderNode}
          selectedProject={selectedProject}
        />
      ) : (
        <div className="project-markdown-document">
          {document?.title ? (
            <h1 className="project-markdown-document-title">{document.title}</h1>
          ) : null}
          {document?.blocks?.length ? (
            <MarkdownContent blocks={document.blocks} />
          ) : null}
        </div>
      )}
    </article>
  );
}
