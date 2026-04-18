from __future__ import annotations


class DocumentVersionService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "document_version_service", "payload": payload}
