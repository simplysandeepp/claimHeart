from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(name="app.tasks.field_verification.run")
def run(payload: dict | None = None) -> dict:
    return {"task": "field_verification", "status": "completed", "payload": payload or {}}
