from __future__ import annotations


class ClaimService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "claim_service", "payload": payload}
