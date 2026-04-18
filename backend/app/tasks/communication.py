from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(
    name="app.tasks.communication.generate_stakeholder_message",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=3,
    soft_time_limit=90,
    time_limit=120,
)
def generate_stakeholder_message(self, decision_packet: dict) -> dict:
    recipient_type = decision_packet.get("recipient_type", "patient")
    language = decision_packet.get("language", "en")
    status = decision_packet.get("status", "under_review")

    return {
        "recipient_type": recipient_type,
        "language": language,
        "subject": f"Claim update: {status}",
        "body": f"Your claim status is currently {status}. Please review the dashboard for details.",
    }
