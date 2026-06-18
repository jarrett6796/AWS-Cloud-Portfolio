import { useEffect, useRef, useState } from "react";
import { cleanAnswerText } from "../utils/ragDisplay";

const VISIBLE_CHAT_ROLES = new Set(["user", "assistant"]);
const CHAT_POSITION_STORAGE_KEY = "portfolioAssistantWorkspacePosition";
const DRAG_VIEWPORT_MARGIN = 16;

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

function SourceList({ sources }) {
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

function AssistantProjectTitle({ activeProjectId, activeProjectName }) {
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

function SampleResponse({ chatSuggestions, responseText }) {
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

function loadWorkspacePosition() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedPosition = window.localStorage.getItem(CHAT_POSITION_STORAGE_KEY);

  if (!storedPosition) {
    return null;
  }

  try {
    const position = JSON.parse(storedPosition);

    if (Number.isFinite(position.x) && Number.isFinite(position.y)) {
      return position;
    }
  } catch (error) {
    console.warn("Could not parse assistant workspace position:", error);
  }

  return null;
}

function clampWorkspacePosition(position, dimensions) {
  if (typeof window === "undefined") {
    return position;
  }

  const maxX = Math.max(
    DRAG_VIEWPORT_MARGIN,
    window.innerWidth - dimensions.width - DRAG_VIEWPORT_MARGIN,
  );
  const maxY = Math.max(
    DRAG_VIEWPORT_MARGIN,
    window.innerHeight - dimensions.height - DRAG_VIEWPORT_MARGIN,
  );

  return {
    x: Math.min(Math.max(position.x, DRAG_VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(position.y, DRAG_VIEWPORT_MARGIN), maxY),
  };
}

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
  chatMessages,
  isChatLoading,
  chatError,
  chatStatus,
  handleChatSubmit,
  onNewChat,
  labels,
  chatSuggestions,
  launcherExpandedLines,
  projectWorkspaces,
  activeProjectId,
  activeProjectName,
  onSelectProject,
}) {
  const workspaceRef = useRef(null);
  const dragStateRef = useRef(null);
  const isChatExpandedRef = useRef(isChatExpanded);
  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] = useState(true);
  const [workspacePosition, setWorkspacePosition] = useState(
    loadWorkspacePosition,
  );
  const [isDraggingWorkspace, setIsDraggingWorkspace] = useState(false);
  const workspaceEntries = Object.entries(projectWorkspaces);
  const displayAnswer = cleanAnswerText(chatAnswer);
  const hasMessages = chatMessages.length > 0;
  const currentMessageStatus = chatStatus?.replace(" • ", " ") || "";
  const responseText =
    displayAnswer ||
    chatError ||
    (isChatLoading ? "Response in progress." : labels.sampleResponse);
  const handleComposerKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!chatQuestion.trim() || isChatLoading) {
      return;
    }

    handleChatSubmit(event);
  };
  const workspaceStyle =
    workspacePosition && !isChatExpanded
      ? {
          left: `${workspacePosition.x}px`,
          top: `${workspacePosition.y}px`,
          right: "auto",
          bottom: "auto",
        }
      : undefined;
  const launcherStyle = workspacePosition
    ? {
        left: `${workspacePosition.x}px`,
        top: `${workspacePosition.y}px`,
        right: "auto",
        bottom: "auto",
      }
    : undefined;

  const handleHeaderPointerDown = (event) => {
    if (isChatExpanded || event.button !== 0 || !workspaceRef.current) {
      return;
    }

    const interactiveTarget = event.target.closest(
      "button, select, textarea, input, a",
    );

    if (interactiveTarget) {
      return;
    }

    const workspaceRect = workspaceRef.current.getBoundingClientRect();

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - workspaceRect.left,
      offsetY: event.clientY - workspaceRect.top,
      width: workspaceRect.width,
      height: workspaceRect.height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingWorkspace(true);
    event.preventDefault();
  };

  const handleHeaderPointerMove = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextPosition = clampWorkspacePosition(
      {
        x: event.clientX - dragState.offsetX,
        y: event.clientY - dragState.offsetY,
      },
      dragState,
    );

    setWorkspacePosition(nextPosition);
  };

  const finishWorkspaceDrag = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setIsDraggingWorkspace(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released if the drag was cancelled.
    }
  };

  useEffect(() => {
    isChatExpandedRef.current = isChatExpanded;
  }, [isChatExpanded]);

  useEffect(() => {
    if (!workspacePosition || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      CHAT_POSITION_STORAGE_KEY,
      JSON.stringify(workspacePosition),
    );
  }, [workspacePosition]);

  useEffect(() => {
    if (
      !workspacePosition ||
      !workspaceRef.current ||
      isChatExpandedRef.current
    ) {
      return;
    }

    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const nextPosition = clampWorkspacePosition(workspacePosition, {
      width: workspaceRect.width,
      height: workspaceRect.height,
    });

    if (
      nextPosition.x !== workspacePosition.x ||
      nextPosition.y !== workspacePosition.y
    ) {
      setWorkspacePosition(nextPosition);
    }
  }, [isWorkspaceSidebarOpen, workspacePosition]);

  return (
    <>
      {isChatOpen && (
        <div
          className="chat-page-backdrop"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <div
        ref={workspaceRef}
        className={`assistant-workspace-shell ${
          isChatOpen ? "is-open" : ""
        } ${isChatExpanded ? "is-expanded" : ""} ${
          isWorkspaceSidebarOpen ? "is-sidebar-open" : "is-sidebar-collapsed"
        } ${isDraggingWorkspace ? "is-dragging" : ""}`}
        aria-hidden={!isChatOpen}
        style={workspaceStyle}
      >
        <aside
          className={`project-workspace-sidebar ${
            isWorkspaceSidebarOpen ? "" : "is-collapsed"
          }`}
          aria-label="Project workspaces"
        >
          <div className="project-workspace-sidebar-header">
            <span>Projects</span>
          </div>

          <div className="project-workspace-list">
            {workspaceEntries.map(([projectId, workspace]) => (
              <button
                key={projectId}
                className={
                  projectId === activeProjectId ? "is-active" : undefined
                }
                type="button"
                onClick={() => onSelectProject(projectId)}
                aria-pressed={projectId === activeProjectId}
                title={workspace.fullName}
                tabIndex={isChatOpen && isWorkspaceSidebarOpen ? 0 : -1}
              >
                <span className="workspace-short-label">
                  {workspace.shortLabel}
                </span>
                <span className="workspace-full-label">
                  {workspace.fullName}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <button
          className="project-sidebar-toggle"
          type="button"
          onClick={() =>
            setIsWorkspaceSidebarOpen((currentValue) => !currentValue)
          }
          aria-label={
            isWorkspaceSidebarOpen
              ? "Collapse project workspace sidebar"
              : "Open project workspace sidebar"
          }
          aria-expanded={isWorkspaceSidebarOpen}
          tabIndex={isChatOpen ? 0 : -1}
        >
          <span aria-hidden="true">{isWorkspaceSidebarOpen ? "‹" : "›"}</span>
        </button>

        <section
          className="chat-window"
          id="portfolio-chat-panel"
          aria-labelledby="chat-title"
        >
          <div className="chat-header">
            <div
              className="chat-title-group"
              onPointerDown={handleHeaderPointerDown}
              onPointerMove={handleHeaderPointerMove}
              onPointerUp={finishWorkspaceDrag}
              onPointerCancel={finishWorkspaceDrag}
            >
              <AssistantProjectTitle
                activeProjectId={activeProjectId}
                activeProjectName={activeProjectName}
              />
              <p>Project-specific AI workspace</p>
            </div>

            <button
              className="chat-reset"
              type="button"
              onClick={onNewChat}
              aria-label={labels.newChat}
              title={labels.newChat}
              disabled={isChatLoading}
              tabIndex={isChatOpen ? 0 : -1}
            >
              <span aria-hidden="true">↻</span>
            </button>

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

          <div className="chat-main">
            <div className="chat-thread">
              <div className="chat-messages" aria-live="polite">
                {hasMessages ? (
                  chatMessages
                    .filter((message) => VISIBLE_CHAT_ROLES.has(message.role))
                    .map((message) => {
                      const isAssistant = message.role === "assistant";
                      const messageText = isAssistant
                        ? cleanAnswerText(message.content)
                        : message.content;
                      const messageStatus =
                        isAssistant && message.status
                          ? message.status.replace(" • ", " ")
                          : "";
                      const sources = Array.isArray(message.sources)
                        ? message.sources
                        : [];

                      return (
                        <article
                          className={`chat-message ${
                            isAssistant ? "is-assistant" : "is-user"
                          }`}
                          key={message.id}
                        >
                          {isAssistant ? (
                            <div className="assistant-message-header">
                              <span className="message-role">GCP RAG</span>
                              {messageStatus && (
                                <span className="message-status">
                                  {messageStatus}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="message-role">You</span>
                          )}
                          <p>{messageText || "Response in progress."}</p>

                          {isAssistant && sources.length > 0 && (
                            <details className="chat-sources">
                              <summary>Sources used</summary>
                              <SourceList sources={sources} />
                            </details>
                          )}
                        </article>
                      );
                    })
                ) : (
                  <article className="chat-message is-assistant">
                    <div className="assistant-message-header">
                      <span className="message-role">
                        {chatAnswer || chatError || isChatLoading
                          ? "GCP RAG"
                          : labels.sampleLabel}
                      </span>
                      {currentMessageStatus && (
                        <span className="message-status">
                          {currentMessageStatus}
                        </span>
                      )}
                    </div>
                    {chatAnswer || chatError || isChatLoading ? (
                      <p>{responseText}</p>
                    ) : (
                      <SampleResponse
                        chatSuggestions={chatSuggestions}
                        responseText={responseText}
                      />
                    )}

                    {chatSources.length > 0 && (
                      <details className="chat-sources">
                        <summary>Sources used</summary>
                        <SourceList sources={chatSources} />
                      </details>
                    )}
                  </article>
                )}
              </div>
            </div>
          </div>
          <form
            className="chat-composer"
            aria-label={labels.composer}
            onSubmit={handleChatSubmit}
          >
            <textarea
              value={chatQuestion}
              onChange={(event) => setChatQuestion(event.target.value)}
              onKeyDown={handleComposerKeyDown}
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
        </section>
      </div>

      <button
        className={`chat-launcher ${isChatOpen ? "is-hidden" : ""}`}
        type="button"
        onClick={onToggle}
        aria-controls="portfolio-chat-panel"
        aria-expanded={isChatOpen}
        aria-label={isChatOpen ? labels.close : labels.open}
        style={launcherStyle}
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
