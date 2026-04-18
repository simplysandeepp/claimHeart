from __future__ import annotations


class AuditService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "audit_service", "payload": payload}
