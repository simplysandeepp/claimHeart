from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from app.ml.model_registry import load_model, save_model

try:
    from sklearn.ensemble import IsolationForest  # type: ignore
except Exception:  # pragma: no cover
    IsolationForest = None


@dataclass
class ClaimFeatures:
    cost: float
    test_count: float
    duration_days: float
    claim_frequency: float
    days_since_policy_start: float
    patient_age: float


class AnomalyDetector:
    MODEL_NAME = "isolation_forest"

    def __init__(self):
        self.model = load_model(self.MODEL_NAME)

    def train(self, dataset: Iterable[ClaimFeatures], contamination: float = 0.05) -> dict:
        rows = [self._to_vector(item) for item in dataset]
        if not rows:
            raise ValueError("Dataset is empty")

        if IsolationForest is None:
            # Minimal fallback: persist baseline stats for heuristic scoring.
            means = [sum(col) / len(col) for col in zip(*rows)]
            self.model = {"type": "heuristic", "means": means}
        else:
            model = IsolationForest(contamination=contamination, random_state=42)
            model.fit(rows)
            self.model = model

        path = save_model(self.MODEL_NAME, self.model)
        return {"trained": True, "samples": len(rows), "path": str(path)}

    def get_anomaly_score(self, features: ClaimFeatures) -> float:
        vector = [self._to_vector(features)]

        if self.model is None:
            return self._heuristic_score(vector[0])

        if isinstance(self.model, dict) and self.model.get("type") == "heuristic":
            return self._heuristic_score(vector[0], means=self.model.get("means"))

        raw = float(self.model.decision_function(vector)[0])  # type: ignore[union-attr]
        scaled = max(0.0, min(100.0, (1.0 - raw) * 50.0))
        return round(scaled, 2)

    @staticmethod
    def _to_vector(item: ClaimFeatures) -> list[float]:
        return [
            float(item.cost),
            float(item.test_count),
            float(item.duration_days),
            float(item.claim_frequency),
            float(item.days_since_policy_start),
            float(item.patient_age),
        ]

    @staticmethod
    def _heuristic_score(vector: list[float], means: list[float] | None = None) -> float:
        if not means:
            # Conservative fallback when no trained baseline exists.
            cost, tests, duration, frequency, _, _ = vector
            score = (cost / 500000) * 35 + (tests / 25) * 20 + (duration / 30) * 15 + (frequency / 8) * 30
            return round(max(0.0, min(100.0, score)), 2)

        deltas = [abs(v - m) / (m + 1e-6) for v, m in zip(vector, means)]
        score = min(100.0, sum(deltas) / len(deltas) * 70)
        return round(score, 2)
