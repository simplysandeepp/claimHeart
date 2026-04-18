from __future__ import annotations

import re
import uuid
from dataclasses import dataclass

from app.agents.policy.document_loader import PageText


@dataclass
class PolicyChunk:
    id: str
    text: str
    section: str
    page_number: int


def _estimate_token_count(text: str) -> int:
    # Rough heuristic: 1 token ≈ 0.75 words for English-heavy policy text.
    return int(len(text.split()) / 0.75)


def chunk_policy_pages(pages: list[PageText], target_tokens: int = 700, overlap_tokens: int = 80) -> list[PolicyChunk]:
    chunks: list[PolicyChunk] = []

    for page in pages:
        paragraphs = [p.strip() for p in re.split(r"\n{2,}", page.text) if p.strip()]
        current = ""
        section = "General"

        for para in paragraphs:
            section_match = re.match(r"^(section\s+[\w\.\-\(\)]+)", para, re.IGNORECASE)
            if section_match:
                section = section_match.group(1)

            candidate = f"{current}\n\n{para}".strip() if current else para
            if _estimate_token_count(candidate) <= target_tokens:
                current = candidate
                continue

            if current:
                chunks.append(
                    PolicyChunk(
                        id=f"chunk-{uuid.uuid4().hex}",
                        text=current,
                        section=section,
                        page_number=page.page_number,
                    )
                )

            words = para.split()
            if len(words) > overlap_tokens:
                current = " ".join(words[: overlap_tokens * 2])
            else:
                current = para

        if current:
            chunks.append(
                PolicyChunk(
                    id=f"chunk-{uuid.uuid4().hex}",
                    text=current,
                    section=section,
                    page_number=page.page_number,
                )
            )

    return chunks
