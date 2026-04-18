from __future__ import annotations


class RateLimitConfig:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "rate_limit_config", "payload": payload or {}, "ok": True}
