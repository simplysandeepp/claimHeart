from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_websocket():
    return success_response({"items": [], "resource": "websocket"})


@router.get("/health")
def websocket_health():
    return success_response({"status": "ok", "resource": "websocket", "message": "websocket route active"})
