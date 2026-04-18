from __future__ import annotations


class Manager:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "manager", "payload": payload or {}, "ok": True}
