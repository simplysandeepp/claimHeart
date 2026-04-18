from __future__ import annotations


class StateMachine:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "state_machine", "payload": payload or {}, "ok": True}
