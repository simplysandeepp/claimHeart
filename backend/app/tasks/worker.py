from celery import Celery

celery_app = Celery("claimheart")
celery_app.config_from_object("celeryconfig")
celery_app.autodiscover_tasks(["app.tasks"])


@celery_app.task(name="app.tasks.worker.health_check")
def health_check() -> dict:
    return {"status": "ok", "service": "celery-worker"}
