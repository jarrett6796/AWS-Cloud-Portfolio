import { useState } from "react";
import { askRag } from "../api/chat";
import { cleanAnswerText } from "../utils/ragDisplay";

export default function AIChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);

    try {
      const data = await askRag(question);

      setAnswer(data.answer || "No answer returned.");
      setSources(data.sources || []);
    } catch (error) {
      setAnswer("Error: Could not connect to the AI backend.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>AI Cloud Portfolio Assistant</h2>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about my cloud architecture, RAG pipeline, or project decisions..."
        rows={4}
      />

      <br />

      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div>
          <h3>Answer</h3>
          <p>{cleanAnswerText(answer)}</p>
        </div>
      )}

      {sources.length > 0 && (
        <details>
          <summary>Sources used</summary>
          <ul>
            {sources.map((source, index) => (
              <li key={index}>
                <span>{source.file_name || "Retrieved source"}</span>
                {source.heading && <small> — {source.heading}</small>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
