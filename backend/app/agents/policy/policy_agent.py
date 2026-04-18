from __future__ import annotations

import hashlib
import math
from typing import Any

from app.agents.policy.output_schema import PolicyCitation, PolicyDecision
from app.agents.policy.prompts import RETRIEVAL_QUERY_TEMPLATE
from app.agents.policy.vector_store import PolicyVectorStore
from app.core.config import settings


class PolicyRAGAgent:
    def __init__(self, vector_store: PolicyVectorStore | None = None):
        self.vector_store = vector_store or PolicyVectorStore()

    @staticmethod
    def build_query(claim_data: dict[str, Any]) -> str:
        return RETRIEVAL_QUERY_TEMPLATE.format(
            diagnosis=claim_data.get("diagnosis", "unknown"),
            treatment=claim_data.get("treatment", "unspecified"),
            amount=claim_data.get("estimated_cost", claim_data.get("amount", "n/a")),
            claim_type=claim_data.get("claim_type", "cashless"),
        ).strip()

    @staticmethod
    def _embed_text(text: str, dimension: int) -> list[float]:
        # Deterministic lightweight embedding fallback (no external provider required).
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        values = [((digest[i % len(digest)] / 255.0) * 2 - 1) for i in range(dimension)]
        norm = math.sqrt(sum(v * v for v in values)) or 1.0
        return [v / norm for v in values]

    def analyze_claim(self, claim_data: dict[str, Any]) -> dict[str, Any]:
        query = self.build_query(claim_data)
        query_embedding = self._embed_text(query, settings.pinecone_dimension)
        policy_id = str(claim_data.get("policy_number") or claim_data.get("policy_id") or "")

        matches = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=5,
            metadata_filter={"policy_id": policy_id} if policy_id else None,
        )

        citations = [
            PolicyCitation(
                section=str(match.metadata.get("section") or "General"),
                page_number=int(match.metadata.get("page_number") or 0),
                excerpt=str(match.metadata.get("text") or "")[:280],
            )
            for match in matches
        ]

        amount = float(claim_data.get("estimated_cost") or claim_data.get("amount") or 0)
        policy_limit = float(claim_data.get("policy_limit") or 0)
        waiting_period_ok = bool(claim_data.get("waiting_period_ok", True))
        exclusion_hit = bool(claim_data.get("exclusion_matched", False))

        if exclusion_hit or not waiting_period_ok:
            decision = PolicyDecision(
                coverage_decision="not_covered",
                covered_amount=0,
                reason="Claim failed exclusion/waiting-period checks.",
                citations=citations,
                exclusions=["Waiting period or exclusion condition matched"],
                waiting_period_violation=not waiting_period_ok,
            )
            return decision.model_dump()

        if policy_limit > 0 and amount > policy_limit:
            decision = PolicyDecision(
                coverage_decision="partial",
                covered_amount=policy_limit,
                reason=f"Requested amount exceeds policy limit. Capped at {policy_limit:,.2f}.",
                citations=citations,
                sub_limits_applied=["policy_limit_cap"],
            )
            return decision.model_dump()

        decision = PolicyDecision(
            coverage_decision="covered",
            covered_amount=max(0.0, amount),
            reason="Claim appears covered based on retrieved policy clauses.",
            citations=citations,
        )
        return decision.model_dump()
