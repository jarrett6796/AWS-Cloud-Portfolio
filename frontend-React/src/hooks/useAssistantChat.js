import { useRef, useState } from "react";
import { askRag, streamAskRag } from "../api/chat";

const MAX_CHAT_HISTORY_MESSAGES = 6;
const LEGACY_CHAT_SESSION_STORAGE_KEY = "portfolioAssistantSessionId";
const CHAT_SESSION_STORAGE_KEY = "portfolioAssistantSessionIdsByProject";
const DEFAULT_PROJECT_ID = "project1";
const DEFAULT_PROJECT_CHAT_STATE = {
  question: "",
  answer: "",
  sources: [],
  messages: [],
  history: [],
  error: "",
  status: "",
  isLoading: false,
};
const RESPONSE_STAGES = [
  "Analyzing question",
  "Retrieving context",
  "Generating answer",
];

function createMessageId() {
  return `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createChatSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDefaultProjectChatState() {
  return {
    ...DEFAULT_PROJECT_CHAT_STATE,
    sources: [],
    messages: [],
    history: [],
  };
}

function loadChatSessionIds() {
  if (typeof window === "undefined") {
    return {
      [DEFAULT_PROJECT_ID]: createChatSessionId(),
    };
  }

  const storedSessionIds = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);

  if (storedSessionIds) {
    try {
      return JSON.parse(storedSessionIds);
    } catch (error) {
      console.warn("Could not parse assistant session IDs:", error);
    }
  }

  const legacySessionId = window.localStorage.getItem(
    LEGACY_CHAT_SESSION_STORAGE_KEY,
  );

  if (legacySessionId) {
    const sessionIds = {
      [DEFAULT_PROJECT_ID]: legacySessionId,
    };

    window.localStorage.setItem(
      CHAT_SESSION_STORAGE_KEY,
      JSON.stringify(sessionIds),
    );
    return sessionIds;
  }

  const sessionIds = {
    [DEFAULT_PROJECT_ID]: createChatSessionId(),
  };

  window.localStorage.setItem(
    CHAT_SESSION_STORAGE_KEY,
    JSON.stringify(sessionIds),
  );
  return sessionIds;
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

export function useAssistantChat(activeProjectId = DEFAULT_PROJECT_ID) {
  const [chatSessionIds, setChatSessionIds] = useState(loadChatSessionIds);
  const [chatByProject, setChatByProject] = useState({
    [DEFAULT_PROJECT_ID]: getDefaultProjectChatState(),
  });
  const responseStartTimeRef = useRef(null);
  const responseTimerRef = useRef(null);
  const activeResponseMessageIdRef = useRef(null);
  const activeResponseProjectIdRef = useRef(null);
  const activeChatState =
    chatByProject[activeProjectId] || getDefaultProjectChatState();

  const updateProjectChat = (projectId, updater) => {
    setChatByProject((currentByProject) => {
      const currentProjectChat =
        currentByProject[projectId] || getDefaultProjectChatState();
      const nextProjectChat =
        typeof updater === "function" ? updater(currentProjectChat) : updater;

      return {
        ...currentByProject,
        [projectId]: nextProjectChat,
      };
    });
  };

  const patchProjectChat = (projectId, updates) => {
    updateProjectChat(projectId, (currentProjectChat) => ({
      ...currentProjectChat,
      ...updates,
    }));
  };

  const persistSessionId = (projectId, sessionId) => {
    setChatSessionIds((currentSessionIds) => {
      const nextSessionIds = {
        ...currentSessionIds,
        [projectId]: sessionId,
      };

      window.localStorage.setItem(
        CHAT_SESSION_STORAGE_KEY,
        JSON.stringify(nextSessionIds),
      );
      return nextSessionIds;
    });
  };

  const appendChatHistory = (projectId, question, answer) => {
    updateProjectChat(projectId, (currentProjectChat) => ({
      ...currentProjectChat,
      history: [
        ...currentProjectChat.history,
        {
          role: "user",
          content: question,
        },
        {
          role: "assistant",
          content: answer,
        },
      ].slice(-MAX_CHAT_HISTORY_MESSAGES),
    }));
  };

  const updateAssistantMessage = (projectId, messageId, updates) => {
    updateProjectChat(projectId, (currentProjectChat) => ({
      ...currentProjectChat,
      messages: currentProjectChat.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              ...updates,
            }
          : message,
      ),
    }));
  };

  const getElapsedSeconds = () => {
    if (!responseStartTimeRef.current) {
      return 0;
    }

    return Math.max(
      1,
      Math.floor((performance.now() - responseStartTimeRef.current) / 1000),
    );
  };

  const getStageLabel = (elapsedSeconds) => {
    if (elapsedSeconds <= 1) {
      return RESPONSE_STAGES[0];
    }

    if (elapsedSeconds === 2) {
      return RESPONSE_STAGES[1];
    }

    return RESPONSE_STAGES[2];
  };

  const updateResponseStatus = () => {
    const elapsedSeconds = getElapsedSeconds();
    const status = `${getStageLabel(elapsedSeconds)} • ${elapsedSeconds}`;

    const responseProjectId = activeResponseProjectIdRef.current;

    if (!responseProjectId) {
      return;
    }

    patchProjectChat(responseProjectId, {
      status,
    });

    if (activeResponseMessageIdRef.current) {
      updateAssistantMessage(
        responseProjectId,
        activeResponseMessageIdRef.current,
        {
          status,
        },
      );
    }
  };

  const startResponseTimer = (projectId, messageId) => {
    activeResponseMessageIdRef.current = messageId;
    activeResponseProjectIdRef.current = projectId;
    responseStartTimeRef.current = performance.now();
    updateResponseStatus();
    window.clearInterval(responseTimerRef.current);
    responseTimerRef.current = window.setInterval(updateResponseStatus, 250);
  };

  const stopResponseTimer = (statusPrefix) => {
    const elapsedSeconds = getElapsedSeconds();
    const status = `${statusPrefix} ${elapsedSeconds}s`;

    window.clearInterval(responseTimerRef.current);
    responseTimerRef.current = null;
    responseStartTimeRef.current = null;
    const responseProjectId = activeResponseProjectIdRef.current;

    if (!responseProjectId) {
      return;
    }

    patchProjectChat(responseProjectId, {
      status,
    });

    if (activeResponseMessageIdRef.current) {
      updateAssistantMessage(
        responseProjectId,
        activeResponseMessageIdRef.current,
        {
          status,
        },
      );
    }

    activeResponseMessageIdRef.current = null;
    activeResponseProjectIdRef.current = null;
  };

  const appendAssistantMessageContent = (projectId, messageId, tokenText) => {
    updateProjectChat(projectId, (currentProjectChat) => ({
      ...currentProjectChat,
      messages: currentProjectChat.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content: `${message.content}${tokenText}`,
            }
          : message,
      ),
    }));
  };

  const askWithFallback = async ({
    projectId,
    question,
    assistantMessageId,
    history,
    sessionId,
  }) => {
    const data = await askRag(question, history, sessionId);
    const answer = data.answer || "No answer returned.";
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const returnedSessionId = data.session_id || sessionId;

    if (returnedSessionId !== sessionId) {
      persistSessionId(projectId, returnedSessionId);
    }

    patchProjectChat(projectId, {
      answer,
      sources,
    });
    updateAssistantMessage(projectId, assistantMessageId, {
      content: answer,
      isLoading: false,
      sources,
    });
    appendChatHistory(projectId, question, answer);
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    const projectId = activeProjectId;
    const currentProjectChat =
      chatByProject[projectId] || getDefaultProjectChatState();
    const currentSessionId = chatSessionIds[projectId] || createChatSessionId();
    const trimmedQuestion = currentProjectChat.question.trim();

    if (!trimmedQuestion || currentProjectChat.isLoading) {
      return;
    }

    if (!chatSessionIds[projectId]) {
      persistSessionId(projectId, currentSessionId);
    }

    patchProjectChat(projectId, {
      isLoading: true,
      answer: "",
      sources: [],
      error: "",
    });

    const assistantMessageId = createMessageId();

    updateProjectChat(projectId, (latestProjectChat) => ({
      ...latestProjectChat,
      messages: [
        ...latestProjectChat.messages,
        {
          id: createMessageId(),
          role: "user",
          content: trimmedQuestion,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          sources: [],
          status: "",
          isLoading: true,
        },
      ],
    }));
    startResponseTimer(projectId, assistantMessageId);

    try {
      let streamedAnswer = "";
      const requestHistory = currentProjectChat.history;

      try {
        await streamAskRag(
          trimmedQuestion,
          requestHistory,
          currentSessionId,
          async ({ event: streamEvent, data }) => {
            if (streamEvent === "metadata") {
              const returnedSessionId = data.session_id || currentSessionId;
              const sources = Array.isArray(data.sources) ? data.sources : [];

              if (returnedSessionId !== currentSessionId) {
                persistSessionId(projectId, returnedSessionId);
              }

              patchProjectChat(projectId, {
                sources,
              });
              updateAssistantMessage(projectId, assistantMessageId, {
                sources,
              });
              return;
            }

            if (streamEvent === "token") {
              const tokenText = data.text || "";
              streamedAnswer += tokenText;
              updateProjectChat(projectId, (latestProjectChat) => ({
                ...latestProjectChat,
                answer: `${latestProjectChat.answer}${tokenText}`,
              }));
              appendAssistantMessageContent(
                projectId,
                assistantMessageId,
                tokenText,
              );
              await waitForNextFrame();
              return;
            }

            if (streamEvent === "done") {
              return;
            }

            if (streamEvent === "error") {
              throw new Error(data.message || "RAG stream returned an error.");
            }
          },
        );

        const answer = streamedAnswer || "No answer returned.";
        patchProjectChat(projectId, {
          answer,
        });
        updateAssistantMessage(projectId, assistantMessageId, {
          content: answer,
          isLoading: false,
        });
        appendChatHistory(projectId, trimmedQuestion, answer);
      } catch (streamError) {
        console.warn("Streaming RAG request failed; falling back:", streamError);
        patchProjectChat(projectId, {
          answer: "",
          sources: [],
        });
        updateAssistantMessage(projectId, assistantMessageId, {
          content: "",
          sources: [],
        });
        await askWithFallback({
          projectId,
          question: trimmedQuestion,
          assistantMessageId,
          history: requestHistory,
          sessionId: currentSessionId,
        });
      }

      patchProjectChat(projectId, {
        question: "",
      });
      stopResponseTimer("Response generated in");
    } catch (error) {
      console.error("Failed to ask RAG assistant:", error);
      const errorMessage =
        "Could not connect to the AI backend. Please try again.";

      patchProjectChat(projectId, {
        error: errorMessage,
      });
      updateAssistantMessage(projectId, assistantMessageId, {
        content: errorMessage,
        isLoading: false,
        sources: [],
      });
      stopResponseTimer("Failed after");
    } finally {
      patchProjectChat(projectId, {
        isLoading: false,
      });
    }
  };

  const handleNewChat = () => {
    const projectId = activeProjectId;
    const sessionId = createChatSessionId();

    persistSessionId(projectId, sessionId);
    updateProjectChat(projectId, () => getDefaultProjectChatState());

    if (activeResponseProjectIdRef.current === projectId) {
      window.clearInterval(responseTimerRef.current);
      responseTimerRef.current = null;
      responseStartTimeRef.current = null;
      activeResponseMessageIdRef.current = null;
      activeResponseProjectIdRef.current = null;
    }
  };

  const setChatQuestion = (question) => {
    patchProjectChat(activeProjectId, {
      question,
    });
  };

  return {
    chatQuestion: activeChatState.question,
    setChatQuestion,
    chatAnswer: activeChatState.answer,
    chatSources: activeChatState.sources,
    chatMessages: activeChatState.messages,
    isChatLoading: activeChatState.isLoading,
    chatError: activeChatState.error,
    chatStatus: activeChatState.status,
    handleChatSubmit,
    handleNewChat,
  };
}
