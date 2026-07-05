import { useCallback, useEffect, useRef, useState } from "react";
import { cleanAnswerText } from "../utils/ragDisplay";
import {
  AssistantProjectTitle,
  SampleResponse,
  SourceList,
} from "./chatPanelPresentation";
import { VISIBLE_CHAT_ROLES } from "./chatPanelConstants";
import {
  CHAT_COMPOSER_HEIGHT_STORAGE_KEY,
  CHAT_PANEL_WIDTH_STORAGE_KEY,
  CHAT_WIDGET_POSITION_STORAGE_KEY,
  CHAT_WIDTH_KEYBOARD_STEP,
  DEFAULT_COMPOSER_HEIGHT,
  MAX_CHAT_WIDTH,
  MIN_CHAT_WIDTH,
  clampChatWidth,
  clampComposerHeight,
  clampFloatingPosition,
  clampVerticalPosition,
  getDockSideFromPosition,
  getStoredY,
  loadChatWidth,
  loadComposerHeight,
  loadWidgetPosition,
} from "./chatPanelPosition";

export default function ChatPanel({
  isChatOpen,
  onClose,
  onToggle,
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
  const composerTextareaRef = useRef(null);
  const composerHeightRef = useRef(DEFAULT_COMPOSER_HEIGHT);
  const dragStateRef = useRef(null);
  const launcherDragStateRef = useRef(null);
  const composerResizeStateRef = useRef(null);
  const panelResizeStateRef = useRef(null);
  const suppressLauncherClickRef = useRef(false);
  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] = useState(true);
  const [widgetPosition, setWidgetPosition] = useState(loadWidgetPosition);
  const [composerHeight, setComposerHeight] = useState(loadComposerHeight);
  const [chatWidth, setChatWidth] = useState(loadChatWidth);
  const [workspaceDragPosition, setWorkspaceDragPosition] = useState(null);
  const [launcherDragPosition, setLauncherDragPosition] = useState(null);
  const [isDraggingWorkspace, setIsDraggingWorkspace] = useState(false);
  const [isDraggingLauncher, setIsDraggingLauncher] = useState(false);
  const [isResizingComposer, setIsResizingComposer] = useState(false);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
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
  const growComposerToContent = useCallback(() => {
    const textarea = composerTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    const nextHeight = clampComposerHeight(
      Math.max(composerHeightRef.current, textarea.scrollHeight),
    );

    textarea.style.height = `${nextHeight}px`;

    if (nextHeight !== composerHeightRef.current) {
      setComposerHeight(nextHeight);
    }
  }, []);
  const handleComposerChange = (event) => {
    setChatQuestion(event.target.value);
    window.requestAnimationFrame(growComposerToContent);
  };
  const handleComposerResizePointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    composerResizeStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: composerHeight,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingComposer(true);
    event.preventDefault();
  };
  const handleComposerResizePointerMove = (event) => {
    const resizeState = composerResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    const nextHeight = clampComposerHeight(
      resizeState.startHeight - (event.clientY - resizeState.startY),
    );

    setComposerHeight(nextHeight);
    event.preventDefault();
  };
  const finishComposerResize = (event) => {
    const resizeState = composerResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    composerResizeStateRef.current = null;
    setIsResizingComposer(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released if the drag was cancelled.
    }
  };
  const handlePanelResizePointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    panelResizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: chatWidth,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingPanel(true);
    event.preventDefault();
  };
  const handlePanelResizePointerMove = (event) => {
    const resizeState = panelResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    const delta = event.clientX - resizeState.startX;
    const signedDelta = isDockedLeft ? delta : -delta;

    setChatWidth(clampChatWidth(resizeState.startWidth + signedDelta));
    event.preventDefault();
  };
  const finishPanelResize = (event) => {
    const resizeState = panelResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    panelResizeStateRef.current = null;
    setIsResizingPanel(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released if the drag was cancelled.
    }
  };
  const handlePanelResizeKeyDown = (event) => {
    const isDockedLeftDirection = isDockedLeft ? 1 : -1;
    let step = 0;

    if (event.key === "ArrowLeft") {
      step = -CHAT_WIDTH_KEYBOARD_STEP * isDockedLeftDirection;
    } else if (event.key === "ArrowRight") {
      step = CHAT_WIDTH_KEYBOARD_STEP * isDockedLeftDirection;
    } else {
      return;
    }

    event.preventDefault();
    setChatWidth((currentWidth) => clampChatWidth(currentWidth + step));
  };

  const workspaceStyle = (() => {
    const chatPanelWidthVar = { "--chat-panel-width": `${chatWidth}px` };

    if (workspaceDragPosition) {
      return {
        ...chatPanelWidthVar,
        left: `${workspaceDragPosition.x}px`,
        top: `${workspaceDragPosition.y}px`,
        right: "auto",
        bottom: "auto",
      };
    }

    const y = clampVerticalPosition(getStoredY(widgetPosition), 620);

    return {
      ...chatPanelWidthVar,
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
    if (event.button !== 0 || !workspaceRef.current) {
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    composerHeightRef.current = composerHeight;
    window.localStorage.setItem(
      CHAT_COMPOSER_HEIGHT_STORAGE_KEY,
      String(composerHeight),
    );
  }, [composerHeight]);

  useEffect(() => {
    growComposerToContent();
  }, [chatQuestion, growComposerToContent]);

  useEffect(() => {
    if (typeof window === "undefined" || isResizingPanel) {
      return;
    }

    window.localStorage.setItem(CHAT_PANEL_WIDTH_STORAGE_KEY, String(chatWidth));
  }, [chatWidth, isResizingPanel]);

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
        } ${
          isWorkspaceSidebarOpen ? "is-sidebar-open" : "is-sidebar-collapsed"
        } ${isDockedLeft ? "is-docked-left" : "is-docked-right"} ${
          isDraggingWorkspace || isResizingPanel ? "is-dragging" : ""
        }`}
        aria-hidden={!isChatOpen}
        style={workspaceStyle}
      >
        <div
          className={`chat-resize-handle ${isResizingPanel ? "is-active" : ""}`}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat panel"
          aria-valuenow={chatWidth}
          aria-valuemin={MIN_CHAT_WIDTH}
          aria-valuemax={MAX_CHAT_WIDTH}
          tabIndex={isChatOpen ? 0 : -1}
          onPointerDown={handlePanelResizePointerDown}
          onPointerMove={handlePanelResizePointerMove}
          onPointerUp={finishPanelResize}
          onPointerCancel={finishPanelResize}
          onKeyDown={handlePanelResizeKeyDown}
        />

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
            className={`chat-composer ${
              isResizingComposer ? "is-resizing" : ""
            }`}
            aria-label={labels.composer}
            onSubmit={handleChatSubmit}
          >
            <button
              className="chat-composer-resize"
              type="button"
              aria-label="Resize chat composer"
              title="Resize chat composer"
              onPointerDown={handleComposerResizePointerDown}
              onPointerMove={handleComposerResizePointerMove}
              onPointerUp={finishComposerResize}
              onPointerCancel={finishComposerResize}
            >
              <span aria-hidden="true" />
            </button>
            <textarea
              ref={composerTextareaRef}
              value={chatQuestion}
              onChange={handleComposerChange}
              onKeyDown={handleComposerKeyDown}
              placeholder={labels.placeholder}
              rows="2"
              disabled={isChatLoading}
              style={{ height: `${composerHeight}px` }}
            />
            <button
              className="chat-composer-send"
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
