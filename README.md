# AI-Powered Automated Resume Screening and Job Matching System

Final-year Computer Science Engineering project using NLP and Machine Learning to automatically parse resumes, extract candidate information, and rank candidates against job descriptions using semantic similarity (Sentence-BERT).

## Project Structure

```
resume-screening-system/
├── backend/        # Node.js + Express REST API (auth, resumes, jobs, matching, analytics)
├── ml-service/     # Python + FastAPI microservice (NLP parsing, SBERT embeddings, ranking)
├── frontend/       # React.js + Vite + Tailwind + Redux Toolkit SPA
└── docs/           # Full documentation set (see below)
```

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios, Recharts |
| Backend | Node.js, Express.js, Mongoose, JWT, bcrypt, Multer |
| ML Service | Python, FastAPI, spaCy, Sentence-Transformers (SBERT), scikit-learn |
| Database | MongoDB |
| Deployment | Render (backend + ML service), Vercel (frontend), MongoDB Atlas |

## Quick Start

See `docs/10_deployment_guide.md` for full setup + deployment instructions. Short version:

```bash
# 1. ML Service
cd ml-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000

# 2. Backend (new terminal)
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI + JWT secrets
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`, register as a **candidate** to upload a resume, and register as a **recruiter** (in a separate browser/incognito session) to post a job and run AI matching.

## Documentation Index (`/docs`)

| File | Contents |
|---|---|
| `01_abstract_introduction_scope.md` | Abstract, Introduction, Problem Statement, Objectives, Scope |
| `02_existing_proposed_gap_literature.md` | Existing System, Proposed System, Gap Identification, Literature Survey |
| `03_methodology_and_algorithms.md` | Methodology + pseudocode for parsing, similarity, ranking algorithms |
| `04_architecture_hld_lld_folder_structure.md` | System Architecture, HLD, LLD, Folder Structure (Mermaid diagrams) |
| `05_er_dfd_usecase_class_activity_diagrams.md` | ER Diagram, DFD, Use Case, Class, Activity Diagrams |
| `06_authentication_flow.md` | JWT Auth Sequence Diagram + RBAC explanation |
| `07_database_schema.md` | All 7 MongoDB collections with field-level schema |
| `08_api_documentation.md` | Full REST API reference with sample requests/responses |
| `09_testing.md` | Testing strategy, sample Jest/Pytest test cases, test case table |
| `10_deployment_guide.md` | Render/Vercel/MongoDB Atlas deployment steps |
| `11_results_conclusion_future_scope_references.md` | Results, Conclusion, Future Scope, References |

## Core Feature Highlights

- **Hybrid NLP resume parser** — spaCy NER + section-based heuristics extract name, contact info, skills, education, experience from PDF/DOCX.
- **Semantic matching engine** — Sentence-BERT (`all-MiniLM-L6-v2`) embeddings + cosine similarity, going beyond keyword matching.
- **Explainable composite ranking** — weighted combination of semantic similarity (50%), skill overlap (30%), experience fit (15%), education fit (5%), plus a natural-language insight per candidate.
- **Role-based dashboards** — separate Candidate, Recruiter, and Admin experiences with JWT auth + RBAC.
- **Analytics** — top-skills chart, match-score distribution, overview KPIs.
- **CSV export** of ranked candidate lists for offline recruiter review.

## License
Built as an academic final-year project. Free to use and extend for educational purposes.
