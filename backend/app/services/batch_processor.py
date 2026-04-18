from __future__ import annotations


class BatchProcessor:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "batch_processor", "payload": payload}
