from __future__ import annotations


class OutputSchema:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "output_schema", "payload": payload or {}, "ok": True}
