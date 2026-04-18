from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_reports():
    return success_response({"items": [], "resource": "reports"})


@router.get("/health")
def reports_health():
    return success_response({"status": "ok", "resource": "reports", "message": "reports route active"})
