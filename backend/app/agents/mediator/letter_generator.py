from __future__ import annotations

from app.agents.mediator.prompts import (
    HOSPITAL_QUERY_EN,
    HOSPITAL_QUERY_HI,
    INSURER_REPORT_EN,
    INSURER_REPORT_HI,
    PATIENT_TEMPLATE_EN,
    PATIENT_TEMPLATE_HI,
)


def _hi_status(status: str) -> str:
    mapping = {
        "approved": "स्वीकृत",
        "partially_approved": "आंशिक रूप से स्वीकृत",
        "denied": "अस्वीकृत",
        "under_review": "समीक्षा में",
        "pending": "लंबित",
    }
    return mapping.get(status.lower(), status)


def generate_patient_letter(decision_packet: dict, language: str = "en") -> tuple[str, str]:
    name = decision_packet.get("patient_name", "Patient")
    claim_id = decision_packet.get("claim_id", "N/A")
    status = str(decision_packet.get("status", "under_review"))
    approved_amount = decision_packet.get("approved_amount", 0)
    reason = decision_packet.get("reason", "Decision under review")
    citation = decision_packet.get("citation", "Policy clause reference unavailable")

    if language == "hi":
        body = PATIENT_TEMPLATE_HI.format(
            name=name,
            claim_id=claim_id,
            status_hi=_hi_status(status),
            approved_amount=approved_amount,
            reason_hi=reason,
            citation=citation,
        )
        return (f"क्लेम अपडेट: {claim_id}", body)

    body = PATIENT_TEMPLATE_EN.format(
        name=name,
        claim_id=claim_id,
        status=status,
        approved_amount=approved_amount,
        reason=reason,
        citation=citation,
    )
    return (f"Claim Update: {claim_id}", body)


def generate_hospital_query(decision_packet: dict, language: str = "en") -> tuple[str, str]:
    claim_id = decision_packet.get("claim_id", "N/A")
    missing_documents = decision_packet.get("missing_documents", [])
    citation = decision_packet.get("citation", "Policy verification request")
    doc_text = "\n".join(f"- {item}" for item in missing_documents) if missing_documents else "- Additional treatment notes"

    if language == "hi":
        body = HOSPITAL_QUERY_HI.format(claim_id=claim_id, missing_documents=doc_text, citation=citation)
        return (f"स्पष्टीकरण आवश्यक: {claim_id}", body)

    body = HOSPITAL_QUERY_EN.format(claim_id=claim_id, missing_documents=doc_text, citation=citation)
    return (f"Clarification Needed: {claim_id}", body)


def generate_insurer_report(decision_packet: dict, language: str = "en") -> tuple[str, str]:
    payload = {
        "claim_id": decision_packet.get("claim_id", "N/A"),
        "name": decision_packet.get("patient_name", "Patient"),
        "status": decision_packet.get("status", "under_review"),
        "status_hi": _hi_status(str(decision_packet.get("status", "under_review"))),
        "requested_amount": decision_packet.get("requested_amount", 0),
        "approved_amount": decision_packet.get("approved_amount", 0),
        "reason": decision_packet.get("reason", "No reason provided"),
        "reason_hi": decision_packet.get("reason", "कोई कारण उपलब्ध नहीं"),
        "citation": decision_packet.get("citation", "N/A"),
    }

    if language == "hi":
        return (f"बीमाकर्ता रिपोर्ट: {payload['claim_id']}", INSURER_REPORT_HI.format(**payload))

    return (f"Insurer Report: {payload['claim_id']}", INSURER_REPORT_EN.format(**payload))
