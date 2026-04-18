from __future__ import annotations

import base64
from io import BytesIO

from pdf2image import convert_from_path


class PdfConversionError(RuntimeError):
    pass


def pdf_to_pil_images(pdf_path: str, dpi: int = 300):
    try:
        return convert_from_path(pdf_path, dpi=dpi)
    except Exception as exc:
        raise PdfConversionError(f"Failed to convert PDF to images: {exc}") from exc


def pdf_to_base64_images(pdf_path: str, dpi: int = 300, image_format: str = "PNG") -> list[str]:
    images = pdf_to_pil_images(pdf_path=pdf_path, dpi=dpi)
    encoded: list[str] = []

    for image in images:
        buffer = BytesIO()
        image.save(buffer, format=image_format)
        encoded_image = base64.b64encode(buffer.getvalue()).decode("utf-8")
        mime = "image/png" if image_format.upper() == "PNG" else "image/jpeg"
        encoded.append(f"data:{mime};base64,{encoded_image}")

    return encoded
