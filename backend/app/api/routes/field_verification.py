from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_field_verification():
    return success_response({"items": [], "resource": "field_verification"})


@router.get("/health")
def field_verification_health():
    return success_response({"status": "ok", "resource": "field_verification", "message": "field verification route active"})
