from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

BASELINE_PATH = Path(__file__).resolve().parents[2] / "data" / "cost_baselines.json"


@lru_cache(maxsize=1)
def load_cost_baselines() -> dict[str, dict[str, float]]:
    if not BASELINE_PATH.exists():
        return {}
    with BASELINE_PATH.open("r", encoding="utf-8") as fh:
        payload = json.load(fh)
    return {k.lower(): {ck.lower(): float(cv) for ck, cv in v.items()} for k, v in payload.items()}


def list_supported_diagnoses() -> list[str]:
    return sorted(load_cost_baselines().keys())


def get_cost_baseline(diagnosis: str, city: str | None = None) -> float | None:
    data = load_cost_baselines()
    entry = data.get((diagnosis or "").strip().lower())
    if not entry:
        return None

    if city:
        city_key = city.strip().lower()
        if city_key in entry:
            return entry[city_key]

    return entry.get("average")


def estimate_cost_multiplier(diagnosis: str, billed_amount: float, city: str | None = None) -> float | None:
    baseline = get_cost_baseline(diagnosis=diagnosis, city=city)
    if not baseline or baseline <= 0:
        return None
    return billed_amount / baseline
