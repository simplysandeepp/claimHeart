from __future__ import annotations

from fastapi import APIRouter
from app.core.exceptions import success_response

router = APIRouter()


@router.get("/")
def list_cost_baselines():
    return success_response({"items": [], "resource": "cost_baselines"})


@router.get("/health")
def cost_baselines_health():
    return success_response({"status": "ok", "resource": "cost_baselines", "message": "cost baselines route active"})
