from __future__ import annotations


class DuplicateDetector:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "duplicate_detector", "payload": payload}
