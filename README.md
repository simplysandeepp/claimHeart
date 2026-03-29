# ClaimHeart 🧠🏥

**ClaimHeart** is a Glass-Box Medical Claims Adjudication & Fraud Defense platform powered by a sophisticated 4-agent AI pipeline. It processes medical insurance claims end-to-end securely, rapidly, and with extremely high accuracy, providing human operators full visibility into every automated decision.

## Product Overview
ClaimHeart utilizes the following AI agent pipeline orchestration to handle medical claims:
- **Agent 1 (Extractor):** GPT-4o Vision models extract structured JSON (Patient ID, CPT, ICD-10, billed amounts) from scanned medical PDF invoices.
- **Agent 2 (Policy Analyst):** LlamaIndex & Pinecone RAG pipelines read extensive insurance policy clauses to map claims against complex coverage rules, outputting exact page-level citations.
- **Agent 3 (Fraud Investigator):** An Isolation Forest anomaly detector, paired with LLM deterministic reasoning, flags duplicate procedures, uncovers cost baseline overages against CMS metrics, and tracks extreme synthetic patterns.
- **Agent 4 (Mediator):** Drafts clear, empathetic, and policy-cited approval/denial letters tailored to both patients and providers to minimize re-appeal rates.

## Built With
- **Backend:** Python 3.12, FastAPI, Celery, PostgreSQL, Redis, LlamaIndex, Pinecone, OpenAI GPT-4o, and Scikit-Learn.
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand, and React Query.

## Documentation
Check the `docs/` folder for comprehensive documentation on how the system operates:
- 🏗️ `architecture.md`
- 🤖 `agent-design.md`
- 🔒 `hipaa-compliance.md`
- 💻 `local-setup.md`
