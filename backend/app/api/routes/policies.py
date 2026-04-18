from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_current_user
from app.agents.policy.document_loader import PolicyDocumentLoader
from app.agents.policy.vector_store import PolicyVectorStore
from app.core.config import settings
from app.core.exceptions import success_response
from app.db.models.user import User
from app.pipelines.document_chunking import chunk_policy_pages
from app.pipelines.query_engine import get_policy_analysis_with_cache

router = APIRouter()


class PolicyLookupRequest(BaseModel):
    policy_number: str = Field(min_length=2, max_length=64)
    diagnosis: str = Field(min_length=2, max_length=120)
    treatment: str = Field(default="general treatment", max_length=160)
    amount: float = Field(default=0, ge=0)
    policy_limit: float | None = Field(default=None, ge=0)
    waiting_period_ok: bool = True
    exclusion_matched: bool = False


class PolicyIngestRequest(BaseModel):
    pdf_path: str
    policy_id: str = Field(min_length=2, max_length=64)


@router.post("/analyze")
def analyze_policy(payload: PolicyLookupRequest, _: User = Depends(get_current_user)):
    claim_data = {
        "policy_number": payload.policy_number,
        "diagnosis": payload.diagnosis,
        "treatment": payload.treatment,
        "estimated_cost": payload.amount,
        "policy_limit": payload.policy_limit,
        "waiting_period_ok": payload.waiting_period_ok,
        "exclusion_matched": payload.exclusion_matched,
    }
    result = get_policy_analysis_with_cache(claim_data=claim_data)
    return success_response(result)


@router.post("/ingest")
def ingest_policy(payload: PolicyIngestRequest, _: User = Depends(get_current_user)):
    loader = PolicyDocumentLoader()
    store = PolicyVectorStore()

    try:
        pages = loader.extract_text_with_pages(payload.pdf_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    chunks = chunk_policy_pages(pages)
    vectors = [
        {
            "id": chunk.id,
            "embedding": [0.0] * settings.pinecone_dimension,
            "text": chunk.text,
            "policy_id": payload.policy_id,
            "section": chunk.section,
            "page_number": chunk.page_number,
        }
        for chunk in chunks
    ]

    upsert_result = store.upsert_policy_chunks(vectors)
    return success_response({
        "policy_id": payload.policy_id,
        "pages": len(pages),
        "chunks": len(chunks),
        "vector_store": upsert_result,
    })
