from __future__ import annotations


class ClaimOrchestrator:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "claim_orchestrator", "payload": payload or {}, "ok": True}
