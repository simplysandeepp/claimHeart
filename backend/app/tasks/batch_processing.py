from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(name="app.tasks.batch_processing.run")
def run(payload: dict | None = None) -> dict:
    return {"task": "batch_processing", "status": "completed", "payload": payload or {}}
