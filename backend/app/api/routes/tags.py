from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_tags():
    return success_response({"items": [], "resource": "tags"})


@router.get("/health")
def tags_health():
    return success_response({"status": "ok", "resource": "tags", "message": "tags route active"})
