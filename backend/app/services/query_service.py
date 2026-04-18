from __future__ import annotations


class QueryService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "query_service", "payload": payload}
