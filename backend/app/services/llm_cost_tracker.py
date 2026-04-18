from __future__ import annotations


class LlmCostTracker:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "llm_cost_tracker", "payload": payload}
