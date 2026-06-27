from dataclasses import dataclass, field
import re


ACTION_ALLOW = "allow"
ACTION_REFUSE = "refuse"
ACTION_CLARIFY = "clarify"
ACTION_DIRECT_ANSWER = "direct_answer"
ACTION_SAFE_FALLBACK = "safe_fallback"

_PROMPT_INJECTION_PATTERNS = (
    "ignore previous instructions",
    "ignore all previous instructions",
    "reveal system prompt",
    "show system prompt",
    "show hidden prompt",
    "developer message",
    "system message",
    "bypass policy",
    "disable guardrails",
    "act as unrestricted",
    "jailbreak",
)
_SECRET_PATTERNS = (
    "api key",
    "api keys",
    "service account key",
    "service account json",
    ".env",
    "env value",
    "env values",
    "token",
    "tokens",
    "private credential",
    "private credentials",
    "secret",
    "secrets",
    "password",
)
_SAFE_SECRET_EXPLAIN_PATTERNS = (
    "where",
    "configure",
    "configured",
    "required",
    "rotate",
    "rotation",
    "safely",
    "explain",
)
_DANGEROUS_OPERATION_PATTERNS = (
    "delete production",
    "destroy production",
    "remove all cloud resources",
    "delete all cloud resources",
    "terraform destroy",
    "disable security",
    "turn off security",
    "expose bucket publicly",
    "make bucket public",
    "commit secrets",
    "push secrets",
)
_PROJECT_SCOPE_PATTERNS = (
    "jarrett",
    "portfolio",
    "cloud resume",
    "resume challenge",
    "gcp rag",
    "rag backend",
    "rag pipeline",
    "recipe sharing",
    "event notification",
    "terraform",
    "ci/cd",
    "cicd",
    "architecture",
    "deployment",
    "source code",
    "query rewrite",
    "hybrid retrieval",
    "vector",
    "embedding",
    "firestore",
    "cloud run",
    "gemini",
    "vertex",
    "ingestion",
    "endpoint",
    "sse",
    "tests",
    "capstone",
    "aws",
)
_OUT_OF_SCOPE_PATTERNS = (
    "president",
    "crypto",
    "stock",
    "weather",
    "quantum mechanics",
    "celebrity",
    "sports score",
)
_VAGUE_QUERIES = {
    "explain it",
    "explain this",
    "what about that",
    "is it done",
    "continue",
    "go on",
    "tell me more",
}
_GREETING_QUERIES = {
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
}
_CAPABILITY_PATTERNS = (
    "what can you do",
    "what can you answer",
    "who are you",
    "help",
)
_REFUSAL_MESSAGE = (
    "I can help with Jarrett's portfolio projects, RAG pipeline, architecture, "
    "deployment notes, and implementation details from indexed project documents."
)
_PROMPT_INJECTION_MESSAGE = (
    "I can't help with hidden instructions or internal system details. "
    "I can help explain the project architecture, RAG pipeline, or implementation instead."
)
_SECRET_MESSAGE = (
    "I can't provide secrets, tokens, API keys, or private credential values. "
    "I can explain where configuration belongs and how to rotate credentials safely."
)
_DANGEROUS_OPERATION_MESSAGE = (
    "I can't help with unsafe destructive cloud operations. "
    "I can provide a safe inspection, dry-run, or least-privilege cleanup checklist."
)
_CLARIFY_MESSAGE = (
    "Can you clarify which project, component, or document area you want me to explain?"
)
_DIRECT_CAPABILITY_MESSAGE = (
    "I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, "
    "GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior."
)
_DIRECT_GREETING_MESSAGE = (
    "Hi. I can help with Jarrett's portfolio architecture, RAG pipeline, deployment notes, or source behavior."
)


@dataclass(frozen=True)
class PolicyDecision:
    allowed: bool
    reason: str
    action: str
    user_message: str | None = None
    tags: list[str] = field(default_factory=list)


