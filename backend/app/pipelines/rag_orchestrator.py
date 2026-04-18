from __future__ import annotations

from typing import Any

from app.pipelines.query_engine import get_policy_analysis_with_cache


def run_policy_rag_pipeline(claim_data: dict[str, Any], cache_ttl_seconds: int = 600) -> dict[str, Any]:
    return get_policy_analysis_with_cache(claim_data=claim_data, ttl_seconds=cache_ttl_seconds)
