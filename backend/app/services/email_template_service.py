from __future__ import annotations


class EmailTemplateService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "email_template_service", "payload": payload}
