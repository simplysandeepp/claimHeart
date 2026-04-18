from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_policy_admin():
    return success_response({"items": [], "resource": "policy_admin"})


@router.get("/health")
def policy_admin_health():
    return success_response({"status": "ok", "resource": "policy_admin", "message": "policy admin route active"})
