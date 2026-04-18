from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_document_versions():
    return success_response({"items": [], "resource": "document_versions"})


@router.get("/health")
def document_versions_health():
    return success_response({"status": "ok", "resource": "document_versions", "message": "document versions route active"})
