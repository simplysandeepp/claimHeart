from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import fitz  # PyMuPDF


@dataclass
class PageText:
    page_number: int
    text: str


class PolicyDocumentLoader:
    def extract_text_with_pages(self, pdf_path: str) -> list[PageText]:
        path = Path(pdf_path)
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(f"Policy PDF not found: {pdf_path}")

        pages: list[PageText] = []
        with fitz.open(pdf_path) as doc:
            for idx, page in enumerate(doc, start=1):
                text = page.get_text("text").strip()
                if text:
                    pages.append(PageText(page_number=idx, text=text))
        return pages
