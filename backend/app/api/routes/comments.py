from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_comments():
    return success_response({"items": [], "resource": "comments"})


@router.get("/health")
def comments_health():
    return success_response({"status": "ok", "resource": "comments", "message": "comments route active"})
