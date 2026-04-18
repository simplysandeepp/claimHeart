from __future__ import annotations


class VisionClient:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "vision_client", "payload": payload or {}, "ok": True}
