# 04. System Architecture, High-Level & Low-Level Design

## 1. System Architecture (Three-Tier + ML Microservice)

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        A[React.js SPA<br/>Vite + Tailwind + Redux Toolkit]
    end

    subgraph Backend["Application Layer - Node.js/Express"]
        B[Auth Controller<br/>JWT + bcrypt]
        C[Resume Controller]
        D[Job Controller]
        E[Match Controller]
        F[Candidate Controller]
        G[Analytics Controller]
    end

    subgraph ML["ML Microservice - Python/FastAPI"]
        H[Text Extraction<br/>pdfplumber / python-docx]
        I[NLP Parser<br/>spaCy NER]
        J[SBERT Embeddings]
        K[Ranking Engine<br/>Cosine Similarity + Weighted Score]
    end

    subgraph Data["Data Layer"]
        L[(MongoDB<br/>Users, Resumes, Jobs,<br/>Applications, MatchScores)]
        M[(File Storage<br/>Uploaded Resumes)]
    end

    A -->|REST/JSON + JWT| B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G

    C -->|multipart file| H
    E -->|resume text + JD| J
    H --> I --> J --> K

    B --> L
    C --> L
    C --> M
    D --> L
    E --> L
    F --> L
    G --> L
```

## 2. High-Level Design (HLD)

```mermaid
flowchart LR
    subgraph Actors
        Cand[Candidate]
        Rec[Recruiter]
        Adm[Admin]
    end

    subgraph Modules
        M1[Auth Module]
        M2[Resume Management]
        M3[Job Management]
        M4[Matching Engine]
        M5[Candidate Search]
        M6[Analytics]
    end

    Cand --> M1
    Cand --> M2
    Rec --> M1
    Rec --> M3
    Rec --> M4
    Rec --> M5
    Rec --> M6
    Adm --> M1
    Adm --> M5
    Adm --> M6

    M2 -->|parsed resume data| M4
    M3 -->|job description| M4
    M4 -->|match scores| M5
    M4 -->|aggregated stats| M6
```

## 3. Low-Level Design (LLD) — Matching Pipeline Sequence

```mermaid
flowchart TD
    Start([Recruiter clicks "Run AI Matching"]) --> A[POST /api/matches/run/:jobId]
    A --> B[Fetch Job by ID from MongoDB]
    B --> C[Fetch all parsed Resumes from MongoDB]
    C --> D[Build batch payload:<br/>JD text + required skills + min experience<br/>+ each resume's text/skills/experience/education]
    D --> E[POST /match-candidates to ML microservice]
    E --> F[ML: Encode JD with SBERT]
    F --> G[ML: Batch-encode all resume texts with SBERT]
    G --> H[ML: Cosine similarity JD vs each resume]
    H --> I[ML: Compute skill/experience/education sub-scores]
    I --> J[ML: Generate natural-language insight per candidate]
    J --> K[Return results array to Node backend]
    K --> L[Node: Apply composite weights, compute final_match_percentage]
    L --> M[Node: Sort descending, assign rank]
    M --> N[Node: Upsert MatchScore documents in MongoDB]
    N --> O[Return ranked list to frontend]
    O --> End([Recruiter Dashboard renders ranked candidates])
```

## 4. Folder Structure

```
resume-screening-system/
├── backend/                     # Node.js + Express REST API
│   ├── config/db.js
│   ├── models/                  # Mongoose schemas (7 collections)
│   ├── controllers/             # Business logic per resource
│   ├── routes/                  # Express routers
│   ├── middleware/               # auth, error handling, file upload
│   ├── utils/generateToken.js
│   ├── server.js
│   └── package.json
│
├── ml-service/                  # Python + FastAPI NLP/ML microservice
│   ├── app/
│   │   ├── text_extraction.py
│   │   ├── resume_parser.py
│   │   ├── embeddings.py
│   │   ├── ranking.py
│   │   ├── skills_db.py
│   │   └── schemas.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/                    # React.js + Vite + Tailwind + Redux Toolkit
│   ├── src/
│   │   ├── pages/                (Login, Register, Dashboards, Upload, Analytics...)
│   │   ├── components/           (Navbar, Sidebar, DashboardCard, DataTable...)
│   │   ├── layouts/DashboardLayout.jsx
│   │   ├── redux/{store.js, slices/}
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── docs/                        # This documentation set
```
