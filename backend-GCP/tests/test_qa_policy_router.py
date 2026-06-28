import importlib.util
import unittest
from pathlib import Path


def load_qa_module():
    script_path = Path(__file__).resolve().parents[1] / "scripts" / "qa_policy_router.py"
    spec = importlib.util.spec_from_file_location("qa_policy_router", script_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


qa_policy_router = load_qa_module()


class QaPolicyRouterTest(unittest.TestCase):
    def test_parse_sse_events_reads_event_names_and_json_payloads(self):
        events = qa_policy_router.parse_sse_events(
            'event: metadata\ndata: {"sources": []}\n\n'
            'event: token\ndata: {"text": "Hello"}\n\n'
            'event: done\ndata: {"status": "complete"}\n\n'
        )

        self.assertEqual(
            [event["event"] for event in events],
            ["metadata", "token", "done"],
        )
        self.assertEqual(events[1]["data"], {"text": "Hello"})

    def test_stream_text_combines_token_events_only(self):
        answer = qa_policy_router.combine_stream_text(
            [
                {"event": "metadata", "data": {"question": "Hi"}},
                {"event": "token", "data": {"text": "Hello "}},
                {"event": "token", "data": {"text": "there"}},
                {"event": "done", "data": {"status": "complete"}},
            ]
        )

        self.assertEqual(answer, "Hello there")

    def test_short_circuit_sse_contract_rejects_new_policy_events(self):
        result = qa_policy_router.evaluate_sse_contract(
            [
                {"event": "metadata", "data": {}},
                {"event": "policy", "data": {}},
                {"event": "token", "data": {"text": "No"}},
                {"event": "done", "data": {"status": "complete"}},
            ],
            expected_behavior="short_circuit",
        )

        self.assertEqual(result.status, "FAIL")
        self.assertIn("disallowed", result.message)

    def test_response_shape_requires_existing_rag_keys_only(self):
        result = qa_policy_router.evaluate_response_shape(
            {
                "question": "Hi",
                "answer": "Hello",
                "session_id": "session",
                "sources": [],
                "retrieval_query": "Hi",
                "query_rewritten": False,
            }
        )

        self.assertEqual(result.status, "PASS")

    def test_sensitive_content_patterns_fail_check(self):
        result = qa_policy_router.evaluate_sensitive_content(
            "Here is an API key: sk-secret"
        )

        self.assertEqual(result.status, "FAIL")


if __name__ == "__main__":
    unittest.main()
