from __future__ import annotations


class CostBaselineService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "cost_baseline_service", "payload": payload}
