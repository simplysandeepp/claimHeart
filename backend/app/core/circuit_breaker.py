from __future__ import annotations


class CircuitBreaker:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "circuit_breaker", "payload": payload or {}, "ok": True}
