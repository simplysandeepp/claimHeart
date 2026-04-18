from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.db.base_class import Base


class Webhook(Base):
    __tablename__ = "webhook"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, default="")
    status = Column(String(32), nullable=False, default="active")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
