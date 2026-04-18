from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_queries():
    return success_response({"items": [], "resource": "queries"})


@router.get("/health")
def queries_health():
    return success_response({"status": "ok", "resource": "queries", "message": "queries route active"})
