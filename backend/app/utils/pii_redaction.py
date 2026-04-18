from __future__ import annotations


class PiiRedaction:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "pii_redaction", "payload": payload or {}, "ok": True}
