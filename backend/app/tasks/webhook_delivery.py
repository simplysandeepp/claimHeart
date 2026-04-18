from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(name="app.tasks.webhook_delivery.run")
def run(payload: dict | None = None) -> dict:
    return {"task": "webhook_delivery", "status": "completed", "payload": payload or {}}
