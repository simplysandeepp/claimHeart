from __future__ import annotations


class AppealRepo:
    """In-memory fallback repository until DB-specific implementation is wired."""

    def __init__(self):
        self._items: list[dict] = []

    def list(self) -> list[dict]:
        return list(self._items)

    def create(self, item: dict) -> dict:
        self._items.append(item)
        return item
