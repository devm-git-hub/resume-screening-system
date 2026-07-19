"""app/schemas.py - Pydantic models for request/response validation."""

from typing import List, Optional
from pydantic import BaseModel


class EmbedTextRequest(BaseModel):
    text: str


class EmbedTextResponse(BaseModel):
    embedding: List[float]


class CandidateInput(BaseModel):
    resume_id: str
    resume_text: Optional[str] = ""
    skills: Optional[List[str]] = []
    total_experience_years: Optional[float] = 0
    education: Optional[List[dict]] = []


class MatchCandidatesRequest(BaseModel):
    job_description: str
    required_skills: Optional[List[str]] = []
    min_experience_years: Optional[float] = 0
    candidates: List[CandidateInput]


class MatchResult(BaseModel):
    resume_id: str
    semantic_similarity: float
    skill_match_score: float
    experience_match_score: float
    education_match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    insight: str


class MatchCandidatesResponse(BaseModel):
    results: List[MatchResult]


class EducationEntry(BaseModel):
    degree: str
    institution: str = ""
    year: str = ""


class ExperienceEntry(BaseModel):
    title: str
    company: str = ""
    duration: str = ""
    description: str = ""


class ParsedResumeResponse(BaseModel):
    raw_text: str
    name: str
    email: str
    phone: str
    skills: List[str]
    education: List[EducationEntry]
    experience: List[ExperienceEntry]
    total_experience_years: float
    summary: str
