from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import claims, documents, health, ocr, policies, users
from app.core.config import settings
from app.core.exceptions import setup_exception_handlers, success_response
from app.db.base_class import Base
from app.db.session import engine
import app.db.models  # noqa: F401

app = FastAPI(
    title=settings.app_name,
    description="Medical Claims Processing System",
    version=settings.app_version,
)

# Ensure schema exists for local/dev runs where migrations are not applied yet.
Base.metadata.create_all(bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

setup_exception_handlers(app)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(users.router, prefix="/api/auth", tags=["Auth"])
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(policies.router, prefix="/api/policies", tags=["Policies"])


@app.get("/")
async def root():
    return success_response({"message": "ClaimHeart API is running", "version": settings.app_version})
