export default function ChatPanel({
  isChatOpen,
  isChatExpanded,
  onClose,
  onToggle,
  onToggleExpanded,
  chatQuestion,
  setChatQuestion,
  chatAnswer,
  chatSources,
  isChatLoading,
  chatError,
  handleChatSubmit,
  labels,
  chatContext,
  chatSuggestions,
  launcherExpandedLines,
}) {
  return (
    <>
      {isChatOpen && <div className="chat-page-backdrop" aria-hidden="true" />}

      <aside
        className={`chat-window ${isChatOpen ? "is-open" : ""} ${
          isChatExpanded ? "is-expanded" : ""
        }`}
        id="portfolio-chat-panel"
        aria-hidden={!isChatOpen}
        aria-labelledby="chat-title"
      >
        <div className="chat-header">
          <div>
            <p>{chatContext}</p>
            <h2 id="chat-title">{labels.title}</h2>
          </div>

          <button
            className="chat-expand"
            type="button"
            onClick={onToggleExpanded}
            aria-label={isChatExpanded ? labels.collapse : labels.expand}
            aria-pressed={isChatExpanded}
            tabIndex={isChatOpen ? 0 : -1}
          >
            <span aria-hidden="true">{isChatExpanded ? "⤡" : "⤢"}</span>
          </button>

          <button
            className="chat-close"
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            tabIndex={isChatOpen ? 0 : -1}
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>

        <div className="chat-thread">
          <div className="chat-suggestions">
            <p>{labels.suggestionsLabel}</p>
            <div>
              {chatSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setChatQuestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <article className="assistant-message">
            <span>
              {isChatLoading
                ? "Thinking"
                : chatAnswer || chatError
                  ? "Response"
                  : labels.sampleLabel}
            </span>
            <p>
              {isChatLoading
                ? "Retrieving project context and generating a response..."
                : chatError || chatAnswer || labels.sampleResponse}
            </p>
          </article>

          {chatSources.length > 0 && (
            <div className="chat-sources">
              <p>Sources</p>
              <ul>
                {chatSources.map((source, index) => (
                  <li key={`${source.file_name || "source"}-${index}`}>
                    <span>{source.file_name || "Retrieved source"}</span>
                    {source.chunk_index !== undefined && (
                      <small>Chunk {source.chunk_index}</small>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form
          className="chat-composer"
          aria-label={labels.composer}
          onSubmit={handleChatSubmit}
        >
          <textarea
            value={chatQuestion}
            onChange={(event) => setChatQuestion(event.target.value)}
            placeholder={labels.placeholder}
            rows="2"
            disabled={isChatLoading}
          />
          <button
            type="submit"
            aria-label={labels.send}
            disabled={isChatLoading || !chatQuestion.trim()}
          >
            <span aria-hidden="true" />
          </button>
        </form>
      </aside>

      <button
        className={`chat-launcher ${isChatOpen ? "is-hidden" : ""}`}
        type="button"
        onClick={onToggle}
        aria-controls="portfolio-chat-panel"
        aria-expanded={isChatOpen}
        aria-label={isChatOpen ? labels.close : labels.open}
      >
        <span className="chat-launcher-compact" aria-hidden="true">
          <span>{labels.askLineOne}</span>
          <span>{labels.askLineTwo}</span>
        </span>
        <span className="chat-launcher-expanded" aria-hidden="true">
          <span>{launcherExpandedLines[0]}</span>
          <span>{launcherExpandedLines[1]}</span>
        </span>
      </button>
    </>
  );
}
