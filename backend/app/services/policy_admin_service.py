from __future__ import annotations


class PolicyAdminService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "policy_admin_service", "payload": payload}
