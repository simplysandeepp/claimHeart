from __future__ import annotations

from app.tasks.worker import celery_app


@celery_app.task(
    name="app.tasks.analysis.run_claim_analysis",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=3,
    soft_time_limit=180,
    time_limit=240,
)
def run_claim_analysis(self, claim_payload: dict) -> dict:
    # Placeholder for orchestration into policy/fraud/mediator pipelines.
    return {
        "status": "queued_analysis_complete",
        "claim_id": claim_payload.get("claim_id"),
        "signals": claim_payload.get("signals", []),
    }
