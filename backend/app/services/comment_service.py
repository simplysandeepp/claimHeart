from __future__ import annotations


class CommentService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "comment_service", "payload": payload}
