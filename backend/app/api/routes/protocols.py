from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_protocols():
    return success_response({"items": [], "resource": "protocols"})


@router.get("/health")
def protocols_health():
    return success_response({"status": "ok", "resource": "protocols", "message": "protocols route active"})
