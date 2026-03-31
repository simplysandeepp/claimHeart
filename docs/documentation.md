# 🏥 ClaimHeart — AI-Powered Multi-Agent Health Insurance Claims Orchestration

> *Glass-box adjudication. Real-time fraud detection. Zero paperwork. Full transparency for every stakeholder.*

---

## Table of Contents

1. [The Burning Platform — Why This Exists](#1-the-burning-platform)
2. [Real Human Cost](#2-real-human-cost)
3. [The Complete Insurance Claim Process (Ground Truth)](#3-the-complete-insurance-claim-process)
   - 3.1 [Two Types of Insurance Settlement](#31-two-types-of-insurance-settlement)
   - 3.2 [PL/AL Number & TPA Workflow](#32-plal-number--tpa-workflow)
   - 3.3 [Pre-Auth Form & Document Flow](#33-pre-auth-form--document-flow)
   - 3.4 [Claim Number & Approval TAT](#34-claim-number--approval-tat)
   - 3.5 [Policy Types & Waiting Period Rules](#35-policy-types--waiting-period-rules)
   - 3.6 [Sub-Limits, Tariffs & Disease-Specific Caps](#36-sub-limits-tariffs--disease-specific-caps)
4. [Fraud Taxonomy — Where Money Leaks](#4-fraud-taxonomy)
   - 4.1 [Patient-Side Fraud](#41-patient-side-fraud)
   - 4.2 [Hospital-Side Fraud](#42-hospital-side-fraud)
5. [What We Are Building — ClaimHeart System](#5-what-we-are-building)
6. [The Four AI Agents](#6-the-four-ai-agents)
7. [Three Stakeholder Dashboards](#7-three-stakeholder-dashboards)
8. [Technical Architecture](#8-technical-architecture)
9. [Prototype Roadmap — How to Actually Build This](#9-prototype-roadmap)
   - 9.1 [Tech Stack Recommendation](#91-tech-stack-recommendation)
   - 9.2 [Agent-by-Agent Build Plan](#92-agent-by-agent-build-plan)
   - 9.3 [RAG Pipeline for Policy Documents](#93-rag-pipeline-for-policy-documents)
   - 9.4 [Fraud Detection Engine — Implementation Details](#94-fraud-detection-engine--implementation-details)
   - 9.5 [TAT Monitor Agent](#95-tat-monitor-agent)
   - 9.6 [Patient Communication Agent](#96-patient-communication-agent)
10. [Demo Flow for Hackathon (30 Seconds WOW)](#10-demo-flow-for-hackathon)
11. [Business Model & Market Opportunity](#11-business-model--market-opportunity)
12. [Why This Wins](#12-why-this-wins)

---

## 1. The Burning Platform

Healthcare insurance in India and globally is broken at its core — not because of a lack of rules, but because of a complete lack of transparency, automation, and intelligence across the three parties involved: **patients**, **hospitals**, and **insurance companies**.

| Problem | Scale |
|---|---|
| Claims denied per year (India + US combined) | 1 in 5 claims rejected |
| Provider cost just to fight denials | **$25.7 Billion/year** |
| Annual losses due to healthcare fraud | **$68 Billion/year** |
| ICD-10 codes active in 2026 | **72,000+** — human error is structurally inevitable |
| Deepfake patient identity fraud growth | Fastest growing fraud vector in 2026 |
| Average reimbursement appeal time | **60–90 days** |
| Cost of a glucose monitor (wrongly denied) | ₹470 / $5 |
| Resulting preventable hospitalization | ₹4,70,000 / $47,000 |

The current solution being deployed across the industry: **more humans reviewing more PDFs.**

ClaimHeart replaces that broken loop with a fully orchestrated AI system.

---

## 2. Real Human Cost

> **Real Scenario A:** A diabetic patient's glucose monitor claim is denied — ICD-10 code listed as `E11.9` instead of the correct `E11.65`. The appeal takes 90 days. The patient stops monitoring. A preventable hospitalization costs ₹2,00,000. The original device cost ₹4,700. A ₹0.10 AI code validation check would have prevented the entire chain of events.

> **Real Scenario B:** A patient with tympanoplasty surgery submits a pre-auth form through TPA. The document sits in a queue. Initial approval (required within 1 hour before surgery begins) is delayed by 3 hours. The surgery is postponed. The patient suffers. Nobody in the chain — not the hospital, not the TPA, not the insurance company — proactively notified anyone.

> **Real Scenario C:** A hospital submits 4 separate claims using the same patient's insurance ID for a single hospitalization event. The patient has no idea. The insurance company processes all 4. ₹12 lakh is fraudulently paid out for a ₹3 lakh surgery.

**ClaimHeart is built specifically to prevent every one of these scenarios.**

---

## 3. The Complete Insurance Claim Process (Ground Truth)

*This section documents the real-world insurance claim workflow as practiced in India — the exact process ClaimHeart is built on top of.*

### 3.1 Two Types of Insurance Settlement

**Cashless:**
- Patient is admitted to a network hospital.
- The hospital directly contacts the insurance company/TPA for pre-authorization.
- Upon approval, money flows **directly from the insurance company to the hospital**.
- The patient pays nothing (or only the non-covered portion).

**Reimbursement:**
- Patient pays all bills out of pocket at the time of treatment.
- After discharge, they submit a formal claim with all supporting documents.
- Insurance company verifies everything and **reimburses the patient** directly.

---

### 3.2 PL/AL Number & TPA Workflow

When a patient is admitted to a hospital:

1. The hospital generates a unique **PL (Pre-authorization Letter) / AL (Admission Letter) number** — this is linked to the patient's insurance card number and acts as the claim's reference ID throughout its lifecycle.

2. This case is handed to a **TPA (Third Party Administrator)** — a licensed intermediary company that acts as the processing arm of the insurance company.

3. The TPA handles:
   - Verifying the patient's insurance card and policy validity
   - Receiving and reviewing the pre-auth form
   - Collecting all medical documentation
   - Routing decisions back to the insurance company's doctor panel

---

### 3.3 Pre-Auth Form & Document Flow

The pre-auth form is the spine of every claim. It is filled from the **hospital's TPA department** and contains:

| Document / Data Point | Purpose |
|---|---|
| Patient Identity & Insurance Card Number | Verify coverage |
| Full Medical History | Detect non-disclosure |
| Current Diagnosis | Match against policy coverage |
| Proposed Surgery / Treatment | Tympanoplasty, Appendectomy, etc. |
| Past Surgery & Treatment History | Flag pre-existing conditions |
| Doctor's Recommendation & Prescription | Validate medical necessity |
| Estimated Cost of Treatment | Compare against sub-limits and tariffs |
| Expected Number of Days of Hospitalization | Detect unnecessary admissions |

All of this is compiled on the hospital's side, **scanned into a PDF**, and sent to the insurance company. A **Claim Number** is issued upon receipt.

> ⚠️ **ClaimHeart Pain Point:** This PDF is still unstructured. No insurance company has a clean way to extract data from it automatically. Doctors and TPAs read it manually. This is the root cause of delays and errors.

---

### 3.4 Claim Number & Approval TAT

Once the claim number is issued, every insurance company's doctor panel has a **TAT (Turnaround Time)** obligation — a hard SLA on approval speed:

| Approval Stage | TAT | Amount Released |
|---|---|---|
| **Initial Approval** | 1 hour | 50–60% of estimated cost |
| **Discharge Approval** | 3 hours | Remaining 40–50% |

*Note: TAT timings vary company to company but these are industry standard benchmarks.*

**What happens if documents are missing or suspicious at discharge:**
- A **physical insurance agent** is dispatched to the hospital to verify on-ground.
- A **query is raised** on the doctor's portal — the hospital must respond before approval resumes.
- If fraud or policy violation is confirmed: the claim is **rejected** or the policy is **terminated**.

**Reasons a claim can be denied at this stage:**
- Documents missing or inconsistent
- Diagnosis doesn't match treatment
- Pre-existing condition detected (not disclosed at policy time)
- Bill exceeds policy sub-limit for that specific disease
- TAT breach caused by inadequate documentation

---

### 3.5 Policy Types & Waiting Period Rules

| Policy Type | Who Gets It | Waiting Period | Key Notes |
|---|---|---|---|
| **Corporate Policy** | Employees via employer group plan | ❌ No waiting period | Immediate coverage from Day 1 |
| **Retail Policy** | Individual consumers | ✅ **Minimum 2 years** | Varies by company and policy plan |

**Non-Disclosure Rule:**
If a patient buys a retail policy but hides a pre-existing condition (e.g., heart disease, diabetes, TB, chronic BP) — and the AI detects that the medical history pre-dates the policy purchase — the claim will be rejected and the policy can be terminated.

**Example:**
- Policy purchased: January 4, 2026 (Care Health Insurance)
- Heart disease detected in records: December 2024
- Claim filed for cardiac surgery: March 2026
- **Result: Claim rejected. Policy potentially terminated for material non-disclosure.**

---

### 3.6 Sub-Limits, Tariffs & Disease-Specific Caps

Insurance policies are not blanket coverage — they have **sub-limits per disease** and **tariff benchmarks** by hospital category:

**Sub-Limit Example:**
- Policy sub-limit for Dengue: ₹3,00,000
- Hospital bill submitted: ₹5,00,000
- **Result:** Claim rejected for the excess amount. The hospital committed a tariff violation.

**Tariff Variance Example:**
- Standard treatment cost for fever: ₹40,000–₹50,000
- Premium hospital billing same case: ₹1,00,000
- **Result:** Flagged for review. AI cross-checks against CMS/regional fee schedules.

**Redundant Test Example (Dengue Fraud):**
- Policy allows: maximum 2 tests/day for Dengue monitoring
- Hospital billed for: 5 tests/day
- **Result:** Excess 3 tests per day flagged as fraudulent billing inflation.

---

## 4. Fraud Taxonomy

### 4.1 Patient-Side Fraud

| Fraud Type | Description | AI Detection Method |
|---|---|---|
| **Non-Disclosure of Pre-existing Conditions** | Patient hides diabetes, BP, heart disease, TB at time of policy purchase | Cross-reference medical records date vs. policy start date using NLP on uploaded documents |
| **Waiting Period Violation** | Patient files claim before 2-year retail waiting period completes | Date arithmetic on policy issue date vs. claim date |
| **False Medical History** | Patient submits fabricated reports to justify a claim | AI document authenticity check — metadata, font analysis, template mismatch detection |
| **Policy Stacking** | Patient holds multiple policies and claims same treatment from all simultaneously | Cross-insurer claim ID deduplication |

---

### 4.2 Hospital-Side Fraud

| Fraud Type | Description | AI Detection Method |
|---|---|---|
| **Ghost / Duplicate Billing** | Hospital submits 4–5 claims using the same patient's insurance ID for a single admission | Claim deduplication engine — flags multiple claims from same PL/AL number |
| **Unnecessary Admissions** | Patient is kept admitted when no clinical necessity exists — to inflate billing | AI evaluates diagnosis severity vs. hospitalization duration using clinical benchmarks |
| **Bill Inflation via Redundant Tests** | Hospital orders excessive tests beyond what the policy or clinical standard allows | Compares number of tests billed vs. disease protocol limits stored in policy RAG |
| **Sub-Limit Busting** | Hospital deliberately bills beyond the disease-specific cap knowing patient won't check | Bill line-item comparison against policy sub-limits retrieved from RAG |
| **Upcoding** | Hospital codes a cheaper procedure with a more expensive CPT/ICD code | CPT/ICD code anomaly detection — statistical comparison against regional code frequency |
| **Phantom Services** | Hospital bills for services never rendered | Cross-reference discharge summary with billing line items — inconsistency flagging |
| **Inflated Room Charges** | Hospitals assign patients to premium rooms and bill accordingly when policy covers general wards only | Room category vs. policy entitlement comparison |

---

## 5. What We Are Building

**ClaimHeart** is a **multi-agent parallel orchestration AI system** that acts as the intelligent nervous system between hospitals, insurance companies, and patients.

It does 5 things simultaneously:

```
📄 Reads unstructured PDFs → Extracts structured claim data
📋 Checks every claim against exact policy clauses → Cites page numbers
🔎 Detects fraud patterns from both patients and hospitals → Flags anomalies
⏱️ Monitors TAT compliance → Escalates if SLA is breached
💬 Communicates to patients in simple language → No jargon, just truth
```

The system is designed for **three types of users** — each getting their own dashboard:

| Stakeholder | What They See | What AI Does For Them |
|---|---|---|
| **Patient** | Claim status, delay reason, rejection explanation, money trail | Translates insurance decisions into simple Hindi/English |
| **Hospital / TPA** | Pre-auth form submissions, query responses, claim status | Accelerates document verification, flags missing items |
| **Insurance Company** | Fraud alerts, policy violations, TAT breaches, decision recommendations | Provides glass-box decision rationale with full audit trail |

---

## 6. The Four AI Agents

### Agent 1: 📄 Extractor Agent
**Role:** Convert scanned PDF pre-auth forms and hospital bills into structured JSON.

**Inputs:** Scanned PDFs (pre-auth forms, discharge summaries, lab reports, prescriptions)

**Outputs:**
```json
{
  "patient_id": "MH-2026-00412",
  "patient_name": "Rajesh Kumar",
  "insurance_card_number": "CARE-XYZ-78234",
  "policy_type": "retail",
  "policy_start_date": "2024-01-04",
  "diagnosis": "Tympanoplasty — right ear",
  "icd10_code": "H72.01",
  "cpt_codes": ["69631"],
  "estimated_cost_inr": 85000,
  "hospitalization_days": 2,
  "doctor_name": "Dr. Anjali Mehta",
  "hospital_name": "Kokilaben Dhirubhai Ambani Hospital",
  "past_conditions": ["None disclosed"],
  "tests_ordered": ["CBC", "Blood Glucose Fasting", "Audiometry"]
}
```

**Key Differentiator:** Handles messy, handwritten, low-resolution scanned PDFs — not just clean digital forms. Uses Vision LLM (GPT-4o Vision or Claude 3.5 Sonnet with vision) for extraction.

---

### Agent 2: 📋 Policy RAG Agent
**Role:** Retrieve exact policy clauses that apply to the claim. Cite page numbers.

**How it works:**
- All insurance policy PDFs are chunked and embedded into a vector database (Pinecone / Qdrant / ChromaDB).
- When a claim comes in, the Policy Agent retrieves the **most relevant policy clauses** using semantic similarity search.
- It then maps extracted claim data against retrieved clauses to determine: covered / partially covered / denied.

**Output Example:**
```
CLAIM: Dengue treatment — ₹4,80,000
POLICY MATCH: Section 4.2, Page 7 — "Dengue fever sub-limit: ₹3,00,000 per policy year"
DECISION: Approved ₹3,00,000 | Denied ₹1,80,000
REASON: Claim exceeds disease sub-limit by ₹1,80,000
CITATION: Care Health Insurance Policy Document v2024, Page 7, Clause 4.2(b)
```

---

### Agent 3: 🔎 Fraud Investigator Agent
**Role:** Statistical and semantic anomaly detection across all claim dimensions.

**Detection Methods:**
- **Rule-based checks:** Duplicate claim IDs, date arithmetic for waiting period, test count vs. protocol
- **Statistical anomaly detection:** Isolation Forest on billing amounts vs. regional baseline
- **Semantic reasoning:** LLM analyzes clinical notes for internal inconsistency (e.g., "patient recovered fully" but 7 more days of hospitalization billed)
- **Cross-claim deduplication:** Same patient ID, same dates, multiple claim submissions

**Output Example:**
```
🚨 FRAUD FLAG — HIGH RISK
Patient ID: MH-2026-00412
Finding 1: Appendectomy billed twice in 45 days — same patient ID (Duplicate Billing)
Finding 2: Hospital cost ₹4,80,000 vs. regional average ₹1,00,000 (480% above baseline)
Finding 3: 6 CBC tests billed in one day — policy allows max 2/day for this diagnosis
Recommended Action: Dispatch physical verification agent to hospital
Confidence Score: 94.2%
```

---

### Agent 4: 💬 Mediator / Communication Agent
**Role:** Generate empathetic, clear, jargon-free explanations of every decision for patients. Draft professional queries to hospitals. Send escalation alerts to insurance company.

**Patient-Facing Output (simple language):**
```
Dear Rajesh,

Your claim for tympanoplasty surgery at Kokilaben Hospital has been 
PARTIALLY APPROVED.

✅ Approved: ₹60,000
❌ Not Approved: ₹25,000

Why was part of it not approved?
Your insurance plan covers room charges up to ₹3,000/day. 
The hospital charged ₹6,500/day for a premium room.
The difference of ₹3,500 × 5 days = ₹17,500 is not covered.
The remaining ₹7,500 was for 3 extra lab tests that your plan 
doesn't cover.

What can you do?
You can appeal by calling 1800-XXX-XXXX within 15 days.
We've attached the exact policy clause (Section 6.1, Page 12) 
for your reference.

— ClaimHeart AI
```

---

## 7. Three Stakeholder Dashboards

### 7.1 Patient Dashboard

```
┌─────────────────────────────────────────────────────┐
│  👤 Rajesh Kumar | Policy: CARE-XYZ-78234           │
│  Active Claim: #CLM-2026-00914                       │
├─────────────────────────────────────────────────────┤
│  STATUS:  🟡 In Progress — Awaiting Discharge Docs  │
│  TAT:     2h 14m elapsed | Limit: 3 hours           │
│  Amount Approved So Far: ₹42,500 / ₹85,000          │
├─────────────────────────────────────────────────────┤
│  📄 Upload Documents   │  📋 View Policy   │  ❓ FAQ │
├─────────────────────────────────────────────────────┤
│  TIMELINE                                            │
│  ✅ Pre-auth form received         Jan 15, 10:02 AM  │
│  ✅ Initial approval issued        Jan 15, 10:58 AM  │
│  🟡 Discharge docs requested       Jan 15, 03:15 PM  │
│  ⏳ Final approval pending                           │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Upload medical documents, prescriptions, reports (PDF, image)
- Track cashless and reimbursement claims in real time
- Get plain-language explanations of every status change
- See exactly what document is missing and why
- View the specific policy clause that led to a denial or partial approval

### 7.2 Hospital / TPA Dashboard

```
┌─────────────────────────────────────────────────────┐
│  🏥 Kokilaben Hospital | TPA Portal                 │
│  Open Claims: 14  |  Pending Queries: 3             │
├─────────────────────────────────────────────────────┤
│  ⚠️ QUERY PENDING — Claim #CLM-2026-00901           │
│  Insurance company needs: Discharge Summary (missing)│
│  TAT Remaining: 47 minutes                          │
│  [RESPOND NOW]                                       │
├─────────────────────────────────────────────────────┤
│  RECENT CLAIMS                                       │
│  CLM-2026-00914  Rajesh Kumar   ₹85,000  🟡 Pending │
│  CLM-2026-00901  Priya Sharma   ₹1,20,000 🔴 Query  │
│  CLM-2026-00887  Amit Desai     ₹45,000  ✅ Approved│
└─────────────────────────────────────────────────────┘
```

**Features:**
- Submit pre-auth forms and supporting documents digitally
- View TAT clock in real time with escalation alerts
- Respond to insurance company queries directly in portal
- Track initial and discharge approvals separately

### 7.3 Insurance Company Dashboard

```
┌─────────────────────────────────────────────────────┐
│  🛡️ Care Health Insurance | Claims Intelligence     │
│  Today: 1,247 claims | Fraud Flagged: 23 | TAT OK  │
├─────────────────────────────────────────────────────┤
│  🚨 HIGH FRAUD ALERTS (3)                           │
│  • Hospital: Shri Ram Clinic — Ghost billing x4     │
│  • Patient: Manish Gupta — Pre-existing non-disclose│
│  • Hospital: MediCare Plus — Cost 480% above avg    │
├─────────────────────────────────────────────────────┤
│  DECISION QUEUE                                      │
│  CLM-2026-01012  ⚠️ FLAG  [View Full Analysis]      │
│  CLM-2026-01009  ✅ AUTO-APPROVED                    │
│  CLM-2026-01007  🔴 REJECT — waiting period         │
├─────────────────────────────────────────────────────┤
│  TAT MONITOR                                         │
│  3 claims approaching TAT breach — [View Details]   │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Full fraud alert panel with confidence scores and evidence
- One-click access to AI decision rationale (glass-box)
- TAT compliance monitoring across all active claims
- Policy violation details with exact clause citations
- Physical agent dispatch trigger for high-risk claims

---

## 8. Technical Architecture

```
                     ┌─────────────────────────────┐
                     │      ClaimHeart Platform      │
                     │   (Next.js / React Frontend)  │
                     └──────────┬──────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
      Patient Dashboard   Hospital Dashboard   Insurer Dashboard
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │   Orchestration Layer     │
                    │  (LangGraph / CrewAI)     │
                    │  Parallel Agent Runner    │
                    └─┬──────┬──────┬──────┬───┘
                      │      │      │      │
              ┌───────┘  ┌───┘  ┌───┘  ┌──┘
              ▼          ▼      ▼      ▼
         Extractor   Policy  Fraud  Mediator
          Agent      Agent   Agent   Agent
              │          │      │      │
    ┌─────────┘   ┌──────┘  ┌───┘  ┌──┘
    ▼             ▼         ▼      ▼
GPT-4o       Pinecone   Isolation  Claude 
Vision LLM   Vector DB  Forest +   Sonnet
(PDF OCR)    (Policy    LLM Reason  (Letter
             RAG)       Engine)     Drafting)
    │             │         │      │
    └─────────────┴─────────┴──────┘
                            │
               ┌────────────▼─────────────┐
               │    Shared Data Layer     │
               │  PostgreSQL + Redis       │
               │  Patient Records         │
               │  Claim History           │
               │  Policy Embeddings       │
               │  Fraud Signal DB         │
               └──────────────────────────┘
                            │
               ┌────────────▼─────────────┐
               │    PII Redaction Layer   │
               │   Microsoft Presidio     │
               │  (HIPAA / DPDP Act Safe) │
               └──────────────────────────┘
```

### Key Technology Choices

| Component | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + Tailwind | Fast, SSR-capable, real-time updates |
| Agent Orchestration | LangGraph or CrewAI | Parallel agent execution with state management |
| PDF Extraction | GPT-4o Vision / Claude 3.5 Sonnet | Handles scanned, handwritten, low-res PDFs |
| Policy RAG | LlamaIndex + Pinecone | Semantic search over 100+ page policy documents |
| Fraud Detection | Isolation Forest + LLM reasoning | Catches statistical AND novel semantic anomalies |
| PII Redaction | Microsoft Presidio | HIPAA + India DPDP Act compliance |
| Backend API | FastAPI (Python) | Async, fast, native ML library support |
| Database | PostgreSQL + Redis | Claims persistence + real-time TAT tracking |
| Cost Baseline | CMS Medicare / IRDAi fee schedules | Ground truth for regional cost benchmarking |
| Notifications | Twilio / Firebase | Real-time SMS + push to patients |

---

## 9. Prototype Roadmap — How to Actually Build This

*This section is a detailed discussion on how to go from zero to a working hackathon prototype. Not theory — actual implementation steps.*

### 9.1 Tech Stack Recommendation

For a **hackathon MVP** (2–3 day build):

```
Backend:    Python + FastAPI
LLM:        Claude 3.5 Sonnet (via Anthropic API) — best for reasoning + document understanding
RAG:        LlamaIndex (simplest to set up) + ChromaDB (no cloud dependency)
Frontend:   Streamlit (fastest to build) OR Next.js if you have frontend experience
Database:   SQLite for hackathon → PostgreSQL for production
Fraud ML:   scikit-learn Isolation Forest (5 lines of code to train)
PDF:        PyMuPDF + Tesseract OCR for local PDF handling
```

For **post-hackathon production:**
```
Switch ChromaDB → Pinecone (scalable)
Switch Streamlit → Next.js + Tailwind
Add Presidio for PII redaction
Add Celery + Redis for async task queuing
Deploy on AWS/GCP with Docker
```

---

### 9.2 Agent-by-Agent Build Plan

#### Build Order (do this in sequence):

**Step 1 — Extractor Agent (Day 1, Morning)**

```python
# Install: pip install anthropic pymupdf pillow

import anthropic
import base64
import fitz  # PyMuPDF

def extract_claim_from_pdf(pdf_path: str) -> dict:
    # Convert PDF page to image
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for quality
    img_bytes = pix.tobytes("png")
    img_b64 = base64.standard_b64encode(img_bytes).decode("utf-8")
    
    client = anthropic.Anthropic()
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": img_b64
                    }
                },
                {
                    "type": "text",
                    "text": """Extract ALL information from this insurance pre-authorization form. 
                    Return ONLY a valid JSON object with these fields:
                    patient_id, patient_name, policy_number, policy_type (retail/corporate),
                    policy_start_date, diagnosis, icd10_code, cpt_codes (list), 
                    estimated_cost, hospitalization_days, doctor_name, hospital_name,
                    past_conditions (list), tests_ordered (list), surgery_name.
                    If any field is missing, use null."""
                }
            ]
        }]
    )
    
    import json
    raw = response.content[0].text
    # Strip markdown code blocks if present
    raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)
```

**Step 2 — Policy RAG Agent (Day 1, Afternoon)**

```python
# Install: pip install llama-index chromadb

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

def build_policy_index(policy_pdf_folder: str):
    """Index all policy documents once."""
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection("insurance_policies")
    
    documents = SimpleDirectoryReader(policy_pdf_folder).load_data()
    vector_store = ChromaVectorStore(chroma_collection=collection)
    index = VectorStoreIndex.from_documents(documents, vector_store=vector_store)
    return index

def check_policy_coverage(claim_data: dict, index) -> dict:
    """Given extracted claim data, find relevant policy clauses."""
    query = f"""
    What does the policy say about coverage for:
    - Diagnosis: {claim_data['diagnosis']}
    - Procedure: {claim_data.get('surgery_name', 'N/A')}
    - Estimated cost: INR {claim_data['estimated_cost']}
    - Tests: {', '.join(claim_data.get('tests_ordered', []))}
    
    Return: covered amount, sub-limits, exclusions, and exact policy section + page number.
    """
    
    query_engine = index.as_query_engine()
    response = query_engine.query(query)
    return {
        "policy_response": str(response),
        "source_nodes": [
            {
                "text": node.text[:200],
                "page": node.metadata.get("page_label", "N/A"),
                "score": node.score
            }
            for node in response.source_nodes
        ]
    }
```

**Step 3 — Fraud Investigator Agent (Day 2, Morning)**

```python
# Install: pip install scikit-learn pandas numpy

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import anthropic

# PART A: Statistical anomaly detection
def train_cost_anomaly_model(historical_claims_df: pd.DataFrame):
    """
    Train on historical claims data.
    historical_claims_df needs columns: diagnosis, cost, days, tests_count
    """
    features = historical_claims_df[['estimated_cost', 'hospitalization_days', 'tests_count']]
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    return model

def detect_statistical_fraud(claim_data: dict, model, regional_avg_cost: dict) -> dict:
    """Check if claim cost is anomalous vs. regional baseline."""
    diagnosis = claim_data['diagnosis']
    cost = claim_data['estimated_cost']
    days = claim_data.get('hospitalization_days', 1)
    tests = len(claim_data.get('tests_ordered', []))
    
    # Statistical check
    features = np.array([[cost, days, tests]])
    anomaly_score = model.score_samples(features)[0]
    is_anomaly = model.predict(features)[0] == -1
    
    # Regional baseline check
    baseline = regional_avg_cost.get(diagnosis, cost)
    cost_ratio = cost / baseline if baseline > 0 else 1
    
    return {
        "is_statistical_anomaly": bool(is_anomaly),
        "anomaly_score": float(anomaly_score),
        "cost_vs_regional_baseline_ratio": round(cost_ratio, 2),
        "cost_flag": cost_ratio > 3.0  # Flag if >300% of average
    }

# PART B: Semantic/reasoning fraud check
def detect_semantic_fraud(claim_data: dict, previous_claims: list) -> dict:
    """Use LLM reasoning to detect nuanced fraud patterns."""
    client = anthropic.Anthropic()
    
    fraud_prompt = f"""
    You are a medical insurance fraud investigator. Analyze this claim for fraud:
    
    Current Claim:
    {claim_data}
    
    Previous Claims for Same Patient:
    {previous_claims}
    
    Check for:
    1. Duplicate admissions (same procedure billed multiple times)
    2. Medical impossibilities (e.g., appendectomy twice in 45 days)
    3. Test count violations (compare to standard clinical protocols)
    4. Unnecessary hospitalization (mild diagnosis with excessive days)
    5. Pre-existing condition non-disclosure signals
    6. Bill inflation patterns
    
    Return a JSON with:
    - fraud_detected: true/false
    - fraud_types: list of fraud categories found
    - confidence_score: 0-100
    - evidence: list of specific evidence strings
    - recommendation: "approve" / "query" / "reject" / "dispatch_agent"
    """
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": fraud_prompt}]
    )
    
    import json
    raw = response.content[0].text.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)
```

**Step 4 — TAT Monitor Agent (Day 2, Afternoon)**

```python
from datetime import datetime, timedelta
import asyncio

TAT_LIMITS = {
    "initial_approval": timedelta(hours=1),
    "discharge_approval": timedelta(hours=3)
}

class TATMonitor:
    def __init__(self, db_connection):
        self.db = db_connection
    
    async def check_all_active_claims(self):
        """Run every 5 minutes. Flag breaches. Escalate if needed."""
        active_claims = self.db.get_active_claims()
        
        alerts = []
        for claim in active_claims:
            stage = claim['current_stage']  # "initial" or "discharge"
            submitted_at = claim['stage_start_time']
            limit = TAT_LIMITS.get(f"{stage}_approval")
            
            elapsed = datetime.now() - submitted_at
            remaining = limit - elapsed
            
            if remaining.total_seconds() < 0:
                # TAT BREACHED
                alerts.append({
                    "claim_id": claim['id'],
                    "status": "BREACHED",
                    "elapsed_minutes": int(elapsed.total_seconds() / 60),
                    "action": "escalate_to_senior"
                })
            elif remaining.total_seconds() < 900:  # < 15 minutes
                alerts.append({
                    "claim_id": claim['id'],
                    "status": "WARNING",
                    "remaining_minutes": int(remaining.total_seconds() / 60),
                    "action": "notify_insurer"
                })
        
        return alerts
    
    def get_breach_reason(self, claim_id: str) -> str:
        """AI explains WHY the TAT is breaching."""
        claim = self.db.get_claim(claim_id)
        bottleneck_map = {
            "missing_discharge_summary": "Hospital hasn't uploaded discharge summary",
            "pending_query_response": "Hospital hasn't responded to insurance query from 2h ago",
            "doctor_review_queue": "Senior doctor review queue has 12 cases pending",
            "payment_gateway_issue": "Payment processing system experiencing delays"
        }
        return bottleneck_map.get(claim.get('bottleneck'), "Unknown delay — human review required")
```

**Step 5 — Mediator / Communication Agent (Day 2, Evening)**

```python
def generate_patient_letter(claim_data: dict, decision: dict, policy_citation: dict) -> str:
    client = anthropic.Anthropic()
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=800,
        messages=[{
            "role": "user",
            "content": f"""
            Write a warm, empathetic, simple letter to a patient explaining their insurance claim decision.
            
            Patient Name: {claim_data['patient_name']}
            Claim For: {claim_data['diagnosis']}
            Approved Amount: {decision['approved_amount']}
            Denied Amount: {decision['denied_amount']}
            Denial Reasons: {decision['denial_reasons']}
            Policy Citation: {policy_citation['section']} Page {policy_citation['page']}
            
            Rules:
            - Use simple, everyday language (no insurance jargon)
            - Explain EXACTLY why money was denied in one or two clear sentences
            - Tell them what they can do next (appeal process)
            - Be empathetic and reassuring
            - Keep it under 200 words
            - End with a clear next step
            """
        }]
    )
    return response.content[0].text
```

---

### 9.3 RAG Pipeline for Policy Documents

**The challenge:** Insurance policy PDFs are 80–200 pages long. A claim involves checking maybe 5 clauses across that document. Naive RAG will miss things.

**Solution — Hierarchical RAG:**

```
Policy PDF
    │
    ├── Level 1: Section Summaries (what is each section about?)
    │   "Section 4: Disease Sub-Limits — covers per-disease payment caps"
    │
    ├── Level 2: Clause Chunks (300-500 tokens each)
    │   "4.2(b) Dengue fever: maximum payable ₹3,00,000 per policy year..."
    │
    └── Level 3: Tables (structured extraction)
        "Disease | Sub-limit | Waiting Period"
        "Dengue  | ₹3,00,000 | 90 days"
```

**Implementation tip:** Use `LlamaIndex's HierarchicalNodeParser` — it automatically builds this structure.

**Why this matters:** Simple chunking misses table data. A hospital billing ₹5 lakh for dengue while the table says ₹3 lakh cap will be caught only if the table was properly extracted.

---

### 9.4 Fraud Detection Engine — Implementation Details

**The Two-Layer Approach:**

Layer 1 — **Fast Rule Engine** (runs in milliseconds):
```python
FRAUD_RULES = [
    {
        "rule": "duplicate_claim",
        "check": lambda claim, history: any(
            c['patient_id'] == claim['patient_id'] and 
            c['diagnosis'] == claim['diagnosis'] and
            abs((c['admission_date'] - claim['admission_date']).days) < 60
            for c in history
        ),
        "severity": "HIGH",
        "action": "auto_reject"
    },
    {
        "rule": "waiting_period_violation",
        "check": lambda claim, policy: (
            policy['type'] == 'retail' and
            (claim['admission_date'] - policy['start_date']).days < 730
        ),
        "severity": "HIGH",
        "action": "auto_reject"
    },
    {
        "rule": "test_count_violation",
        "check": lambda claim, protocol: (
            len(claim['tests_ordered']) > protocol.get(claim['diagnosis'], {}).get('max_tests_per_day', 99)
        ),
        "severity": "MEDIUM",
        "action": "flag_for_review"
    }
]
```

Layer 2 — **LLM Semantic Reasoning** (runs for flagged claims only):
- Ask Claude to reason about the clinical narrative
- "Does a patient recovering from mild dengue fever truly need 8 days of ICU?"
- Outputs structured JSON with evidence and confidence score

**Why not just use LLM for everything?**
- Cost: 1000 claims/day × LLM call = expensive
- Speed: Rule engine catches 80% of obvious fraud in <10ms
- LLM reserved for the ambiguous 20%

---

### 9.5 TAT Monitor Agent

**Key Insight:** TAT monitoring isn't just about a clock — it's about understanding *why* a claim is stuck.

**Build a bottleneck classifier:**

```python
BOTTLENECK_SIGNALS = {
    "hospital_doc_missing": {
        "condition": lambda c: c['discharge_summary_uploaded'] == False,
        "message": "Discharge summary not yet uploaded by hospital",
        "action": "send_hospital_reminder",
        "eta_minutes": 30
    },
    "query_unanswered": {
        "condition": lambda c: c['open_queries'] > 0 and c['last_query_age_hours'] > 1,
        "message": "Hospital has not responded to insurance query",
        "action": "escalate_to_senior",
        "eta_minutes": 60
    },
    "fraud_flag_review": {
        "condition": lambda c: c['fraud_flag'] == True,
        "message": "Claim under fraud review — senior doctor assigned",
        "action": "notify_patient",
        "eta_minutes": 120
    }
}
```

This makes the patient communication meaningful: "Your claim is delayed because the hospital hasn't uploaded your discharge summary yet. We've sent them a reminder."

---

### 9.6 Patient Communication Agent

**Design Principle:** The patient is not an insurance expert. Every message must answer three questions:

1. **What happened?** (the decision)
2. **Why did it happen?** (the reason, in plain words)
3. **What now?** (the next step)

**Multilingual support** — since your target users are Indian patients, build support for:
- English
- Hindi
- Marathi, Gujarati, Tamil (future)

```python
def generate_patient_message(decision, language="hindi"):
    if language == "hindi":
        system = "Respond in simple conversational Hindi. Avoid insurance jargon."
    else:
        system = "Respond in simple English. Avoid insurance jargon."
    
    # Pass to Claude with appropriate system prompt
```

---

## 10. Demo Flow for Hackathon (30 Seconds WOW)

*This is your pitch moment. Every second counts.*

**Live Demo Script:**

```
00:00 — Upload a scanned PDF pre-auth form (messy, handwritten)
00:04 — PDF disappears. Structured JSON appears on screen. "Extraction complete."
00:08 — Policy agent retrieves: "Dengue sub-limit: ₹3,00,000 — Policy Section 4.2 Page 7"
          Judge clicks the PDF link. The exact page opens. The clause is highlighted.
00:14 — Fraud agent fires:
          🚨 "Same patient ID used for 4 claims in 30 days"
          🚨 "7 tests billed — policy allows max 2/day"
          🚨 "Cost 480% above regional baseline"
00:20 — Patient letter appears on screen:
          "Dear Rajesh, your claim for dengue treatment has been partially approved.
           ₹3,00,000 has been approved. ₹2,00,000 was not approved because your plan 
           has a ₹3 lakh cap for dengue (Section 4.2, Page 7)."
00:27 — Show the TAT dashboard: 3 claims approaching breach. One auto-escalation fired.
00:30 — End. Silence. Applause.
```

**5 Synthetic Claims to prepare:**
1. Normal dengue claim — approved cleanly
2. Dengue claim over sub-limit — partial approval with citation
3. Duplicate claim (same patient, same surgery, 30 days apart) — flagged HIGH RISK
4. Waiting period violation (retail policy, 6 months old) — auto-rejected
5. Unnecessary hospitalization + excess tests — flagged for agent dispatch

---

## 11. Business Model & Market Opportunity

| Metric | Value |
|---|---|
| Healthcare Revenue Cycle Management Market | **$16 Billion** (2026) |
| Annual fraud losses (India + US) | **$68 Billion** |
| Annual denial-fighting cost (providers) | **$25.7 Billion** |
| ClaimHeart target segment (Year 1) | Mid-size TPAs + insurers (1–5M claims/year) |

**Monetization Model — Contingency Pricing:**
- Take **5% of all successfully recovered denied claims**
- Zero upfront cost for hospitals or insurance companies
- If ClaimHeart recovers ₹100 Cr in denied claims for a large insurer → earns ₹5 Cr
- One large insurer processing 10M claims/year = ₹50–100 Cr annual revenue potential

**Additional Revenue Streams:**
- SaaS subscription for TPA dashboard access
- Per-claim API pricing for insurance companies integrating directly
- Fraud-as-a-Service: sell fraud signal data (anonymized) to re-insurers

**Regulatory Tailwind:**
- IRDAI (Insurance Regulatory and Development Authority of India) pushing for claims digitization
- No Surprises Act (US) mandate for cost transparency
- India DPDP Act 2023 creates compliance demand for secure claims handling
- CMS prior authorization mandates create instant demand for AI-assisted processing

**Exit Path:**
- Acquisition target for **Optum, Waystar, Medi Assist, Paramount Health, Star Health**
- Valuation benchmark: AI-native claims intelligence layer → $500M–$1B acquisition range

---

## 12. Why This Wins

| Dimension | Score | Evidence |
|---|---|---|
| **Real-World Problem** | ★★★★★ | Built from actual insurance workflow — PL/AL numbers, TPA process, TAT, sub-limits — not academic |
| **Technical Depth** | ★★★★★ | Vision LLM + RAG + Isolation Forest + LLM reasoning + PII redaction in one pipeline |
| **Business Impact** | ★★★★★ | $93B combined problem. CFO-level ROI narrative. Protects both insurance companies AND patients |
| **Demo WOW Factor** | ★★★★★ | PDF → JSON → decision → patient letter in <30 seconds. Every step explainable. Judges feel the impact |
| **Build Feasibility** | ★★★★☆ | Synthetic data avoids all HIPAA/DPDP issues. 5-claim MVP is tightly scoped for 48 hours |
| **Social Good** | ★★★★★ | Protects ordinary patients from both hospital fraud AND opaque insurer rejections |

---

> **ClaimHeart is not another claims processing tool. It is the first AI system that fights for all three parties simultaneously — protecting patients from fraud, protecting insurers from losses, and protecting hospitals from compliance errors — with full transparency at every step.**

---
