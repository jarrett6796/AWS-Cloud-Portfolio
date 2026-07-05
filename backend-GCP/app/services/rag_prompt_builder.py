import re


def build_context(chunks):
    return "\n\n".join(
        [
            f"[{chunk['source_id']}] File: {chunk['file_name']} | Chunk: {chunk['chunk_index']} | Heading: {chunk.get('heading') or 'N/A'} | Score: {chunk['score']}\n{chunk['chunk_text']}"
            for chunk in chunks
        ]
    )


def build_history_context(history) -> str:
    if not history:
        return "No prior conversation."

    recent_history = history[-6:]
    lines = []

    for message in recent_history:
        if isinstance(message, dict):
            role = message.get("role", "")
            content = message.get("content", "")
        else:
            role = getattr(message, "role", "")
            content = getattr(message, "content", "")
        if role in {"user", "assistant"} and content:
            lines.append(f"{role}: {content}")

    return "\n".join(lines) if lines else "No prior conversation."


def build_rag_prompt(
    question: str,
    context: str,
    conversation_context: str = "No prior conversation.",
) -> str:
    return f"""
You are Jarrett's AI cloud portfolio assistant.

Answer the user's question using only the retrieved context below.
If the answer is not in the context, say you do not know based on the indexed project documents.
Every factual claim from the retrieved context must include a citation using the source ID format, such as [S1] or [S2].
Do not cite sources that are not listed in the retrieved context.
Use the recent conversation only to understand follow-up questions. Do not use conversation history as a factual source.
Answer in the same language as the user's question, even if the retrieved context or conversation history is in a different language.
Keep the answer concise and recruiter-friendly.

<recent_conversation>
{conversation_context}
</recent_conversation>

<retrieved_context>
{context}
</retrieved_context>

User question:
{question}
"""


def build_semantic_rerank_prompt(query: str, chunks: list[dict]) -> str:
    previews = []

    for index, chunk in enumerate(chunks, start=1):
        compact_preview = compact_chunk_preview(chunk)
        previews.append(
            "\n".join(
                [
                    f"ID: C{index}",
                    f"File: {chunk.get('file_name')}",
                    f"Heading: {chunk.get('heading') or 'N/A'}",
                    f"Section: {chunk.get('section_path') or 'N/A'}",
                    f"Preview: {compact_preview}",
                ]
            )
        )

    return f"""
Rank the retrieved chunks by semantic relevance to the retrieval query.

Return only chunk IDs in best-to-worst order, one ID per line.
Do not answer the query.
Do not include explanations.
Use only the compact previews below.

Retrieval query:
{query}

Retrieved chunks:
{chr(10).join(previews)}
"""


def compact_chunk_preview(chunk: dict, max_chars: int = 360) -> str:
    preview = " ".join((chunk.get("chunk_text") or "").split())

    if len(preview) <= max_chars:
        return preview

    return preview[:max_chars].rsplit(" ", 1)[0]


def build_multi_query_prompt(
    retrieval_query: str,
    conversation_context: str,
    query_count: int,
) -> str:
    return f"""
Generate up to {query_count - 1} alternate retrieval queries for Jarrett's cloud portfolio RAG system.

Return one query per line.
Do not answer the question.
Do not include Markdown.
Do not include citations.
Keep each query concise and specific.
Use recent conversation only to preserve the user's intended scope.

<recent_conversation>
{conversation_context}
</recent_conversation>

Retrieval query:
{retrieval_query}
"""


def build_query_rewrite_prompt(
    question: str,
    conversation_context: str,
) -> str:
    return f"""
You rewrite user follow-up questions into standalone retrieval queries for Jarrett's cloud portfolio RAG system.

Return only the rewritten standalone query.
Do not answer the question.
Do not include Markdown.
Do not include citations.
Preserve the user's intent.
Use project-specific context from recent conversation only when needed.
If the original question is already standalone, return it unchanged.

<recent_conversation>
{conversation_context}
</recent_conversation>

User question:
{question}
"""


def parse_multi_query_response(response: str) -> list[str]:
    queries = []

    for line in (response or "").splitlines():
        query = re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", line).strip()
        query = query.strip('"').strip("'").strip()

        if query:
            queries.append(query)

    return queries
