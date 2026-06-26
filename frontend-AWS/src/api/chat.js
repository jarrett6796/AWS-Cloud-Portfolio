const DEFAULT_API_BASE_URL =
  "https://gcp-rag-backend-189047029621.asia-east1.run.app";

export async function askRag(question, history = [], sessionId = null) {
  const apiBaseUrl = getApiBaseUrl();

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

function getApiBaseUrl() {
  return import.meta.env.VITE_GCP_RAG_API_URL || DEFAULT_API_BASE_URL;
}

function parseSseEvent(rawEvent) {
  const normalizedEvent = rawEvent.replace(/\r\n/g, "\n");
  const lines = normalizedEvent.split("\n");
  let event = "message";
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  const dataText = dataLines.join("\n");
  const data = dataText ? JSON.parse(dataText) : {};

  return {
    event,
    data,
  };
}

export async function streamAskRag(
  question,
  history = [],
  sessionId = null,
  onEvent,
) {
  const apiBaseUrl = getApiBaseUrl();

  const response = await fetch(`${apiBaseUrl}/ask-rag-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      question,
      session_id: sessionId,
      history,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`RAG stream failed with status ${response.status}.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    const rawEvents = buffer.split("\n\n");
    buffer = rawEvents.pop() || "";

    for (const rawEvent of rawEvents) {
      const trimmedEvent = rawEvent.trim();

      if (trimmedEvent) {
        await onEvent(parseSseEvent(trimmedEvent));
      }
    }
  }

  buffer += decoder.decode().replace(/\r\n/g, "\n");

  if (buffer.trim()) {
    await onEvent(parseSseEvent(buffer.trim()));
  }
}
