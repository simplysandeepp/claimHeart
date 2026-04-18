from __future__ import annotations


class Events:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "events", "payload": payload or {}, "ok": True}
