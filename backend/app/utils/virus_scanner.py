from __future__ import annotations


class VirusScanner:
    def execute(self, payload: dict | None = None) -> dict:
        return {"module": "virus_scanner", "payload": payload or {}, "ok": True}
