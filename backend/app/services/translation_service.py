from __future__ import annotations


class TranslationService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "translation_service", "payload": payload}
