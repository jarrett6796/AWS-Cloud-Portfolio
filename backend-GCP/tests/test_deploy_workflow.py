import json
import subprocess
import tempfile
import unittest
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover - only true if pyyaml disappears upstream
    yaml = None

_WORKFLOW_PATH = (
    Path(__file__).resolve().parents[2]
    / ".github"
    / "workflows"
    / "deploy-backend-gcp.yml"
)


def _load_workflow():
    with _WORKFLOW_PATH.open(encoding="utf-8") as workflow_file:
        return yaml.safe_load(workflow_file)


def _step_names(workflow):
    return [step.get("name") for step in workflow["jobs"]["deploy"]["steps"]]


def _find_step(workflow, name):
    for step in workflow["jobs"]["deploy"]["steps"]:
        if step.get("name") == name:
            return step

    raise AssertionError(f"No step named {name!r} found in {_WORKFLOW_PATH}")


def _extract_heredoc_body(run_script, marker="PY"):
    lines = run_script.splitlines()
    start = next(
        i for i, line in enumerate(lines) if line.strip() == f"python3 - <<'{marker}'"
    ) + 1
    end = next(
        i for i, line in enumerate(lines[start:], start=start)
        if line.strip() == marker
    )
    return "\n".join(lines[start:end]) + "\n"


@unittest.skipIf(yaml is None, "pyyaml is not installed in this environment")
class DeployWorkflowStructureTest(unittest.TestCase):
    def setUp(self):
        self.workflow = _load_workflow()

    def test_workflow_file_is_valid_yaml_with_single_deploy_job(self):
        self.assertIn("deploy", self.workflow["jobs"])
        self.assertTrue(self.workflow["jobs"]["deploy"]["steps"])

    def test_eval_gate_runs_before_deploy_to_cloud_run(self):
        names = _step_names(self.workflow)

        eval_index = names.index("Evaluate current production RAG quality (pre-deploy gate)")
        gate_index = names.index("Enforce RAG eval hard-failure gate")
        deploy_index = names.index("Deploy to Cloud Run")

        self.assertLess(
            eval_index,
            deploy_index,
            "the eval step must run before the deploy step",
        )
        self.assertLess(
            gate_index,
            deploy_index,
            "the hard-failure gate must run before the deploy step",
        )

    def test_health_check_runs_before_eval_and_deploy(self):
        names = _step_names(self.workflow)

        health_index = names.index("Health check current production service (fail fast)")
        eval_index = names.index("Evaluate current production RAG quality (pre-deploy gate)")
        deploy_index = names.index("Deploy to Cloud Run")

        self.assertLess(health_index, eval_index)
        self.assertLess(health_index, deploy_index)

    def test_eval_step_still_uses_soft_fail(self):
        eval_step = _find_step(
            self.workflow,
            "Evaluate current production RAG quality (pre-deploy gate)",
        )

        self.assertIn("--soft-fail", eval_step["run"])

    def test_no_eval_step_runs_after_deploy(self):
        names = _step_names(self.workflow)
        deploy_index = names.index("Deploy to Cloud Run")

        for name in names[deploy_index + 1:]:
            self.assertNotIn(
                "evaluate",
                (name or "").lower(),
                "no eval step should run after the deploy step anymore",
            )

    def test_report_upload_steps_run_before_deploy_and_use_always(self):
        names = _step_names(self.workflow)
        deploy_index = names.index("Deploy to Cloud Run")

        for name in (
            "Upload pre-deploy RAG evaluation report",
            "Upload pre-deploy RAG evaluation JSON",
        ):
            index = names.index(name)
            self.assertLess(index, deploy_index)
            step = _find_step(self.workflow, name)
            self.assertEqual(step.get("if"), "always()")


@unittest.skipIf(yaml is None, "pyyaml is not installed in this environment")
class DeployWorkflowHardFailureGateTest(unittest.TestCase):
    def setUp(self):
        workflow = _load_workflow()
        gate_step = _find_step(workflow, "Enforce RAG eval hard-failure gate")
        self.gate_script = _extract_heredoc_body(gate_step["run"])
        # Fail fast if the embedded script isn't even syntactically valid
        # Python -- this is exactly the class of bug that survives a plain
        # YAML lint check but breaks the workflow at run time.
        compile(self.gate_script, "<gate>", "exec")

    def _run_gate(self, report):
        with tempfile.TemporaryDirectory() as tmp_dir:
            report_path = Path(tmp_dir) / "rag_eval_report.json"
            report_path.write_text(json.dumps(report), encoding="utf-8")
            result = subprocess.run(
                ["python3", "-c", self.gate_script],
                cwd=tmp_dir,
                capture_output=True,
                text=True,
                timeout=10,
            )
            return result.returncode, result.stdout, result.stderr

    def test_below_threshold_but_reachable_report_does_not_hard_fail(self):
        report = {
            "summary": {"total_cases": 50, "passed_cases": 30, "overall_pass_rate": 0.6},
            "results": (
                [{"failure_reasons": []} for _ in range(30)]
                + [{"failure_reasons": ["missing_required_terms"]} for _ in range(20)]
            ),
            "thresholds": {"passed": False, "failures": ["overall_pass_rate"]},
        }

        returncode, _stdout, _stderr = self._run_gate(report)

        self.assertEqual(returncode, 0)

    def test_fully_unreachable_service_hard_fails(self):
        report = {
            "summary": {"total_cases": 50, "passed_cases": 0, "overall_pass_rate": 0.0},
            "results": [{"failure_reasons": ["request_error"]} for _ in range(50)],
            "thresholds": {"passed": False, "failures": ["overall_pass_rate"]},
        }

        returncode, _stdout, stderr = self._run_gate(report)

        self.assertEqual(returncode, 1)
        self.assertIn("unreachable", stderr)

    def test_zero_cases_hard_fails(self):
        report = {
            "summary": {"total_cases": 0, "passed_cases": 0, "overall_pass_rate": 0},
            "results": [],
            "thresholds": {"passed": False, "failures": []},
        }

        returncode, _stdout, _stderr = self._run_gate(report)

        self.assertEqual(returncode, 1)

    def test_mixed_failures_with_majority_reachable_does_not_hard_fail(self):
        report = {
            "summary": {"total_cases": 50, "passed_cases": 40, "overall_pass_rate": 0.8},
            "results": (
                [{"failure_reasons": []} for _ in range(40)]
                + [{"failure_reasons": ["request_error"]} for _ in range(5)]
                + [{"failure_reasons": ["missing_citation"]} for _ in range(5)]
            ),
            "thresholds": {"passed": True, "failures": []},
        }

        returncode, _stdout, _stderr = self._run_gate(report)

        self.assertEqual(returncode, 0)

    def test_malformed_report_hard_fails(self):
        report = {"oops": "not a real report"}

        returncode, _stdout, _stderr = self._run_gate(report)

        self.assertNotEqual(returncode, 0)


if __name__ == "__main__":
    unittest.main()
