from __future__ import annotations


class AdminService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "admin_service", "payload": payload}
