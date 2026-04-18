from __future__ import annotations


class Retry:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "retry", "payload": payload or {}, "ok": True}
