# ClaimHeart

ClaimHeart is a full-stack healthcare insurance claims platform built as a final project around one core idea: make medical claim adjudication faster, more explainable, and more transparent for every stakeholder involved.

The project combines a role-based web experience for patients, hospitals, and insurers with an AI-assisted backend pipeline for OCR, document understanding, policy-grounded review, fraud-risk analysis, and decision support.

## Problem Statement

Medical claims are often delayed by manual document review, incomplete submissions, unclear policy interpretation, and fraud risk. Patients struggle to understand decisions, hospitals face repeated back-and-forth, and insurers need better auditability before approving or rejecting a claim.

ClaimHeart addresses that gap by turning unstructured claim documents into structured review workflows with visible reasoning, role-specific dashboards, and explainable outputs.

## Project Goals

- Reduce manual effort in claim intake and review
- Improve transparency for claim decisions
- Support policy-grounded and evidence-backed adjudication
- Surface fraud and anomaly signals early
- Provide separate but connected experiences for patients, hospitals, and insurers

## Key Features

- Role-based frontend dashboards for patient, hospital, and insurer workflows
- Modern landing page and auth flow for project presentation
- Demo-ready seeded data stored locally for smooth walkthroughs
- Claim queue, claim detail, fraud alerts, letters, reports, and policy views
- OCR upload API for images and PDFs
- Gemini-assisted document classification and structured extraction
- Planned multi-agent architecture covering intake, policy review, medical or fraud review, and cross-validation
- Documentation set for architecture, workflow, compliance, and data flow

## Current Implementation Status

This repository already includes a strong end-to-end project structure, but not every planned backend module is fully wired yet.

Implemented today:

- Frontend application with polished multi-role dashboards and demo workflows
- Local mock authentication and seeded demo users
- OCR backend endpoints for upload and local-file processing
- Health endpoint and FastAPI app bootstrap
- Extraction service using OCR plus Gemini-based structuring
- Project documentation and repository scaffolding for the larger platform

Scaffolded or partially implemented:

- Claims, fraud, letters, policies, and users API routes
- Service-layer modules for claim and policy orchestration
- Agent directories for extractor, policy, investigator, and mediator flows
- Database, queue, monitoring, and Docker-related structure for future expansion

## System Architecture

ClaimHeart is designed as a glass-box adjudication platform:

1. Documents are uploaded by the hospital or other stakeholder.
2. OCR and extraction convert raw files into structured claim data.
3. Policy and medical or fraud analysis review the claim against evidence.
4. A final recommendation is surfaced with supporting rationale.
5. Patients, hospitals, and insurers see the same claim through role-specific dashboards.

The repository architecture also reflects a larger target system with:

- Next.js frontend for user-facing experiences
- FastAPI backend for APIs
- AI extraction and agent orchestration modules
- Database and repository layers
- Celery and Redis for async workflows
- Prometheus and Grafana folders for observability setup

## Tech Stack

Frontend:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Zustand

Backend:

- FastAPI
- Uvicorn
- Python
- EasyOCR
- Tesseract OCR
- OpenCV
- PyMuPDF and pdf2image
- Google Gemini API | Groq API
- Celery
- Redis
- SQLAlchemy
- PostgreSQL

## Repository Structure

```text
claimHeart/
|- frontend/          Next.js application, dashboards, pages, components
|- backend/           FastAPI app, OCR pipeline, agents, services, DB scaffolding
|- docs/              Architecture, workflow, compliance, and setup notes
|- docker/            Redis, Prometheus, Grafana, and DB-related config
|- README.md
```

## Main User Roles

- Patient: tracks claim status, reads letters, and sees simplified updates
- Hospital: uploads documents, manages submissions, and monitors workflow progress
- Insurer: reviews claim evidence, fraud alerts, decisions, and audit-ready summaries

## Demo Credentials

The frontend seeds demo users into local storage on first load.

| Role | Email | Password |
|---|---|---|
| Patient | `priya@test.com` | `patient123` |
| Hospital | `apollo@test.com` | `hospital123` |
| Insurer | `star@test.com` | `insurer123` |

## Running The Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Backend

Create and activate a virtual environment, then install dependencies:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Set your Gemini API key in an environment file:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`.

## Available Backend Endpoints

- `GET /` - basic API status
- `GET /api/health` - health check
- `POST /api/ocr/upload` - upload image or PDF for OCR processing
- `POST /api/ocr/process-local` - process a local file path on the server

Interactive API docs:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## OCR Notes

The OCR pipeline accepts:

- PDF
- JPG and JPEG
- PNG

Current limits:

- Maximum upload size is 10 MB
- Tesseract may need to be installed separately on your machine
- EasyOCR downloads its model files on first use

## Documentation

Project documents are available in the `docs/` folder, including:

- `architecture.md`
- `agent-design.md`
- `data-flow.md`
- `documentation.md`
- `hipaa-compliance.md`
- `workflow.md`

## Why This Project Matters

ClaimHeart is not just a UI demo or a single OCR script. It is structured as a healthcare claims platform that can grow into a complete adjudication system with explainable AI support, role-aware operations, and a stronger audit trail for real-world insurance workflows.

For a final project, it demonstrates:

- full-stack development
- applied AI integration
- domain-focused workflow design
- multi-role product thinking
- scalable architecture planning

## Future Scope

- Complete the claims, fraud, policy, letters, and users APIs
- Replace local mock auth with real authentication and authorization
- Connect frontend dashboards to live backend data
- Add persistent storage and migrations for production-ready claim records
- Integrate async task execution for full claim orchestration
- Expand testing across frontend and backend modules

## License

This project is released under the license included in the repository.
