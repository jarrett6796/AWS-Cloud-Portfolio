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

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL environment variable.");
  }

  return apiBaseUrl;
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
