import json

from rag_test_helpers import BaseRagServiceTest


class RagServiceStreamingTest(BaseRagServiceTest):
    def test_format_sse_outputs_event_and_json_data(self):
        event = self.rag_service._format_sse("token", {"text": "Hello"})

        self.assertEqual(event, 'event: token\ndata: {"text": "Hello"}\n\n')

    def test_streaming_emits_metadata_token_and_done_with_rewrite_fields(self):
        self.settings.rag_query_rewrite_enabled = True
        self.gemini.rewrite_response = "What backend architecture is used?"

        events = list(
            self.rag_service.stream_answer(
                "What about the backend?",
                session_id="session-6",
            )
        )

        metadata_event = events[0]
        self.assertTrue(metadata_event.startswith("event: metadata"))
        metadata = json.loads(metadata_event.split("data: ", 1)[1])
        self.assertEqual(metadata["question"], "What about the backend?")
        self.assertEqual(metadata["retrieval_query"], "What backend architecture is used?")
        self.assertTrue(metadata["query_rewritten"])
        self.assertTrue(any(event.startswith("event: token") for event in events))
        self.assertTrue(events[-1].startswith("event: done"))

    def test_streaming_filters_metadata_sources_by_heading(self):
        events = list(
            self.rag_service.stream_answer(
                "What is the frontend?",
                session_id="session-stream-filter-heading",
                metadata_filter={"heading": "frontend"},
            )
        )

        metadata = json.loads(events[0].split("data: ", 1)[1])
        self.assertEqual(len(metadata["sources"]), 1)
        self.assertEqual(
            metadata["sources"][0]["heading"],
            "Frontend State",
        )
        self.assertEqual(self.firestore.analytics_records[0]["response_mode"], "stream")
        self.assertTrue(self.firestore.analytics_records[0]["metadata_filter_enabled"])

    def test_streaming_replaces_uncited_generated_answer_before_saving(self):
        self.gemini.stream_tokens = ["The backend runs on Cloud Run."]

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            events = list(
                self.rag_service.stream_answer(
                    "What is the backend?",
                    session_id="session-stream-uncited",
                )
            )

        token_text = "".join(
            json.loads(event.split("data: ", 1)[1])["text"]
            for event in events
            if event.startswith("event: token")
        )
        self.assertEqual(
            token_text,
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(self.firestore.saved_messages[1]["content"], token_text)
