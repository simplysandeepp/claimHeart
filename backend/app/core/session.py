from __future__ import annotations


class Session:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "session", "payload": payload or {}, "ok": True}
