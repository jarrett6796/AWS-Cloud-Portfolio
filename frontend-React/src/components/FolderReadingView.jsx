import { useEffect, useMemo, useRef, useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import { getProjectDocumentByPath } from "../content/projectDocs.js";

// ---------------------------------------------------------------------------
// Tree flattening — produces an ordered reading list from a folder node
// ---------------------------------------------------------------------------

function buildReadingList(folderNode) {
  const items = [];

  function traverse(node, depth) {
    if (node.type === "file") {
      items.push({ type: "file", node, depth });
    } else if (node.type === "folder") {
      items.push({ type: "folder-heading", node, depth });
      node.children.forEach((child) => traverse(child, depth + 1));
    }
  }

  folderNode.children.forEach((child) => traverse(child, 1));
  return items;
}

// ---------------------------------------------------------------------------
// FileDocSection — self-loading file content section
// ---------------------------------------------------------------------------

function FileDocSection({ fileNode, selectedProject }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  // Observe the section; load content 400px before it enters the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoaded]);

  const document = useMemo(() => {
    if (!isLoaded) return null;
    return getProjectDocumentByPath(selectedProject, fileNode);
  }, [isLoaded, fileNode, selectedProject]);

  return (
    <div
      ref={containerRef}
      className="folder-reading-file-section"
      data-file-section-id={fileNode.id}
    >
      {document ? (
        <div className="project-markdown-document">
          <MarkdownContent blocks={document.blocks} />
        </div>
      ) : (
        <div className="folder-reading-file-placeholder" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FolderReadingView — renders folder as a continuous reading chapter
// ---------------------------------------------------------------------------

export default function FolderReadingView({ folderNode, selectedProject }) {
  const readingList = useMemo(() => buildReadingList(folderNode), [folderNode]);

  return (
    <div className="folder-reading-view">
      {readingList.map((item) => {
        if (item.type === "folder-heading") {
          return (
            <div
              key={item.node.id}
              className={`folder-reading-chapter-heading folder-reading-chapter-heading--depth-${item.depth}`}
              data-folder-section-id={item.node.id}
            >
              {item.node.name}
            </div>
          );
        }

        if (item.type === "file") {
          return (
            <FileDocSection
              key={item.node.id}
              fileNode={item.node}
              selectedProject={selectedProject}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
