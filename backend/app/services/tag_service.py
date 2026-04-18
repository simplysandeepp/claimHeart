from __future__ import annotations


class TagService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "tag_service", "payload": payload}
