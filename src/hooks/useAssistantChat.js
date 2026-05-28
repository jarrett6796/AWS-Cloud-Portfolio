import { useState } from "react";
import { askRag } from "../api/chat";

export function useAssistantChat() {
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatSources, setChatSources] = useState([]);
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
      const data = await askRag(trimmedQuestion);

      setChatAnswer(data.answer || "No answer returned.");
      setChatSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (error) {
      console.error("Failed to ask RAG assistant:", error);
      setChatError("Could not connect to the AI backend. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return {
    chatQuestion,
    setChatQuestion,
    chatAnswer,
    chatSources,
    isChatLoading,
    chatError,
    handleChatSubmit,
  };
}
