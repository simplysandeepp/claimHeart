from __future__ import annotations


class StateTransitionService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "state_transition_service", "payload": payload}
