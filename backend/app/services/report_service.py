from __future__ import annotations


class ReportService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "report_service", "payload": payload}
