from __future__ import annotations


class ExportService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "export_service", "payload": payload}
