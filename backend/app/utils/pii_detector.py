from __future__ import annotations


class PiiDetector:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "pii_detector", "payload": payload or {}, "ok": True}
