from __future__ import annotations


class ClaimSimilarity:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "claim_similarity", "payload": payload or {}, "ok": True}
