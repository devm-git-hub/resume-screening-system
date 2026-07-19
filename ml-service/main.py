"""
main.py - FastAPI ML microservice.

Endpoints:
  GET  /health                -> liveness check
  POST /parse-resume           -> upload PDF/DOCX, returns structured parsed data
  POST /embed-text              -> returns SBERT embedding vector for arbitrary text
  POST /match-candidates        -> batch semantic + skill/experience/education match & rank

This service is stateless and horizontally scalable — no DB connection
here; MongoDB persistence is owned entirely by the Node.js backend.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.text_extraction import extract_text
from app.resume_parser import parse_resume
from app.embeddings import get_embedding
from app.ranking import rank_candidates
from app.schemas import (
    EmbedTextRequest, EmbedTextResponse,
    MatchCandidatesRequest, MatchCandidatesResponse,
    ParsedResumeResponse,
)

app = FastAPI(
    title="Resume Screening ML Service",
    description="NLP & Semantic Matching microservice for AI-Powered Resume Screening System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to backend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "OK", "service": "ml-service"}


@app.post("/parse-resume", response_model=ParsedResumeResponse)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """Extracts text from the uploaded resume and runs the full NLP
    parsing pipeline (NER, skill/education/experience extraction)."""
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only .pdf and .docx files are supported")

    try:
        file_bytes = await file.read()
        raw_text = extract_text(file.filename, file_bytes)
        if not raw_text or len(raw_text.strip()) < 20:
            raise HTTPException(status_code=422, detail="Could not extract meaningful text from file")

        parsed = parse_resume(raw_text)
        return parsed
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")


@app.post("/embed-text", response_model=EmbedTextResponse)
def embed_text_endpoint(payload: EmbedTextRequest):
    """Returns the SBERT embedding vector for an arbitrary text
    (used by the backend to pre-cache job-description embeddings)."""
    vec = get_embedding(payload.text)
    return {"embedding": vec.tolist()}


@app.post("/match-candidates", response_model=MatchCandidatesResponse)
def match_candidates_endpoint(payload: MatchCandidatesRequest):
    """Core matching endpoint: given a job description + a batch of
    candidate resumes, returns semantic similarity, skill/experience/
    education sub-scores, and a natural-language insight per candidate."""
    try:
        results = rank_candidates(
            job_description=payload.job_description,
            required_skills=payload.required_skills,
            min_experience_years=payload.min_experience_years,
            candidates=[c.dict() for c in payload.candidates],
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
