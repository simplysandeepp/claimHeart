from __future__ import annotations


class ConfigValidator:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "config_validator", "payload": payload or {}, "ok": True}
