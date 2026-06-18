import { Component, useEffect, useId, useMemo, useState } from "react";

function logMarkdownWarning(message, details) {
  if (details) {
    console.warn(`[Markdown Warning]\n${message}`, details);
    return;
  }

  console.warn(`[Markdown Warning]\n${message}`);
}

function InlineMarkdown({ text }) {
  const parts = [];
  const inlinePattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      parts.push(
        <a
          href={match[3]}
          key={`link-${match.index}`}
          rel="noreferrer"
          target="_blank"
        >
          {match[2]}
        </a>,
      );
    } else {
      parts.push(<strong key={`strong-${match.index}`}>{match[4]}</strong>);
    }
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

const languageAliases = {
  javascript: "js",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  markdown: "md",
};

const languageLabels = {
  bash: "bash",
  css: "css",
  html: "html",
  js: "js",
  json: "json",
  jsx: "jsx",
  md: "md",
  python: "python",
  text: "text",
  yaml: "yaml",
};

const highlightRules = {
  bash: [
    ["comment", /^#.*/],
    ["string", /^"(?:\\.|[^"\\])*"/],
    ["string", /^'(?:\\.|[^'\\])*'/],
    ["number", /^\b\d+(?:\.\d+)?\b/],
    [
      "keyword",
      /^\b(?:aws|cd|cp|curl|do|done|echo|else|export|fi|for|git|if|in|mkdir|npm|python3?|rm|then|yarn)\b/,
    ],
    ["property", /^--?[A-Za-z0-9][\w-]*/],
  ],
  css: [
    ["comment", /^\/\*[\s\S]*?\*\//],
    ["string", /^"(?:\\.|[^"\\])*"/],
    ["string", /^'(?:\\.|[^'\\])*'/],
    ["property", /^--?[\w-]+(?=\s*:)/],
    ["keyword", /^@[A-Za-z-]+/],
    ["number", /^#[0-9A-Fa-f]{3,8}\b/],
    ["number", /^\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|svh|%|s|ms)?\b/],
    ["selector", /^[.#]?[A-Za-z_][\w-]*(?=[\s,{.#[:>+~])/],
  ],
  html: [
    ["comment", /^<!--[\s\S]*?-->/],
    ["tag", /^<\/?[A-Za-z][\w:-]*/],
    ["tag", /^\/?>/],
    ["property", /^[A-Za-z_:][\w:.-]*(?==)/],
    ["string", /^"(?:&quot;|[^"])*"/],
    ["string", /^'(?:&#39;|[^'])*'/],
  ],
  js: [
    ["comment", /^\/\/.*/],
    ["comment", /^\/\*[\s\S]*?\*\//],
    ["string", /^`(?:\\.|[^`\\])*`/],
    ["string", /^"(?:\\.|[^"\\])*"/],
    ["string", /^'(?:\\.|[^'\\])*'/],
    ["number", /^\b\d+(?:\.\d+)?\b/],
    [
      "keyword",
      /^\b(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|let|new|null|return|switch|throw|true|try|typeof|undefined|while)\b/,
    ],
    ["function", /^\b[A-Za-z_$][\w$]*(?=\s*\()/],
  ],
  json: [
    ["property", /^"(?:\\.|[^"\\])*"(?=\s*:)/],
    ["string", /^"(?:\\.|[^"\\])*"/],
    ["number", /^-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i],
    ["keyword", /^\b(?:true|false|null)\b/],
  ],
  md: [
    ["comment", /^#{1,6}\s.+/],
    ["keyword", /^[-*+]\s/],
    ["keyword", /^\d+\.\s/],
    ["string", /^\[[^\]]+\]\([^)]+\)/],
    ["string", /^`[^`]+`/],
    ["property", /^\*\*[^*]+\*\*/],
  ],
  python: [
    ["comment", /^#.*/],
    ["string", /^"{3}[\s\S]*?"{3}/],
    ["string", /^'{3}[\s\S]*?'{3}/],
    ["string", /^"(?:\\.|[^"\\])*"/],
    ["string", /^'(?:\\.|[^'\\])*'/],
    ["number", /^\b\d+(?:\.\d+)?\b/],
    [
      "keyword",
      /^\b(?:as|async|await|break|class|continue|def|elif|else|except|False|finally|for|from|if|import|in|is|lambda|None|not|or|pass|raise|return|True|try|while|with|yield)\b/,
    ],
    ["function", /^\b[A-Za-z_]\w*(?=\s*\()/],
  ],
  yaml: [
    ["comment", /^#.*/],
    ["property", /^[\w.-]+(?=\s*:)/],
    ["string", /^"(?:\\.|[^"\\])*"/],
    ["string", /^'(?:\\.|[^'\\])*'/],
    ["number", /^\b\d+(?:\.\d+)?\b/],
    ["keyword", /^\b(?:true|false|null|yes|no|on|off)\b/],
  ],
};

highlightRules.jsx = highlightRules.js;

function normalizeLanguage(language) {
  const normalizedLanguage = (language ?? "").trim().toLowerCase();
  return languageAliases[normalizedLanguage] ?? normalizedLanguage;
}

function highlightCode(code, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const rules = highlightRules[normalizedLanguage];

  if (!rules) {
    return code;
  }

  const tokens = [];
  let index = 0;

  while (index < code.length) {
    const remainingCode = code.slice(index);
    const whitespaceMatch = remainingCode.match(/^\s+/);

    if (whitespaceMatch) {
      tokens.push(whitespaceMatch[0]);
      index += whitespaceMatch[0].length;
      continue;
    }

    const matchedRule = rules.find(([, pattern]) => pattern.test(remainingCode));

    if (matchedRule) {
      const [tokenType, pattern] = matchedRule;
      const [token] = remainingCode.match(pattern);
      tokens.push(
        <span className={`syntax-token syntax-${tokenType}`} key={index}>
          {token}
        </span>,
      );
      index += token.length;
      continue;
    }

    tokens.push(code[index]);
    index += 1;
  }

  return tokens;
}

