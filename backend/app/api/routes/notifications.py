from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_notifications():
    return success_response({"items": [], "resource": "notifications"})


@router.get("/health")
def notifications_health():
    return success_response({"status": "ok", "resource": "notifications", "message": "notifications route active"})
