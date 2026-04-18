from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_admin():
    return success_response({"items": [], "resource": "admin"})


@router.get("/health")
def admin_health():
    return success_response({"status": "ok", "resource": "admin", "message": "admin route active"})
