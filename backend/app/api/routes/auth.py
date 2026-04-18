from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_auth():
    return success_response({"items": [], "resource": "auth"})


@router.get("/health")
def auth_health():
    return success_response({"status": "ok", "resource": "auth", "message": "auth route active"})
