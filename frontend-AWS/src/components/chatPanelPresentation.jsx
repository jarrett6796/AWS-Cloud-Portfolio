function getSourceLabel(source, index) {
  return source.source_id || `S${index + 1}`;
}

function getSourceDetail(source) {
  if (source.heading) {
    return source.heading;
  }

  if (source.chunk_index !== undefined && source.chunk_index !== null) {
    return `Chunk ${source.chunk_index}`;
  }

  return "";
}

export function SourceList({ sources }) {
  return (
    <ul>
      {sources.map((source, index) => {
        const sourceLabel = getSourceLabel(source, index);
        const sourceDetail = getSourceDetail(source);

        return (
          <li key={`${source.source_id || source.file_name || "source"}-${index}`}>
            <span className="chat-source-line">
              <strong>[{sourceLabel}]</strong>
              <span>{source.file_name || "Retrieved source"}</span>
              {sourceDetail && <small>/ {sourceDetail}</small>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function AssistantProjectTitle({ activeProjectId, activeProjectName }) {
  if (activeProjectId === "project1") {
    return (
      <h1 className="assistant-project-title" id="chat-title">
        <span className="assistant-title-aws">
          AWS Cloud Resume Challenge
        </span>
        <span className="assistant-title-gcp"> + GCP RAG</span>
      </h1>
    );
  }

  return (
    <h1 className="assistant-project-title" id="chat-title">
      {activeProjectName}
    </h1>
  );
}

export function SampleResponse({ chatSuggestions, responseText }) {
  return (
    <>
      <div className="chat-sample-prompts">
        <span>Try asking:</span>
        <ol>
          {chatSuggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ol>
      </div>
      <p>{responseText}</p>
    </>
  );
}
