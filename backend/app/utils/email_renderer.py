from __future__ import annotations


class EmailRenderer:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "email_renderer", "payload": payload or {}, "ok": True}
