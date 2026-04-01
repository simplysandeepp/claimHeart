from fastapi import FastAPI
from app.api.routes import ocr

app = FastAPI()

app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])