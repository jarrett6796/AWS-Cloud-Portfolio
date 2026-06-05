export async function askRag(question, history = [], sessionId = null) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL environment variable.");
  }

  const response = await fetch(`${apiBaseUrl}/ask-rag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      session_id: sessionId,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error(`RAG request failed with status ${response.status}.`);
  }

  return response.json();
}
