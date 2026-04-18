from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_audit():
    return success_response({"items": [], "resource": "audit"})


@router.get("/health")
def audit_health():
    return success_response({"status": "ok", "resource": "audit", "message": "audit route active"})
