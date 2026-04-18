from __future__ import annotations


class AgentErrorHandler:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "agent_error_handler", "payload": payload}
