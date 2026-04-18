from __future__ import annotations


class SlaService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "sla_service", "payload": payload}
