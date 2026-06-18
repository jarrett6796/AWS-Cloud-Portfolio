import { useEffect, useRef, useState } from "react";
import { cleanAnswerText } from "../utils/ragDisplay";

const VISIBLE_CHAT_ROLES = new Set(["user", "assistant"]);
const CHAT_WIDGET_POSITION_STORAGE_KEY = "portfolioAssistantWidgetPosition";
const DEFAULT_DOCK_SIDE = "right";
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

function loadWidgetPosition() {
  if (typeof window === "undefined") {
    return {
      side: DEFAULT_DOCK_SIDE,
      y: null,
    };
  }

  const storedPosition = window.localStorage.getItem(
    CHAT_WIDGET_POSITION_STORAGE_KEY,
  );

  if (!storedPosition) {
    return {
      side: DEFAULT_DOCK_SIDE,
      y: null,
    };
  }

  try {
    const position = JSON.parse(storedPosition);
    const side = position.side === "left" ? "left" : DEFAULT_DOCK_SIDE;

    return {
      side,
      y: Number.isFinite(position.y) ? position.y : null,
    };
  } catch (error) {
    console.warn("Could not parse assistant widget position:", error);
  }

  return {
    side: DEFAULT_DOCK_SIDE,
    y: null,
  };
}

function getDefaultLauncherY() {
  if (typeof window === "undefined") {
    return null;
  }

  return Math.round(window.innerHeight * 0.55 - 38);
}

function getStoredY(widgetPosition) {
  return Number.isFinite(widgetPosition.y)
    ? widgetPosition.y
    : getDefaultLauncherY();
}

function clampVerticalPosition(y, height) {
  if (typeof window === "undefined") {
    return y;
  }

  const maxY = Math.max(
    DRAG_VIEWPORT_MARGIN,
    window.innerHeight - height - DRAG_VIEWPORT_MARGIN,
  );

  return Math.min(Math.max(y, DRAG_VIEWPORT_MARGIN), maxY);
}