function CodeBlock({ code, language = "", variant = "code" }) {
  const normalizedLanguage = normalizeLanguage(language);
  const displayLanguage = languageLabels[normalizedLanguage] ?? normalizedLanguage;
  const hasLanguage = Boolean(displayLanguage);

  return (
    <figure
      className={`project-markdown-code-frame project-markdown-code-frame-${variant}`}
      data-language={displayLanguage}
    >
      {hasLanguage ? <figcaption>{displayLanguage}</figcaption> : null}
      <pre
        className={`project-markdown-code project-markdown-code-${variant}`}
        data-language={displayLanguage}
      >
        <code>{highlightCode(code, normalizedLanguage)}</code>
      </pre>
    </figure>
  );
}

function TextDiagramBlock({ code }) {
  return (
    <figure className="project-markdown-text-diagram">
      <pre>
        <span>{code}</span>
      </pre>
    </figure>
  );
}

function MarkdownWarningBlock({ message, children }) {
  return (
    <figure className="project-markdown-warning-block">
      <p>{message}</p>
      {children}
    </figure>
  );
}

class MarkdownBlockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    logMarkdownWarning("Invalid markdown block detected", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <MarkdownWarningBlock message="[ Markdown Block Failed To Render ]" />
      );
    }

    return this.props.children;
  }
}

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
          flowchart: {
            htmlLabels: false,
            nodeSpacing: 38,
            padding: 14,
            rankSpacing: 42,
            useMaxWidth: false,
          },
          securityLevel: "strict",
          sequence: {
            boxMargin: 10,
            diagramMarginX: 20,
            diagramMarginY: 14,
            useMaxWidth: false,
          },
          startOnLoad: false,
          theme: themeName,
          themeVariables: {
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontSize: "13px",
          },
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
          logMarkdownWarning("Mermaid diagram failed to render.", renderError);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [code, diagramId, themeName]);

  if (error) {
    return (
      <MarkdownWarningBlock message="[ Mermaid Diagram Failed To Render ]">
        <CodeBlock code={code} language="mermaid" />
      </MarkdownWarningBlock>
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
        <CodeBlock code={code} language="mermaid" />
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

function MarkdownImage({ src, alt = "", caption = "", className }) {
  const [isMissing, setIsMissing] = useState(!src);

  if (isMissing) {
    return (
      <figure className={`${className} is-image-missing`}>
        <div className="project-markdown-image-fallback">Image Not Found</div>
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => {
          logMarkdownWarning(`Gallery image missing:\n${src}`);
          setIsMissing(true);
        }}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function ImageGallery({ images }) {
  return (
    <div className="project-markdown-gallery">
      {images.map((image) => (
        <MarkdownImage
          alt={image.title ?? ""}
          caption={image.title}
          className="project-markdown-gallery-item"
          key={image.src}
          src={image.src}
        />
      ))}
    </div>
  );
}

function ColumnsLayout({ block }) {
  return (
    <div
      className="project-markdown-columns"
      style={{ "--columns-count": block.columnCount }}
    >
      {block.columns.map((columnBlocks, columnIndex) => (
        <div className="project-markdown-column" key={`column-${columnIndex}`}>
          <MarkdownContent blocks={columnBlocks} />
        </div>
      ))}
    </div>
  );
}

export default function MarkdownContent({ blocks }) {
  const renderBlock = (block) => {
    if (block.type === "heading") {
      const HeadingTag = block.level === 3 ? "h3" : "h2";
      return <HeadingTag>{block.text}</HeadingTag>;
    }

    if (block.type === "paragraph") {
      return (
        <p>
          <InlineMarkdown text={block.text} />
        </p>
      );
    }

    if (block.type === "list") {
      return (
        <ul>
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
        <ol>
          {block.items.map((item) => (
            <li key={item}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>
      );
    }

    if (block.type === "table") {
      return <MarkdownTable headers={block.headers} rows={block.rows} />;
    }

    if (block.type === "columns") {
      return <ColumnsLayout block={block} />;
    }

    if (block.type === "code") {
      return <CodeBlock code={block.code} language={block.language} />;
    }

    if (block.type === "workflow") {
      return <TextDiagramBlock code={block.code} />;
    }

    if (block.type === "mermaid") {
      return <MermaidDiagram code={block.code} />;
    }

    if (block.type === "gallery") {
      return <ImageGallery images={block.images} />;
    }

    if (block.type === "callout") {
      return <Callout block={block} />;
    }

    if (block.type === "quote") {
      return (
        <blockquote>
          <InlineMarkdown text={block.text} />
        </blockquote>
      );
    }

    if (block.type === "hr") {
      return <hr className="project-markdown-divider" />;
    }

    if (block.type === "links") {
      return <LinkList links={block.links} />;
    }

    if (block.type === "image") {
      return (
        <MarkdownImage
          alt={block.alt ?? block.caption ?? ""}
          caption={block.caption}
          className="project-markdown-figure"
          src={block.src}
        />
      );
    }

    if (block.type === "warning") {
      return <MarkdownWarningBlock message={block.message} />;
    }

    logMarkdownWarning("Invalid markdown block detected", block);
    return null;
  };

  return (
    <div className="project-markdown">
      {blocks.map((block, index) => {
        const blockKey = `${block.type}-${index}-${block.title ?? block.text ?? block.code ?? ""}`;
        return (
          <MarkdownBlockErrorBoundary key={blockKey}>
            {renderBlock(block)}
          </MarkdownBlockErrorBoundary>
        );
      })}
    </div>
  );
}
