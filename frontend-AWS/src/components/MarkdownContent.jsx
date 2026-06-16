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
        const key = `${block.type}-${block.title ?? block.text ?? index}`;

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
