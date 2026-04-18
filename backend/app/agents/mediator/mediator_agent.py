from __future__ import annotations

from app.agents.mediator.letter_generator import (
    generate_hospital_query,
    generate_insurer_report,
    generate_patient_letter,
)
from app.agents.mediator.output_schema import MediatorMessage


class MediatorAgent:
    SUPPORTED_LANGUAGES = {"en", "hi"}

    def generate_message(self, decision_packet: dict, recipient_type: str, language: str = "en") -> dict:
        lang = language if language in self.SUPPORTED_LANGUAGES else "en"
        recipient = recipient_type.lower().strip()

        if recipient == "patient":
            subject, body = generate_patient_letter(decision_packet, language=lang)
        elif recipient == "hospital":
            subject, body = generate_hospital_query(decision_packet, language=lang)
        elif recipient == "insurer":
            subject, body = generate_insurer_report(decision_packet, language=lang)
        else:
            raise ValueError(f"Unsupported recipient_type: {recipient_type}")

        message = MediatorMessage(
            recipient_type=recipient,
            language=lang,
            subject=subject,
            body=body,
            citations=[str(decision_packet.get("citation", "N/A"))],
        )
        return message.model_dump()
