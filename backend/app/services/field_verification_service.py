from __future__ import annotations


class FieldVerificationService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "field_verification_service", "payload": payload}
