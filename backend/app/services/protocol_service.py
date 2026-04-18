from __future__ import annotations


class ProtocolService:
    def run(self, payload: dict) -> dict:
        return {"success": True, "service": "protocol_service", "payload": payload}
