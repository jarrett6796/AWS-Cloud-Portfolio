from dataclasses import dataclass, field
from app.services.rag_policy import (
    ACTION_CLARIFY,
    ACTION_DIRECT_ANSWER,
    ACTION_REFUSE,
    evaluate_policy,
    normalize_query,
)


ROUTE_DIRECT = "direct"
ROUTE_RAG_STANDARD = "rag_standard"
ROUTE_RAG_STRICT = "rag_strict"
ROUTE_CLARIFY = "clarify"
ROUTE_REFUSE = "refuse"
ROUTE_FALLBACK = "fallback"

_STRICT_FACT_PATTERNS = (
    "which file",
    "what file",
    "which endpoint",
    "what endpoint",
    "what env var",
    "what env vars",
    "environment variable",
    "how many tests",
    "where is",
    "where does",
    "source",
    "exact",
    "line",
)
_STANDARD_RAG_PATTERNS = (
    "architecture",
    "pipeline",
    "backend",
    "frontend",
    "ingestion",
    "deployment",
    "capstone",
    "gcp rag",
    "cloud run",
    "firestore",
    "terraform",
    "ci/cd",
    "cicd",
    "explain",
)
_LOW_CONTEXT_QUERIES = {
    "explain it",
    "explain more",
    "explain this",
    "what about that",
    "is it done",
    "continue",
    "go on",
    "tell me more",
    "can you elaborate",
}


@dataclass(frozen=True)
class RouteDecision:
    route: str
    reason: str
    retrieval_required: bool
    query_rewrite_allowed: bool
    require_sources: bool
    response_mode: str
    tags: list[str] = field(default_factory=list)


def route_query(
    query: str,
    *,
    has_conversation_context: bool = False,
) -> RouteDecision:
    policy_decision = evaluate_policy(
        query,
        has_conversation_context=has_conversation_context,
    )

    if policy_decision.action == ACTION_REFUSE:
        return RouteDecision(
            route=ROUTE_REFUSE,
            reason=policy_decision.reason,
            retrieval_required=False,
            query_rewrite_allowed=False,
            require_sources=False,
            response_mode="policy",
            tags=policy_decision.tags,
        )

    if policy_decision.action == ACTION_CLARIFY:
        return RouteDecision(
            route=ROUTE_CLARIFY,
            reason=policy_decision.reason,
            retrieval_required=False,
            query_rewrite_allowed=False,
            require_sources=False,
            response_mode="clarification",
            tags=policy_decision.tags,
        )

    if policy_decision.action == ACTION_DIRECT_ANSWER:
        return RouteDecision(
            route=ROUTE_DIRECT,
            reason=policy_decision.reason,
            retrieval_required=False,
            query_rewrite_allowed=False,
            require_sources=False,
            response_mode="direct",
            tags=policy_decision.tags,
        )

    normalized_query = normalize_query(query)

    if normalized_query in _LOW_CONTEXT_QUERIES and not has_conversation_context:
        return RouteDecision(
            route=ROUTE_CLARIFY,
            reason="low_context_query",
            retrieval_required=False,
            query_rewrite_allowed=False,
            require_sources=False,
            response_mode="clarification",
            tags=["clarify", "low_context"],
        )

    if _contains_any(normalized_query, _STRICT_FACT_PATTERNS):
        return RouteDecision(
            route=ROUTE_RAG_STRICT,
            reason="exact_project_fact",
            retrieval_required=True,
            query_rewrite_allowed=True,
            require_sources=True,
            response_mode="rag",
            tags=["rag", "strict", "sources_required"],
        )

    if _contains_any(normalized_query, _STANDARD_RAG_PATTERNS):
        return RouteDecision(
            route=ROUTE_RAG_STANDARD,
            reason="project_question",
            retrieval_required=True,
            query_rewrite_allowed=True,
            require_sources=True,
            response_mode="rag",
            tags=["rag", "standard"],
        )

    return RouteDecision(
        route=ROUTE_RAG_STANDARD,
        reason="default_project_rag",
        retrieval_required=True,
        query_rewrite_allowed=True,
        require_sources=True,
        response_mode="rag",
        tags=["rag", "default"],
    )


def route_after_retrieval(
    route_decision: RouteDecision,
    *,
    has_retrieval_context: bool,
) -> RouteDecision:
    if not route_decision.retrieval_required:
        return route_decision

    if route_decision.require_sources and not has_retrieval_context:
        return RouteDecision(
            route=ROUTE_FALLBACK,
            reason="missing_required_sources",
            retrieval_required=True,
            query_rewrite_allowed=route_decision.query_rewrite_allowed,
            require_sources=True,
            response_mode="fallback",
            tags=[*route_decision.tags, "missing_sources"],
        )

    return route_decision


def _contains_any(text: str, patterns: tuple[str, ...]) -> bool:
    return any(pattern in text for pattern in patterns)
