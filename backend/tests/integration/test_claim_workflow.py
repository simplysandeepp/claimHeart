from __future__ import annotations


class TestClaimWorkflow:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "test_claim_workflow", "payload": payload or {}, "ok": True}
