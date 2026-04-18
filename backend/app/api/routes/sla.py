from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_sla():
    return success_response({"items": [], "resource": "sla"})


@router.get("/health")
def sla_health():
    return success_response({"status": "ok", "resource": "sla", "message": "sla route active"})
