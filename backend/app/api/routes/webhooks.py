from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_webhooks():
    return success_response({"items": [], "resource": "webhooks"})


@router.get("/health")
def webhooks_health():
    return success_response({"status": "ok", "resource": "webhooks", "message": "webhooks route active"})
