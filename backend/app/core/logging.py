from __future__ import annotations


class Logging:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "logging", "payload": payload or {}, "ok": True}
