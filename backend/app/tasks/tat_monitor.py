from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(name="app.tasks.tat_monitor.run")
def run(payload: dict | None = None) -> dict:
    return {"task": "tat_monitor", "status": "completed", "payload": payload or {}}
