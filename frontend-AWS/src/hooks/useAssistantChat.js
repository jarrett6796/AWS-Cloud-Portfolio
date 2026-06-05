import { useState } from "react";
import { askRag, streamAskRag } from "../api/chat";

const MAX_CHAT_HISTORY_MESSAGES = 6;
const CHAT_SESSION_STORAGE_KEY = "portfolioAssistantSessionId";

function createMessageId() {
  return `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createChatSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadChatSessionId() {
  if (typeof window === "undefined") {
    return createChatSessionId();
  }

  const storedSessionId = window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const sessionId = createChatSessionId();
  window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

export function useAssistantChat() {
  const [chatSessionId, setChatSessionId] = useState(loadChatSessionId);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatSources, setChatSources] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const persistSessionId = (sessionId) => {
    setChatSessionId(sessionId);
    window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, sessionId);
  };

  const appendChatHistory = (question, answer) => {
    setChatHistory((currentHistory) =>
      [
        ...currentHistory,
        {
          role: "user",
          content: question,
        },
        {
          role: "assistant",
          content: answer,
        },
      ].slice(-MAX_CHAT_HISTORY_MESSAGES),
    );
  };

  const updateAssistantMessage = (messageId, updates) => {
    setChatMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              ...updates,
            }
          : message,
      ),
    );
  };

  const appendAssistantMessageContent = (messageId, tokenText) => {
    setChatMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content: `${message.content}${tokenText}`,
            }
          : message,
      ),
    );
  };

  const askWithFallback = async (question, assistantMessageId) => {
    const data = await askRag(question, chatHistory, chatSessionId);
    const answer = data.answer || "No answer returned.";
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const returnedSessionId = data.session_id || chatSessionId;

    if (returnedSessionId !== chatSessionId) {
      persistSessionId(returnedSessionId);
    }

    setChatAnswer(answer);
    setChatSources(sources);
    updateAssistantMessage(assistantMessageId, {
      content: answer,
      isLoading: false,
      sources,
    });
    appendChatHistory(question, answer);
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = chatQuestion.trim();

    if (!trimmedQuestion || isChatLoading) {
      return;
    }

    setIsChatLoading(true);
    setChatAnswer("");
    setChatSources([]);
    setChatError("");

    const assistantMessageId = createMessageId();

    setChatMessages((currentMessages) => [
      ...currentMessages,
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
        isLoading: true,
      },
    ]);

    try {
      let streamedAnswer = "";

      try {
        await streamAskRag(
          trimmedQuestion,
          chatHistory,
          chatSessionId,
          async ({ event: streamEvent, data }) => {
            if (streamEvent === "metadata") {
              const returnedSessionId = data.session_id || chatSessionId;
              const sources = Array.isArray(data.sources) ? data.sources : [];

              if (returnedSessionId !== chatSessionId) {
                persistSessionId(returnedSessionId);
              }

              setChatSources(sources);
              updateAssistantMessage(assistantMessageId, {
                sources,
              });
              return;
            }

            if (streamEvent === "token") {
              const tokenText = data.text || "";
              streamedAnswer += tokenText;
              setChatAnswer((previousAnswer) => previousAnswer + tokenText);
              appendAssistantMessageContent(assistantMessageId, tokenText);
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
        setChatAnswer(answer);
        updateAssistantMessage(assistantMessageId, {
          content: answer,
          isLoading: false,
        });
        appendChatHistory(trimmedQuestion, answer);
      } catch (streamError) {
        console.warn("Streaming RAG request failed; falling back:", streamError);
        setChatAnswer("");
        setChatSources([]);
        updateAssistantMessage(assistantMessageId, {
          content: "",
          sources: [],
        });
        await askWithFallback(trimmedQuestion, assistantMessageId);
      }

      setChatQuestion("");
    } catch (error) {
      console.error("Failed to ask RAG assistant:", error);
      const errorMessage =
        "Could not connect to the AI backend. Please try again.";

      setChatError(errorMessage);
      updateAssistantMessage(assistantMessageId, {
        content: errorMessage,
        isLoading: false,
        sources: [],
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleNewChat = () => {
    const sessionId = createChatSessionId();

    setChatSessionId(sessionId);
    window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, sessionId);
    setChatQuestion("");
    setChatAnswer("");
    setChatSources([]);
    setChatMessages([]);
    setChatHistory([]);
    setChatError("");
  };

  return {
    chatQuestion,
    setChatQuestion,
    chatAnswer,
    chatSources,
    chatMessages,
    isChatLoading,
    chatError,
    handleChatSubmit,
    handleNewChat,
  };
}
