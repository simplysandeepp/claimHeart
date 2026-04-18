from __future__ import annotations


class FileValidator:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "file_validator", "payload": payload or {}, "ok": True}