function clampFloatingPosition(position, dimensions) {
  if (typeof window === "undefined") {
    return position;
  }

  const minX = dimensions.edgeSnap ? 0 : DRAG_VIEWPORT_MARGIN;
  const maxX = Math.max(
    minX,
    window.innerWidth - dimensions.width - minX,
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

function getDockSideFromPosition(x, width) {
  if (typeof window === "undefined") {
    return DEFAULT_DOCK_SIDE;
  }

  return x + width / 2 < window.innerWidth / 2 ? "left" : "right";
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
  const launcherRef = useRef(null);
  const dragStateRef = useRef(null);
  const launcherDragStateRef = useRef(null);
  const suppressLauncherClickRef = useRef(false);
  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] = useState(true);
  const [widgetPosition, setWidgetPosition] = useState(loadWidgetPosition);
  const [workspaceDragPosition, setWorkspaceDragPosition] = useState(null);
  const [launcherDragPosition, setLauncherDragPosition] = useState(null);
  const [isDraggingWorkspace, setIsDraggingWorkspace] = useState(false);
  const [isDraggingLauncher, setIsDraggingLauncher] = useState(false);
  const workspaceEntries = Object.entries(projectWorkspaces);
  const dockSide = widgetPosition.side;
  const isDockedLeft = dockSide === "left";
  const sidebarToggleIcon = isWorkspaceSidebarOpen
    ? isDockedLeft
      ? "›"
      : "‹"
    : isDockedLeft
      ? "‹"
      : "›";
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
  const workspaceStyle = (() => {
    if (isChatExpanded) {
      return undefined;
    }

    if (workspaceDragPosition) {
      return {
        left: `${workspaceDragPosition.x}px`,
        top: `${workspaceDragPosition.y}px`,
        right: "auto",
        bottom: "auto",
      };
    }

    const y = clampVerticalPosition(getStoredY(widgetPosition), 620);

    return {
      bottom: "auto",
      left: isDockedLeft ? "16px" : "auto",
      right: isDockedLeft ? "auto" : "16px",
      top: Number.isFinite(y) ? `${y}px` : undefined,
    };
  })();
  const launcherStyle = (() => {
    if (launcherDragPosition) {
      return {
        left: `${launcherDragPosition.x}px`,
        top: `${launcherDragPosition.y}px`,
        right: "auto",
      };
    }

    const y = clampVerticalPosition(getStoredY(widgetPosition), 76);

    return {
      left: isDockedLeft ? "0" : "auto",
      right: isDockedLeft ? "auto" : "0",
      top: Number.isFinite(y) ? `${y}px` : undefined,
    };
  })();

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

    const nextPosition = clampFloatingPosition(
      {
        x: event.clientX - dragState.offsetX,
        y: event.clientY - dragState.offsetY,
      },
      dragState,
    );

    setWorkspaceDragPosition(nextPosition);
  };

  const finishWorkspaceDrag = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const droppedX = workspaceDragPosition?.x ?? event.clientX - dragState.offsetX;
    const droppedY = workspaceDragPosition?.y ?? event.clientY - dragState.offsetY;
    const side = getDockSideFromPosition(droppedX, dragState.width);
    const y = clampVerticalPosition(droppedY, dragState.height);

    setWidgetPosition({
      side,
      y,
    });
    setWorkspaceDragPosition(null);
    dragStateRef.current = null;
    setIsDraggingWorkspace(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released if the drag was cancelled.
    }
  };

  const handleLauncherPointerDown = (event) => {
    if (event.button !== 0 || !launcherRef.current) {
      return;
    }

    const launcherRect = launcherRef.current.getBoundingClientRect();

    launcherDragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - launcherRect.left,
      offsetY: event.clientY - launcherRect.top,
      startX: event.clientX,
      startY: event.clientY,
      width: launcherRect.width,
      height: launcherRect.height,
      hasMoved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleLauncherPointerMove = (event) => {
    const dragState = launcherDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const movementX = Math.abs(event.clientX - dragState.startX);
    const movementY = Math.abs(event.clientY - dragState.startY);

    if (!dragState.hasMoved && movementX + movementY < 4) {
      return;
    }

    dragState.hasMoved = true;
    setIsDraggingLauncher(true);

    const nextPosition = clampFloatingPosition(
      {
        x: event.clientX - dragState.offsetX,
        y: event.clientY - dragState.offsetY,
      },
      {
        ...dragState,
        edgeSnap: true,
      },
    );

    setLauncherDragPosition(nextPosition);
    event.preventDefault();
  };

  const finishLauncherDrag = (event) => {
    const dragState = launcherDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (dragState.hasMoved) {
      const droppedX =
        launcherDragPosition?.x ?? event.clientX - dragState.offsetX;
      const droppedY =
        launcherDragPosition?.y ?? event.clientY - dragState.offsetY;

      setWidgetPosition({
        side: getDockSideFromPosition(droppedX, dragState.width),
        y: clampVerticalPosition(droppedY, dragState.height),
      });
      suppressLauncherClickRef.current = true;
    }

    setLauncherDragPosition(null);
    launcherDragStateRef.current = null;
    setIsDraggingLauncher(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released if the drag was cancelled.
    }
  };

  const handleLauncherClick = (event) => {
    if (suppressLauncherClickRef.current) {
      suppressLauncherClickRef.current = false;
      event.preventDefault();
      return;
    }

    onToggle();
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      CHAT_WIDGET_POSITION_STORAGE_KEY,
      JSON.stringify(widgetPosition),
    );
  }, [widgetPosition]);

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
        } ${isDockedLeft ? "is-docked-left" : "is-docked-right"} ${
          isDraggingWorkspace ? "is-dragging" : ""
        }`}
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
          <span aria-hidden="true">{sidebarToggleIcon}</span>
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
        ref={launcherRef}
        className={`chat-launcher ${isChatOpen ? "is-hidden" : ""} ${
          isDockedLeft ? "is-docked-left" : "is-docked-right"
        } ${isDraggingLauncher ? "is-dragging" : ""}`}
        type="button"
        onClick={handleLauncherClick}
        onPointerDown={handleLauncherPointerDown}
        onPointerMove={handleLauncherPointerMove}
        onPointerUp={finishLauncherDrag}
        onPointerCancel={finishLauncherDrag}
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
