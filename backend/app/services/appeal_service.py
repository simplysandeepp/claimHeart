from __future__ import annotations


class AppealService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "appeal_service", "payload": payload}
