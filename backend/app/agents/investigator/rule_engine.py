from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from app.utils.cost_baselines import estimate_cost_multiplier, get_cost_baseline


@dataclass
class FraudFinding:
    rule: str
    severity: str
    evidence: str
    score_delta: float


class FraudRuleEngine:
    def __init__(self, duplicate_window_days: int = 30, frequent_window_days: int = 180):
        self.duplicate_window_days = duplicate_window_days
        self.frequent_window_days = frequent_window_days

    @staticmethod
    def _parse_date(value: str | datetime | None) -> datetime | None:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
        return None

    def check_all_rules(self, claim: dict, historical_claims: list[dict] | None = None) -> list[dict]:
        history = historical_claims or []
        findings: list[FraudFinding] = []

        findings.extend(self._check_duplicate_claim(claim, history))
        findings.extend(self._check_waiting_period(claim))
        findings.extend(self._check_test_count(claim))
        findings.extend(self._check_cost_anomaly(claim))
        findings.extend(self._check_frequent_claims(claim, history))

        return [finding.__dict__ for finding in findings]

    def _check_duplicate_claim(self, claim: dict, history: list[dict]) -> list[FraudFinding]:
        patient_id = str(claim.get("patient_id", "")).strip().lower()
        diagnosis = str(claim.get("diagnosis", "")).strip().lower()
        claim_date = self._parse_date(claim.get("submitted_at") or claim.get("claim_date"))
        if not patient_id or not diagnosis or claim_date is None:
            return []

        duplicates = []
        for existing in history:
            e_patient = str(existing.get("patient_id", "")).strip().lower()
            e_diagnosis = str(existing.get("diagnosis", "")).strip().lower()
            e_date = self._parse_date(existing.get("submitted_at") or existing.get("claim_date"))
            if not e_date:
                continue
            if e_patient == patient_id and e_diagnosis == diagnosis and abs((claim_date - e_date).days) <= self.duplicate_window_days:
                duplicates.append(existing)

        if not duplicates:
            return []

        return [
            FraudFinding(
                rule="duplicate_claim",
                severity="high",
                evidence=f"{len(duplicates)} similar claim(s) for patient+diagnosis within {self.duplicate_window_days} days",
                score_delta=0.35,
            )
        ]

    def _check_waiting_period(self, claim: dict) -> list[FraudFinding]:
        policy_start = self._parse_date(claim.get("policy_start_date"))
        claim_date = self._parse_date(claim.get("submitted_at") or claim.get("claim_date"))
        waiting_days = int(claim.get("waiting_period_days", 0) or 0)

        if not policy_start or not claim_date or waiting_days <= 0:
            return []

        days_elapsed = (claim_date - policy_start).days
        if days_elapsed >= waiting_days:
            return []

        return [
            FraudFinding(
                rule="waiting_period_violation",
                severity="high",
                evidence=f"Claim filed at day {days_elapsed}; waiting period is {waiting_days} days",
                score_delta=0.30,
            )
        ]

    def _check_test_count(self, claim: dict) -> list[FraudFinding]:
        test_count = int(claim.get("test_count", 0) or 0)
        allowed = int(claim.get("allowed_test_count", 0) or 0)
        if allowed <= 0 or test_count <= allowed:
            return []

        return [
            FraudFinding(
                rule="test_count_violation",
                severity="medium",
                evidence=f"Test count {test_count} exceeds allowed limit {allowed}",
                score_delta=0.18,
            )
        ]

    def _check_cost_anomaly(self, claim: dict) -> list[FraudFinding]:
        diagnosis = str(claim.get("diagnosis", "")).strip()
        city = claim.get("city")
        billed_amount = float(claim.get("estimated_cost") or claim.get("amount") or 0)

        if billed_amount <= 0 or not diagnosis:
            return []

        baseline = get_cost_baseline(diagnosis=diagnosis, city=city)
        multiplier = estimate_cost_multiplier(diagnosis=diagnosis, billed_amount=billed_amount, city=city)
        if not baseline or not multiplier:
            return []

        if multiplier < 3:
            return []

        return [
            FraudFinding(
                rule="cost_anomaly",
                severity="medium" if multiplier < 4 else "high",
                evidence=f"Cost ₹{billed_amount:,.0f} is {multiplier:.2f}x baseline ₹{baseline:,.0f}",
                score_delta=min(0.35, 0.1 + (multiplier - 3) * 0.08),
            )
        ]

    def _check_frequent_claims(self, claim: dict, history: list[dict]) -> list[FraudFinding]:
        patient_id = str(claim.get("patient_id", "")).strip().lower()
        claim_date = self._parse_date(claim.get("submitted_at") or claim.get("claim_date"))
        if not patient_id or not claim_date:
            return []

        cutoff = claim_date - timedelta(days=self.frequent_window_days)
        recent_count = 0
        for existing in history:
            e_patient = str(existing.get("patient_id", "")).strip().lower()
            e_date = self._parse_date(existing.get("submitted_at") or existing.get("claim_date"))
            if e_patient == patient_id and e_date and e_date >= cutoff:
                recent_count += 1

        if recent_count < 5:
            return []

        return [
            FraudFinding(
                rule="frequent_claims",
                severity="medium",
                evidence=f"Patient has {recent_count} claims in last {self.frequent_window_days} days",
                score_delta=0.22,
            )
        ]
