from __future__ import annotations

from pydantic import BaseModel, Field


class MediatorMessage(BaseModel):
    recipient_type: str = Field(description="patient | hospital | insurer")
    language: str = Field(default="en", description="en | hi")
    subject: str
    body: str
    citations: list[str] = Field(default_factory=list)
