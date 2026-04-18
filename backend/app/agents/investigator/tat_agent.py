from __future__ import annotations


class TatAgent:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "tat_agent", "payload": payload or {}, "ok": True}
