const SOURCE_MARKER_PATTERN = /\s*\[S\d+\]\s*/g;

export function cleanAnswerText(answer = "") {
  return answer
    .replace(SOURCE_MARKER_PATTERN, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
