from __future__ import annotations


class Fixtures:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "fixtures", "payload": payload or {}, "ok": True}
