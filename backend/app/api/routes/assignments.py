from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_assignments():
    return success_response({"items": [], "resource": "assignments"})


@router.get("/health")
def assignments_health():
    return success_response({"status": "ok", "resource": "assignments", "message": "assignments route active"})
