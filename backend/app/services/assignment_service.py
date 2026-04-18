from __future__ import annotations


class AssignmentService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "assignment_service", "payload": payload}
