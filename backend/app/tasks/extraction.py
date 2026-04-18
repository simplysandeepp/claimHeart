from __future__ import annotations

from app.agents.extractor.agent import extractor_agent
from app.tasks.worker import celery_app


def process_document(file_path: str):
    return extractor_agent(file_path)


@celery_app.task(
    name="app.tasks.extraction.process_document_task",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=3,
)
def process_document_task(self, file_path: str):
    return process_document(file_path)
