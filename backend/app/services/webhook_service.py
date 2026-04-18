from __future__ import annotations


class WebhookService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "webhook_service", "payload": payload}
