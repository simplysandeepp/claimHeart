from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(name="app.tasks.notifications.run")
def run(payload: dict | None = None) -> dict:
    return {"task": "notifications", "status": "completed", "payload": payload or {}}
