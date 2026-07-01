/**
 * ContinuousDocReader — renders the entire documentation tree as a single
 * scrollable reading surface, with chapter transitions between documents.
 *
 * Documents are loaded lazily via IntersectionObserver so the initial render
 * is fast regardless of how many files the project contains.
 *
 * Each document section carries a `data-reader-file-id` attribute that the
 * parent scroll-spy uses to determine which document is currently in view.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import { getProjectDocumentByPath } from "../content/projectDocs.js";
import { useNearSectionEnd } from "../hooks/useNearSectionEnd.js";

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

function countFilesInNode(node) {
  if (node.type === "file") return 1;
  return node.children.reduce((sum, child) => sum + countFilesInNode(child), 0);
}

function findFirstFileInNode(node) {
  if (node.type === "file") return node;
  for (const child of node.children) {
    const found = findFirstFileInNode(child);
    if (found) return found;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Reading list builder (exported so ProjectModal can share the same order)
// ---------------------------------------------------------------------------

/**
 * Flattens the doc tree into an ordered list of { fileNode, displayPath }.
 *
 * displayPath is used in chapter transitions:
 *   - Root file              → "Overview"
 *   - Single-file category   → "Implementation / 前端React+Vite"  (folder name, no filename)
 *   - Multi-file category    → "Implementation / GCP / RAG Pipeline"
 *
 * Empty folders are skipped.
 */
export function flattenTreeToReadingList(nodes, folderPath = []) {
  const list = [];

  for (const node of nodes) {
    if (node.type === "file") {
      list.push({
        fileNode: node,
        displayPath: [...folderPath, node.name].join(" / "),
      });
    } else if (node.type === "folder") {
      const fileCount = countFilesInNode(node);
      if (fileCount === 0) continue;

      if (fileCount === 1) {
        // Single-file category: use the folder name as the display label
        // so the filename is never surfaced.
        const fileNode = findFirstFileInNode(node);
        list.push({
          fileNode,
          displayPath: [...folderPath, node.name].join(" / "),
        });
      } else {
        // Multi-file folder: recurse with this folder prepended to the path.
        flattenTreeToReadingList(node.children, [...folderPath, node.name])
          .forEach((item) => list.push(item));
      }
    }
  }

  return list;
}

// ---------------------------------------------------------------------------
// Chapter transition — a minimal visual separator between documents
// ---------------------------------------------------------------------------

function ChapterTransition({ displayPath }) {
  return (
    <div className="doc-reader-transition" aria-hidden="true">
      <div className="doc-reader-transition-rule" />
      <div className="doc-reader-transition-body">
        <span className="doc-reader-transition-label">Continue Reading</span>
        <span className="doc-reader-transition-path">{displayPath}</span>
        <span className="doc-reader-transition-arrow">↓</span>
      </div>
      <div className="doc-reader-transition-rule" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocSection — a single lazily-loaded document within the continuous stream
// ---------------------------------------------------------------------------

function DocSection({ item, selectedProject, isFirst, isLast, continueLabel }) {
  // The first document loads immediately; later ones wait for the viewport.
  const [isLoaded, setIsLoaded] = useState(isFirst);
  const containerRef = useRef(null);
  const isNearEnd = useNearSectionEnd(containerRef);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoaded]);

  const parsedDoc = useMemo(() => {
    if (!isLoaded) return null;
    return getProjectDocumentByPath(selectedProject, item.fileNode);
  }, [isLoaded, item.fileNode, selectedProject]);

  return (
    <>
      {!isFirst && <ChapterTransition displayPath={item.displayPath} />}
      <section
        ref={containerRef}
        className="doc-reader-section"
        data-reader-file-id={item.fileNode.id}
      >
        {parsedDoc ? (
          <div className={`doc-reader-section-content${isFirst ? "" : " doc-reader-section-content--animated"}`}>
            <MarkdownContent blocks={parsedDoc.blocks} />
          </div>
        ) : (
          <div className="doc-reader-section-placeholder" aria-hidden="true" />
        )}

        {!isLast && (
          <div
            className={`doc-reader-continue-hint${isNearEnd ? " is-visible" : ""}`}
            aria-hidden="true"
          >
            <span className="doc-reader-continue-hint-arrow">↓</span>
            <span>{continueLabel}</span>
          </div>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// ContinuousDocReader
// ---------------------------------------------------------------------------

export default function ContinuousDocReader({ tree, selectedProject, content }) {
  const readingList = useMemo(() => flattenTreeToReadingList(tree), [tree]);

  if (readingList.length === 0) return null;

  const continueLabel = content?.projects?.continueReading;

  return (
    <div className="doc-reader">
      {readingList.map((item, index) => (
        <DocSection
          key={item.fileNode.path ?? item.fileNode.id}
          item={item}
          selectedProject={selectedProject}
          isFirst={index === 0}
          isLast={index === readingList.length - 1}
          continueLabel={continueLabel}
        />
      ))}
    </div>
  );
}
