from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_batch():
    return success_response({"items": [], "resource": "batch"})


@router.get("/health")
def batch_health():
    return success_response({"status": "ok", "resource": "batch", "message": "batch route active"})
