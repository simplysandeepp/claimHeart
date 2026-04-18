from __future__ import annotations


class AuthService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "auth_service", "payload": payload}
