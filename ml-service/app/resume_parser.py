"""
app/resume_parser.py

Core NLP resume-parsing logic:
  1. Named Entity Recognition (spaCy) -> candidate name, organizations, dates
  2. Regex-based contact extraction -> email, phone
  3. Dictionary + noun-phrase based skill extraction
  4. Section-based education & experience extraction
  5. A short extractive/heuristic AI-generated summary

This module is intentionally rule+ML hybrid: pure NER from a small
spaCy model is not reliable enough alone for resume fields like
"skills" or "years of experience", so we combine it with structured
section parsing, which is the standard industry approach for resume
parsers (as used by tools like Sovren, Affinda, RChilli).
"""

import re
from datetime import datetime
import spacy

from app.skills_db import TECH_SKILLS, DEGREE_KEYWORDS

# Load once at module import (shared across requests)
nlp = spacy.load("en_core_web_sm")

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?){2,4}\d{3,4}")

SECTION_HEADERS = {
    "education": ["education", "academic background", "qualifications"],
    "experience": ["experience", "work experience", "employment history", "professional experience"],
    "skills": ["skills", "technical skills", "core competencies", "key skills"],
    "summary": ["summary", "objective", "profile", "about me"],
}


def _split_into_sections(text: str) -> dict:
    """Split resume text into labeled sections based on common headers."""
    lines = text.split("\n")
    sections = {"header": []}
    current = "header"

    for line in lines:
        stripped = line.strip().lower().rstrip(":")
        matched_section = None
        for section, keywords in SECTION_HEADERS.items():
            if stripped in keywords or any(stripped == k for k in keywords):
                matched_section = section
                break
        if matched_section:
            current = matched_section
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items()}


def extract_email(text: str) -> str:
    match = EMAIL_REGEX.search(text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    match = PHONE_REGEX.search(text)
    return match.group(0).strip() if match else ""


def extract_name(text: str, doc) -> str:
    """Heuristic: the candidate's name is usually the first PERSON entity
    found near the top of the document, or simply the first non-empty line
    if NER doesn't find one (common on resumes with stylized headers)."""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text.strip()

    first_lines = [l.strip() for l in text.split("\n")[:5] if l.strip()]
    return first_lines[0] if first_lines else "Unknown"


def extract_skills(text: str) -> list:
    """Dictionary-based skill matching against TECH_SKILLS taxonomy,
    case-insensitive, with word-boundary matching to avoid partial hits
    (e.g. 'r' should not match inside 'server')."""
    text_lower = text.lower()
    found = set()
    for skill in TECH_SKILLS:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower):
            found.add(skill)
    return sorted(found)


def extract_education(section_text: str) -> list:
    """Parses the education section into structured degree/institution/year
    entries. Falls back gracefully on unstructured formats."""
    if not section_text:
        return []

    entries = []
    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    year_pattern = re.compile(r"(19|20)\d{2}")

    for line in lines:
        lower = line.lower()
        if any(k in lower for k in DEGREE_KEYWORDS):
            year_match = year_pattern.search(line)
            entries.append({
                "degree": line,
                "institution": "",  # left for manual/recruiter review; could be enhanced with ORG NER
                "year": year_match.group(0) if year_match else "",
            })

    return entries


def extract_experience(section_text: str, doc) -> list:
    """Parses the experience section using ORG entities (companies) and
    DATE entities (durations) as anchors, grouping surrounding text as
    the role description."""
    if not section_text:
        return []

    entries = []
    blocks = re.split(r"\n\s*\n", section_text)  # split on blank lines
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        block_doc = nlp(block[:1000])  # cap for performance
        orgs = [e.text for e in block_doc.ents if e.label_ == "ORG"]
        dates = [e.text for e in block_doc.ents if e.label_ == "DATE"]

        first_line = block.split("\n")[0]
        entries.append({
            "title": first_line[:120],
            "company": orgs[0] if orgs else "",
            "duration": dates[0] if dates else "",
            "description": block[:500],
        })

    return entries


def estimate_total_experience_years(experience_entries: list) -> float:
    """Very rough heuristic: sums explicit 'X years' mentions found in
    experience descriptions; production systems should parse date ranges
    (e.g. 'Jan 2019 - Mar 2022') and sum the deltas precisely."""
    total_months = 0
    year_range_pattern = re.compile(r"(19|20)\d{2}\s*[-–to]+\s*((19|20)\d{2}|present|current)", re.I)

    for entry in experience_entries:
        text = f"{entry.get('duration', '')} {entry.get('description', '')}"
        match = year_range_pattern.search(text)
        if match:
            start_year = int(re.search(r"(19|20)\d{2}", match.group(0)).group(0))
            end_str = match.group(2)
            end_year = datetime.now().year if end_str.lower() in ("present", "current") else int(end_str)
            months = max(0, (end_year - start_year) * 12)
            total_months += months

    return round(total_months / 12, 1)


def generate_summary(name: str, skills: list, experience_years: float, experience_entries: list) -> str:
    """A lightweight extractive/templated summary. For a richer
    abstractive summary, this call can be swapped for a HuggingFace
    summarization pipeline (e.g. facebook/bart-large-cnn) — left as a
    configurable option in embeddings.py to keep inference cost low
    for the default deployment."""
    top_skills = ", ".join(skills[:6]) if skills else "no clearly listed technical skills"
    latest_role = experience_entries[0]["title"] if experience_entries else None

    summary = f"{name} has approximately {experience_years} years of experience"
    if latest_role:
        summary += f", most recently as {latest_role}."
    else:
        summary += "."
    summary += f" Key skills include {top_skills}."
    return summary


def parse_resume(raw_text: str) -> dict:
    doc = nlp(raw_text[:100000])  # spaCy max length guard for very long docs
    sections = _split_into_sections(raw_text)

    name = extract_name(raw_text, doc)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)

    skills = extract_skills(raw_text)  # search whole doc, not just "skills" section
    education = extract_education(sections.get("education", ""))
    experience = extract_experience(sections.get("experience", ""), doc)
    total_experience_years = estimate_total_experience_years(experience)

    summary = generate_summary(name, skills, total_experience_years, experience)

    return {
        "raw_text": raw_text,
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "education": education,
        "experience": experience,
        "total_experience_years": total_experience_years,
        "summary": summary,
    }
