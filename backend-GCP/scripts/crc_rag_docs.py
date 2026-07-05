CRC_RAG_FILES = (
    "knowledge-base/crc-rag/Architecture 架構圖.md",
    "knowledge-base/crc-rag/Implementation 實作流程.md",
    "knowledge-base/crc-rag/Overview 綜覽.md",
    "knowledge-base/crc-rag/RAG 系統設計.md",
)

CRC_RAG_SOURCE_PREFIX = "gs://cloud-resume-ai-rag-docs/knowledge-base/crc-rag/"

CRC_RAG_QUESTIONS = (
    {
        "id": "crc_rag_architecture",
        "question": (
            "What is the overall architecture of the AI-powered multi-cloud "
            "portfolio platform?"
        ),
        "expected_terms": ("architecture", "portfolio"),
    },
    {
        "id": "crc_rag_retrieval",
        "question": "How does the RAG system retrieve project documentation?",
        "expected_terms": ("RAG", "retrieve"),
    },
    {
        "id": "crc_rag_implementation",
        "question": "What are the main implementation steps of the CRC-RAG project?",
        "expected_terms": ("implementation", "step"),
    },
    {
        "id": "crc_rag_services",
        "question": "Which AWS and GCP services are used in the capstone project?",
        "expected_terms": ("AWS", "GCP"),
    },
)
