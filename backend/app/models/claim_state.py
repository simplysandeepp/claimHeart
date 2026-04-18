from __future__ import annotations


class ClaimState:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "claim_state", "payload": payload or {}, "ok": True}
