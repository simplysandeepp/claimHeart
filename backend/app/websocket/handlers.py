from __future__ import annotations


class Handlers:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "handlers", "payload": payload or {}, "ok": True}
