import logging
import uuid
from hashlib import sha256

from google.cloud import firestore
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector

from app.config.settings import settings
from app.errors import DatabaseServiceError


logger = logging.getLogger(__name__)
_VECTOR_DISTANCE_FIELD = "_vector_distance"
_EXACT_VECTOR_FILTER_FIELDS = {"project", "doc_type", "file_name", "version_id"}


class FirestoreService:
    def __init__(self):
        self.client = firestore.Client(project=settings.project_id)

    def create_session_id(self) -> str:
        return str(uuid.uuid4())

    def build_chunk_document_id(self, file_name: str, chunk_index: int) -> str:
        key = f"{file_name}:{chunk_index}".encode("utf-8")
        return sha256(key).hexdigest()

    def add_document_chunk(
        self,
        file_name: str,
        chunk_index: int,
        chunk_text: str,
        embedding: list[float],
        metadata: dict | None = None,
    ) -> str:
        metadata = metadata or {}
        content_hash = metadata.get(
            "content_hash",
            sha256(chunk_text.encode("utf-8")).hexdigest(),
        )
        document_id = self.build_chunk_document_id(file_name, chunk_index)
        chunk_record = {
            "project": metadata.get("project", "portfolio"),
            "doc_type": metadata.get("doc_type", "state"),
            "file_name": file_name,
            "heading": metadata.get("heading"),
            "section_path": metadata.get("section_path") or metadata.get("heading"),
            "source_uri": metadata.get(
                "source_uri",
                f"gs://{settings.docs_bucket}/{file_name}",
            ),
            "version_id": metadata.get("version_id", content_hash[:16]),
            "chunk_index": chunk_index,
            "chunk_text": chunk_text,
            "embedding": Vector(embedding),
            "content_hash": content_hash,
            "char_count": metadata.get("char_count", len(chunk_text)),
            "ingestion_key": document_id,
            "updated_at": firestore.SERVER_TIMESTAMP,
        }
        logger.info(
            "firestore_chunk_write_started",
            extra={
                "collection": settings.firestore_chunks_collection,
                "document_id": document_id,
                "file_name": file_name,
                "chunk_index": chunk_index,
                "chunk_length": len(chunk_text),
                "embedding_dimensions": len(embedding),
                "content_hash": content_hash,
                "heading": metadata.get("heading"),
                "project": chunk_record["project"],
                "doc_type": chunk_record["doc_type"],
            },
        )

        try:
            self.client.collection(settings.firestore_chunks_collection).document(
                document_id
            ).set(chunk_record)
        except Exception as error:
            logger.error(
                "firestore_chunk_write_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "document_id": document_id,
                    "file_name": file_name,
                    "chunk_index": chunk_index,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_write_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "document_id": document_id,
                "file_name": file_name,
                "chunk_index": chunk_index,
                "content_hash": content_hash,
            },
        )
        return document_id

    def search_document_chunks_by_vector(
        self,
        query_embedding: list[float],
        limit: int,
        metadata_filter: dict | None = None,
    ) -> list[dict]:
        safe_limit = min(max(int(limit or 1), 1), 1000)
        metadata_filter = metadata_filter or {}
        logger.info(
            "firestore_vector_search_started",
            extra={
                "collection": settings.firestore_chunks_collection,
                "limit": safe_limit,
                "vector_field": settings.rag_firestore_vector_field,
                "distance_measure": settings.rag_vector_search_distance_measure,
                "metadata_filter_keys": sorted(metadata_filter.keys()),
            },
        )

        try:
            query = self.client.collection(settings.firestore_chunks_collection)
            for field in sorted(_EXACT_VECTOR_FILTER_FIELDS):
                expected = metadata_filter.get(field)
                if expected:
                    query = query.where(field, "==", expected)

            vector_query = query.find_nearest(
                vector_field=settings.rag_firestore_vector_field,
                query_vector=Vector(query_embedding),
                limit=safe_limit,
                distance_measure=self._vector_distance_measure(),
                distance_result_field=_VECTOR_DISTANCE_FIELD,
            )
            chunks = [
                self._normalize_document_chunk(doc.to_dict())
                for doc in vector_query.stream()
            ]
        except Exception as error:
            logger.error(
                "firestore_vector_search_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "limit": safe_limit,
                    "vector_field": settings.rag_firestore_vector_field,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_vector_search_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "result_count": len(chunks),
                "limit": safe_limit,
            },
        )
        return chunks

    def _vector_distance_measure(self):
        distance_measure = settings.rag_vector_search_distance_measure.upper()
        if distance_measure == "EUCLIDEAN":
            return DistanceMeasure.EUCLIDEAN
        if distance_measure == "DOT_PRODUCT":
            return DistanceMeasure.DOT_PRODUCT

        return DistanceMeasure.COSINE

    def _normalize_document_chunk(self, chunk: dict) -> dict:
        normalized_chunk = dict(chunk)

        if _VECTOR_DISTANCE_FIELD in normalized_chunk:
            normalized_chunk["vector_distance"] = normalized_chunk.pop(
                _VECTOR_DISTANCE_FIELD
            )

        return normalized_chunk

    def prune_document_chunks(
        self,
        file_name: str,
        expected_document_ids: set[str],
    ) -> int:
        pruned_count = 0
        logger.info(
            "firestore_chunk_prune_started",
            extra={
                "collection": settings.firestore_chunks_collection,
                "file_name": file_name,
                "expected_document_count": len(expected_document_ids),
            },
        )

        try:
            docs = self.client.collection(
                settings.firestore_chunks_collection
            ).where("file_name", "==", file_name).stream()

            for doc in docs:
                if doc.id in expected_document_ids:
                    continue

                doc.reference.delete()
                pruned_count += 1
        except Exception as error:
            logger.error(
                "firestore_chunk_prune_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "file_name": file_name,
                    "pruned_count": pruned_count,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_prune_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "file_name": file_name,
                "pruned_count": pruned_count,
            },
        )
        return pruned_count

    def stream_document_chunks(self):
        count = 0
        logger.info(
            "firestore_chunk_stream_started",
            extra={"collection": settings.firestore_chunks_collection},
        )

        try:
            for doc in self.client.collection(
                settings.firestore_chunks_collection
            ).stream():
                count += 1
                yield doc.to_dict()
        except Exception as error:
            logger.error(
                "firestore_chunk_stream_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "documents_streamed": count,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_stream_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "documents_streamed": count,
            },
        )

    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        request_id: str | None = None,
    ) -> str:
        message_id = str(uuid.uuid4())
        message = {
            "role": role,
            "content": content,
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        if request_id:
            message["request_id"] = request_id

        logger.info(
            "firestore_conversation_message_write_started",
            extra={
                "collection": settings.firestore_conversations_collection,
                "session_id": session_id,
                "message_id": message_id,
                "role": role,
                "content_length": len(content),
                "request_id": request_id,
            },
        )

        try:
            conversation_ref = self.client.collection(
                settings.firestore_conversations_collection
            ).document(session_id)
            conversation_ref.collection("messages").document(message_id).set(message)
            conversation_ref.set(
                {
                    "updated_at": firestore.SERVER_TIMESTAMP,
                    "last_request_id": request_id,
                },
                merge=True,
            )
        except Exception as error:
            logger.error(
                "firestore_conversation_message_write_failed",
                extra={
                    "collection": settings.firestore_conversations_collection,
                    "session_id": session_id,
                    "message_id": message_id,
                    "role": role,
                    "request_id": request_id,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_conversation_message_write_completed",
            extra={
                "collection": settings.firestore_conversations_collection,
                "session_id": session_id,
                "message_id": message_id,
                "role": role,
            },
        )
        return message_id

    def save_query_rewrite_audit_message(
        self,
        session_id: str,
        original_question: str,
        rewritten_query: str,
        rewrite_used: bool,
        request_id: str | None = None,
    ) -> str:
        message_id = str(uuid.uuid4())
        message = {
            "role": "system",
            "event_type": "query_rewrite",
            "original_question": original_question,
            "rewritten_query": rewritten_query,
            "rewrite_used": rewrite_used,
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        if request_id:
            message["request_id"] = request_id

        logger.info(
            "firestore_query_rewrite_audit_write_started",
            extra={
                "collection": settings.firestore_conversations_collection,
                "session_id": session_id,
                "message_id": message_id,
                "rewrite_used": rewrite_used,
                "request_id": request_id,
            },
        )

        try:
            conversation_ref = self.client.collection(
                settings.firestore_conversations_collection
            ).document(session_id)
            conversation_ref.collection("messages").document(message_id).set(message)
            conversation_ref.set(
                {
                    "updated_at": firestore.SERVER_TIMESTAMP,
                    "last_request_id": request_id,
                },
                merge=True,
            )
        except Exception as error:
            logger.error(
                "firestore_query_rewrite_audit_write_failed",
                extra={
                    "collection": settings.firestore_conversations_collection,
                    "session_id": session_id,
                    "message_id": message_id,
                    "request_id": request_id,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_query_rewrite_audit_write_completed",
            extra={
                "collection": settings.firestore_conversations_collection,
                "session_id": session_id,
                "message_id": message_id,
                "rewrite_used": rewrite_used,
            },
        )
        return message_id

    def load_recent_messages(self, session_id: str, limit: int = 6) -> list[dict]:
        logger.info(
            "firestore_conversation_messages_load_started",
            extra={
                "collection": settings.firestore_conversations_collection,
                "session_id": session_id,
                "limit": limit,
            },
        )

        try:
            docs = (
                self.client.collection(settings.firestore_conversations_collection)
                .document(session_id)
                .collection("messages")
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )
            messages = [doc.to_dict() for doc in docs]
        except Exception as error:
            logger.error(
                "firestore_conversation_messages_load_failed",
                extra={
                    "collection": settings.firestore_conversations_collection,
                    "session_id": session_id,
                    "limit": limit,
                },
            )
            raise DatabaseServiceError(error) from error

        messages.reverse()
        logger.info(
            "firestore_conversation_messages_load_completed",
            extra={
                "collection": settings.firestore_conversations_collection,
                "session_id": session_id,
                "message_count": len(messages),
            },
        )
        return messages

    def save_rag_analytics(self, analytics: dict) -> str:
        analytics_id = str(uuid.uuid4())
        analytics_record = {
            **analytics,
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        logger.info(
            "firestore_rag_analytics_write_started",
            extra={
                "collection": settings.firestore_rag_analytics_collection,
                "analytics_id": analytics_id,
                "session_id": analytics.get("session_id"),
                "request_id": analytics.get("request_id"),
            },
        )

        try:
            self.client.collection(settings.firestore_rag_analytics_collection).document(
                analytics_id
            ).set(analytics_record)
        except Exception as error:
            logger.error(
                "firestore_rag_analytics_write_failed",
                extra={
                    "collection": settings.firestore_rag_analytics_collection,
                    "analytics_id": analytics_id,
                    "session_id": analytics.get("session_id"),
                    "request_id": analytics.get("request_id"),
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_rag_analytics_write_completed",
            extra={
                "collection": settings.firestore_rag_analytics_collection,
                "analytics_id": analytics_id,
            },
        )
        return analytics_id

    def load_recent_rag_analytics(self, limit: int = 100) -> list[dict]:
        logger.info(
            "firestore_rag_analytics_load_started",
            extra={
                "collection": settings.firestore_rag_analytics_collection,
                "limit": limit,
            },
        )

        try:
            docs = (
                self.client.collection(settings.firestore_rag_analytics_collection)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )
            analytics_records = [doc.to_dict() for doc in docs]
        except Exception as error:
            logger.error(
                "firestore_rag_analytics_load_failed",
                extra={
                    "collection": settings.firestore_rag_analytics_collection,
                    "limit": limit,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_rag_analytics_load_completed",
            extra={
                "collection": settings.firestore_rag_analytics_collection,
                "limit": limit,
                "record_count": len(analytics_records),
            },
        )
        return analytics_records


firestore_service = FirestoreService()
