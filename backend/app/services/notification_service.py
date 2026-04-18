from __future__ import annotations


class NotificationService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "notification_service", "payload": payload}
