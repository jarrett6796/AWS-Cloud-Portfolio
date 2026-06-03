from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai.types import GenerateContentConfig
from google.cloud import storage
from google.cloud import firestore

from app.config.settings import settings
from app.schemas.chat_schema import ChatRequest


client = genai.Client(
    vertexai=True,
    project=settings.project_id,
    location=settings.location,
)

storage_client = storage.Client(project=settings.project_id)
firestore_client = firestore.Client(project=settings.project_id)

app = FastAPI(title="GCP RAG Backend MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "gcp-rag-backend",
        "phase": "rag-with-cors-mvp",
    }


def read_gcs_text_file(file_name: str) -> str:
    bucket = storage_client.bucket(settings.docs_bucket)
    blob = bucket.blob(file_name)
    return blob.download_as_text()


def chunk_text(text: str, chunk_size: int = 500):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunk = text[i:i + chunk_size].strip()

        if chunk:
            chunks.append(chunk)

    return chunks


def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude_1 = sum(a * a for a in vec1) ** 0.5
    magnitude_2 = sum(b * b for b in vec2) ** 0.5

    if magnitude_1 == 0 or magnitude_2 == 0:
        return 0

    return dot_product / (magnitude_1 * magnitude_2)


@app.post("/chat")
def chat(request: ChatRequest):
    response = client.models.generate_content(
        model=settings.generation_model,
        contents=request.question,
        config=GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=512,
        ),
    )

    return {
        "question": request.question,
        "answer": response.text,
    }


@app.post("/chat-with-docs")
def chat_with_docs(request: ChatRequest):
    project_state = read_gcs_text_file("PROJECT_STATE.md")
    frontend_log = read_gcs_text_file("Frontend_Development_Log.md")

    context = f"""
You are an AI assistant for Jarrett's Cloud Resume Challenge / AI Cloud Portfolio project.

Use the following project documents as source context.

<PROJECT_STATE.md>
{project_state}
</PROJECT_STATE.md>

<Frontend_Development_Log.md>
{frontend_log}
</Frontend_Development_Log.md>
"""

    prompt = f"""
Answer the user's question using the project context below.
If the answer is not found in the context, say you do not know based on the uploaded project documents.

<context>
{context}
</context>

User question:
{request.question}
"""

    response = client.models.generate_content(
        model=settings.generation_model,
        contents=prompt,
        config=GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=800,
        ),
    )

    return {
        "question": request.question,
        "answer": response.text,
        "sources": [
            "PROJECT_STATE.md",
            "Frontend_Development_Log.md",
        ],
    }


@app.post("/ingest-docs")
def ingest_docs():
    files = [
        "PROJECT_STATE.md",
        "Frontend_Development_Log.md",
    ]

    total_chunks = 0

    for file_name in files:
        text = read_gcs_text_file(file_name)
        chunks = chunk_text(text)

        for index, chunk in enumerate(chunks):
            embedding_response = client.models.embed_content(
                model=settings.embedding_model,
                contents=chunk,
            )

            embedding = embedding_response.embeddings[0].values

            firestore_client.collection(settings.firestore_chunks_collection).add(
                {
                    "file_name": file_name,
                    "chunk_index": index,
                    "chunk_text": chunk,
                    "embedding": embedding,
                }
            )

            total_chunks += 1

    return {
        "status": "success",
        "chunks_created": total_chunks,
    }


@app.post("/ask-rag")
def ask_rag(request: ChatRequest):
    query_embedding_response = client.models.embed_content(
        model=settings.embedding_model,
        contents=request.question,
    )

    query_embedding = query_embedding_response.embeddings[0].values

    docs = firestore_client.collection(settings.firestore_chunks_collection).stream()

    scored_chunks = []

    for doc in docs:
        data = doc.to_dict()

        score = cosine_similarity(query_embedding, data["embedding"])

        scored_chunks.append(
            {
                "score": score,
                "file_name": data["file_name"],
                "chunk_index": data["chunk_index"],
                "chunk_text": data["chunk_text"],
            }
        )

    top_chunks = sorted(
        scored_chunks,
        key=lambda x: x["score"],
        reverse=True,
    )[:5]

    context = "\n\n".join(
        [
            f"[Source: {chunk['file_name']} | Chunk: {chunk['chunk_index']} | Score: {chunk['score']}]\n{chunk['chunk_text']}"
            for chunk in top_chunks
        ]
    )

    prompt = f"""
You are Jarrett's AI cloud portfolio assistant.

Answer the user's question using only the retrieved context below.
If the answer is not in the context, say you do not know based on the indexed project documents.

<retrieved_context>
{context}
</retrieved_context>

User question:
{request.question}
"""

    response = client.models.generate_content(
        model=settings.generation_model,
        contents=prompt,
        config=GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=800,
        ),
    )

    return {
        "question": request.question,
        "answer": response.text,
        "sources": [
            {
                "file_name": chunk["file_name"],
                "chunk_index": chunk["chunk_index"],
                "score": chunk["score"],
            }
            for chunk in top_chunks
        ],
    }
