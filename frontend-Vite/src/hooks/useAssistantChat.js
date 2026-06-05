import { useState } from "react";
import { askRag } from "../api/chat";

const MAX_CHAT_HISTORY_MESSAGES = 6;
const CHAT_SESSION_STORAGE_KEY = "portfolioAssistantSessionId";

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

export function useAssistantChat() {
  const [chatSessionId, setChatSessionId] = useState(loadChatSessionId);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatSources, setChatSources] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

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

    try {
      const data = await askRag(trimmedQuestion, chatHistory, chatSessionId);
      const answer = data.answer || "No answer returned.";
      const returnedSessionId = data.session_id || chatSessionId;

      if (returnedSessionId !== chatSessionId) {
        setChatSessionId(returnedSessionId);
        window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, returnedSessionId);
      }

      setChatAnswer(answer);
      setChatSources(Array.isArray(data.sources) ? data.sources : []);
      setChatHistory((currentHistory) =>
        [
          ...currentHistory,
          {
            role: "user",
            content: trimmedQuestion,
          },
          {
            role: "assistant",
            content: answer,
          },
        ].slice(-MAX_CHAT_HISTORY_MESSAGES),
      );
      setChatQuestion("");
    } catch (error) {
      console.error("Failed to ask RAG assistant:", error);
      setChatError("Could not connect to the AI backend. Please try again.");
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
    setChatHistory([]);
    setChatError("");
  };

  return {
    chatQuestion,
    setChatQuestion,
    chatAnswer,
    chatSources,
    isChatLoading,
    chatError,
    handleChatSubmit,
    handleNewChat,
  };
}
