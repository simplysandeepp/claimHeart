from __future__ import annotations


class Profiler:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "profiler", "payload": payload or {}, "ok": True}
