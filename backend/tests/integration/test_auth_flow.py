from __future__ import annotations


class TestAuthFlow:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "test_auth_flow", "payload": payload or {}, "ok": True}
