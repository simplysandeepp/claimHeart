from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_appeals():
    return success_response({"items": [], "resource": "appeals"})


@router.get("/health")
def appeals_health():
    return success_response({"status": "ok", "resource": "appeals", "message": "appeals route active"})
