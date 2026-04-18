from __future__ import annotations

from pydantic import BaseModel, Field


class PolicyCitation(BaseModel):
    section: str = Field(default="Unknown")
    page_number: int = Field(default=0, ge=0)
    excerpt: str = Field(default="")


class PolicyDecision(BaseModel):
    coverage_decision: str = Field(description="covered | partial | not_covered")
    covered_amount: float = Field(default=0, ge=0)
    reason: str
    citations: list[PolicyCitation] = Field(default_factory=list)
    sub_limits_applied: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    waiting_period_violation: bool = False
