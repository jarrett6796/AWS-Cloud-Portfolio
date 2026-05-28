const VISITOR_COUNT_URL = "https://9u8ml80foj.execute-api.ap-northeast-1.amazonaws.com/views";

export async function fetchVisitorCount() {
  const response = await fetch(VISITOR_COUNT_URL);
  const data = await response.json();

  return data.views;
}