def evaluate_policy(
    query: str,
    *,
    has_conversation_context: bool = False,
) -> PolicyDecision:
    normalized_query = normalize_query(query)

    if not normalized_query:
        return PolicyDecision(
            allowed=False,
            reason="empty_query",
            action=ACTION_CLARIFY,
            user_message=_CLARIFY_MESSAGE,
            tags=["clarify", "empty"],
        )

    if _contains_any(normalized_query, _PROMPT_INJECTION_PATTERNS):
        return PolicyDecision(
            allowed=False,
            reason="prompt_injection",
            action=ACTION_REFUSE,
            user_message=_PROMPT_INJECTION_MESSAGE,
            tags=["security", "prompt_injection"],
        )

    if _contains_any(normalized_query, _SECRET_PATTERNS) and not _is_safe_secret_explanation(
        normalized_query
    ):
        return PolicyDecision(
            allowed=False,
            reason="secret_request",
            action=ACTION_REFUSE,
            user_message=_SECRET_MESSAGE,
            tags=["security", "secrets"],
        )

    if _contains_any(normalized_query, _DANGEROUS_OPERATION_PATTERNS):
        return PolicyDecision(
            allowed=False,
            reason="unsafe_cloud_operation",
            action=ACTION_REFUSE,
            user_message=_DANGEROUS_OPERATION_MESSAGE,
            tags=["security", "cloud_safety"],
        )

    if normalized_query in _GREETING_QUERIES:
        return PolicyDecision(
            allowed=True,
            reason="greeting",
            action=ACTION_DIRECT_ANSWER,
            user_message=_DIRECT_GREETING_MESSAGE,
            tags=["direct", "greeting"],
        )

    if _contains_any(normalized_query, _CAPABILITY_PATTERNS):
        return PolicyDecision(
            allowed=True,
            reason="capability_question",
            action=ACTION_DIRECT_ANSWER,
            user_message=_DIRECT_CAPABILITY_MESSAGE,
            tags=["direct", "capability"],
        )

    if normalized_query in _VAGUE_QUERIES and not has_conversation_context:
        return PolicyDecision(
            allowed=False,
            reason="low_context_query",
            action=ACTION_CLARIFY,
            user_message=_CLARIFY_MESSAGE,
            tags=["clarify", "low_context"],
        )

    if _contains_any(normalized_query, _OUT_OF_SCOPE_PATTERNS) and not is_project_scoped(
        normalized_query
    ):
        return PolicyDecision(
            allowed=False,
            reason="out_of_scope",
            action=ACTION_REFUSE,
            user_message=_REFUSAL_MESSAGE,
            tags=["scope", "out_of_scope"],
        )

    return PolicyDecision(
        allowed=True,
        reason="allowed_project_scope",
        action=ACTION_ALLOW,
        tags=["scope", "project"],
    )


def evaluate_grounding_policy(has_retrieval_context: bool) -> PolicyDecision:
    if has_retrieval_context:
        return PolicyDecision(
            allowed=True,
            reason="retrieval_context_available",
            action=ACTION_ALLOW,
            tags=["grounding", "sources_available"],
        )

    return PolicyDecision(
        allowed=False,
        reason="missing_retrieval_context",
        action=ACTION_SAFE_FALLBACK,
        user_message="I do not know based on the indexed project documents.",
        tags=["grounding", "missing_sources"],
    )


def is_project_scoped(query: str) -> bool:
    normalized_query = normalize_query(query)
    if _contains_any(normalized_query, _PROJECT_SCOPE_PATTERNS):
        return True

    return bool(
        re.search(
            r"\b(file|endpoint|env vars?|tests?|architecture|deployment|pipeline|backend|frontend)\b",
            normalized_query,
        )
    )


def normalize_query(query: str) -> str:
    return re.sub(r"\s+", " ", query or "").strip().lower()


def _contains_any(text: str, patterns: tuple[str, ...]) -> bool:
    return any(pattern in text for pattern in patterns)


def _is_safe_secret_explanation(query: str) -> bool:
    return _contains_any(query, _SAFE_SECRET_EXPLAIN_PATTERNS) and not re.search(
        r"\b(show|print|reveal|give|dump|list|paste|exfiltrate)\b",
        query,
    )
