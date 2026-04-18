from __future__ import annotations


class TestApiEndpoints:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "test_api_endpoints", "payload": payload or {}, "ok": True}
