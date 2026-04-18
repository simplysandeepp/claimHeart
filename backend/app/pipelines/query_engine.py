from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

import redis

from app.agents.policy.policy_agent import PolicyRAGAgent
from app.core.config import settings

logger = logging.getLogger(__name__)


class PolicyQueryCache:
    def __init__(self):
        self.client = None
        try:
            self.client = redis.Redis.from_url(settings.redis_url, decode_responses=True)
            self.client.ping()
        except Exception as exc:
            logger.warning("Redis cache unavailable; continuing without cache. %s", exc)
            self.client = None

    @staticmethod
    def build_key(claim_data: dict[str, Any]) -> str:
        raw = json.dumps(claim_data, sort_keys=True, default=str)
        digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()
        return f"policy_lookup:{digest}"

    def get(self, key: str) -> dict[str, Any] | None:
        if not self.client:
            return None
        payload = self.client.get(key)
        return json.loads(payload) if payload else None

    def set(self, key: str, value: dict[str, Any], ttl_seconds: int) -> None:
        if not self.client:
            return
        self.client.setex(key, ttl_seconds, json.dumps(value, default=str))


CACHE = PolicyQueryCache()


def get_policy_analysis_with_cache(claim_data: dict[str, Any], ttl_seconds: int = 600) -> dict[str, Any]:
    key = CACHE.build_key(claim_data)
    cached = CACHE.get(key)
    if cached is not None:
        cached["cache_hit"] = True
        return cached

    result = PolicyRAGAgent().analyze_claim(claim_data)
    result["cache_hit"] = False
    CACHE.set(key, result, ttl_seconds=ttl_seconds)
    return result
