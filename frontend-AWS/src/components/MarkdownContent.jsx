import { useEffect, useId, useMemo, useState } from "react";

function InlineMarkdown({ text }) {
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <a href={match[2]} key={`${match[1]}-${match.index}`} rel="noreferrer" target="_blank">
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const calloutLabels = {
  note: "Note",
  info: "Info",
  tip: "Tip",
  warning: "Warning",
  danger: "Danger",
  success: "Success",
  aws: "AWS",
  gcp: "GCP",
};

function MermaidDiagram({ code }) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [themeName, setThemeName] = useState("default");
  const diagramId = useMemo(
    () => `project-mermaid-${reactId.replace(/[^A-Za-z0-9_-]/g, "")}`,
    [reactId],
  );

  useEffect(() => {
    const updateThemeName = () => {
      setThemeName(
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "dark"
          : "default",
      );
    };
    const observer = new MutationObserver(updateThemeName);

    updateThemeName();
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const renderId =
      themeName === "dark"
        ? `${diagramId}-dark`
        : `${diagramId}-default`;

    import("mermaid")
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          securityLevel: "strict",
          startOnLoad: false,
          theme: themeName,
        });

        return mermaid.render(renderId, code);
      })
      .then(({ svg: renderedSvg }) => {
        if (isCurrent) {
          setSvg(renderedSvg);
          setError("");
        }
      })
      .catch((renderError) => {
        if (isCurrent) {
          setSvg("");
          setError(renderError.message ?? "Unable to render Mermaid diagram.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [code, diagramId, themeName]);

  if (error) {
    return (
      <pre className="project-markdown-code" data-language="mermaid">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <figure className="project-markdown-mermaid">
      {svg ? (
        <div
          className="project-markdown-mermaid-svg"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="project-markdown-code" data-language="mermaid">
          <code>{code}</code>
        </pre>
      )}
    </figure>
  );
}

function Callout({ block }) {
  const calloutType = block.calloutType ?? "note";

  return (
    <aside
      className={`project-markdown-callout project-markdown-callout-${calloutType}`}
    >
      <p className="project-markdown-callout-title">
        {block.title || calloutLabels[calloutType] || calloutLabels.note}
      </p>
      <MarkdownContent blocks={block.blocks} />
    </aside>
  );
}

function MarkdownTable({ headers, rows }) {
  return (
    <div className="project-markdown-table-wrap">
      <table className="project-markdown-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>
                <InlineMarkdown text={header} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>
                  <InlineMarkdown text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LinkList({ links }) {
  return (
    <ul className="project-markdown-link-list">
      {links.map((link) => (
        <li key={link.href ?? link.label}>
          {link.href ? (
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ) : (
            <span>{link.label}</span>
          )}
          {link.description && <p>{link.description}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function MarkdownContent({ blocks }) {
  return (
    <div className="project-markdown">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}-${block.title ?? block.text ?? block.code ?? ""}`;

        if (block.type === "heading") {
          const HeadingTag = block.level === 3 ? "h3" : "h2";
          return <HeadingTag key={key}>{block.text}</HeadingTag>;
        }

        if (block.type === "paragraph") {
          return (
            <p key={key}>
              <InlineMarkdown text={block.text} />
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={key}>
              {block.items.map((item) => (
                <li key={item}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={key}>
              {block.items.map((item) => (
                <li key={item}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "table") {
          return (
            <MarkdownTable
              headers={block.headers}
              key={key}
              rows={block.rows}
            />
          );
        }

        if (block.type === "code") {
          return (
            <pre
              className="project-markdown-code"
              data-language={block.language}
              key={key}
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "workflow") {
          return (
            <pre className="project-markdown-workflow" key={key}>
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "mermaid") {
          return <MermaidDiagram code={block.code} key={key} />;
        }

        if (block.type === "callout") {
          return <Callout block={block} key={key} />;
        }

        if (block.type === "quote") {
          return (
            <blockquote key={key}>
              <InlineMarkdown text={block.text} />
            </blockquote>
          );
        }

        if (block.type === "links") {
          return <LinkList key={key} links={block.links} />;
        }

        if (block.type === "image") {
          return (
            <figure className="project-markdown-figure" key={key}>
              {block.src ? (
                <img
                  src={block.src}
                  alt={block.alt ?? block.caption ?? ""}
                  onError={(event) => {
                    event.currentTarget.parentElement?.classList.add(
                      "is-image-missing",
                    );
                  }}
                />
              ) : null}
              <figcaption>{block.caption}</figcaption>
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
