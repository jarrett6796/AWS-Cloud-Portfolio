const VISITOR_COUNT_URL = import.meta.env.VITE_AWS_VISITOR_API_URL;

export async function fetchVisitorCount() {
  if (!VISITOR_COUNT_URL) {
    return 0;
  }

  try {
    const response = await fetch(VISITOR_COUNT_URL);

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();

    return data.views ?? 0;
  } catch {
    return 0;
  }
}
