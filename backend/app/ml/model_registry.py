from __future__ import annotations

from pathlib import Path
import pickle

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def model_path(model_name: str) -> Path:
    safe_name = model_name.replace("/", "_")
    return MODEL_DIR / f"{safe_name}.pkl"


def save_model(model_name: str, model: object) -> Path:
    path = model_path(model_name)
    with path.open("wb") as fh:
        pickle.dump(model, fh)
    return path


def load_model(model_name: str) -> object | None:
    path = model_path(model_name)
    if not path.exists():
        return None
    with path.open("rb") as fh:
        return pickle.load(fh)
