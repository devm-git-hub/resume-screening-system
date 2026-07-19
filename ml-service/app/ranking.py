"""
app/ranking.py

Candidate ranking algorithm.

For each (resume, job) pair we compute FOUR sub-scores, each normalized
to [0, 1]:

  1. semantic_similarity   - SBERT cosine similarity between full resume
                              text and the job description (captures
                              contextual/semantic fit beyond keywords)
  2. skill_match_score     - Jaccard-style overlap between candidate
                              skills and job's required_skills
  3. experience_match_score- how the candidate's total experience compares
                              to the job's minimum required experience
  4. education_match_score - whether candidate holds at least one
                              qualifying degree (simple presence check;
                              can be extended with degree-level ranking)

These sub-scores are combined by the caller (Node.js matchController)
using configurable weights, keeping "business policy" (how much weight
recruiters give to skills vs. semantic fit) outside the ML service so
it can be tuned without redeploying models.

This module ALSO exposes `rank_candidates`, a convenience function that
does the full pipeline end-to-end and returns candidates pre-sorted —
used by the /match-candidates endpoint.
"""

from app.embeddings import get_embedding, get_embeddings_batch, compute_cosine_similarity
from app.resume_parser import generate_summary


def compute_skill_match(candidate_skills: list, required_skills: list) -> tuple:
    """Returns (score, matched_skills, missing_skills)."""
    if not required_skills:
        return 1.0, [], []  # no explicit requirement => don't penalize

    candidate_set = set(s.lower() for s in candidate_skills or [])
    required_set = set(s.lower() for s in required_skills)

    matched = sorted(candidate_set & required_set)
    missing = sorted(required_set - candidate_set)

    score = len(matched) / len(required_set) if required_set else 1.0
    return round(score, 4), matched, missing


def compute_experience_match(candidate_years: float, min_years_required: float) -> float:
    """Returns 1.0 if candidate meets/exceeds requirement; otherwise a
    proportional partial score. Slight bonus cap avoids over-rewarding
    wildly overqualified candidates relative to under-qualified ones."""
    if min_years_required <= 0:
        return 1.0
    if candidate_years >= min_years_required:
        return 1.0
    if candidate_years <= 0:
        return 0.0
    return round(candidate_years / min_years_required, 4)


def compute_education_match(education_entries: list) -> float:
    """Simple presence check: does the candidate have at least one listed
    degree? (1.0 if yes, 0.5 if unclear/missing structured data, 0.0 if
    explicitly empty). Kept intentionally simple/transparent to avoid
    embedding bias against non-traditional-education candidates — this
    sub-score is weighted low (5%) in the final composite score."""
    if education_entries and len(education_entries) > 0:
        return 1.0
    return 0.5


def generate_insight(matched_skills, missing_skills, semantic_similarity, experience_score) -> str:
    """Short human-readable explanation of WHY a candidate got their score
    — improves recruiter trust and helps reduce black-box bias concerns."""
    parts = []
    if matched_skills:
        parts.append(f"Matches {len(matched_skills)} required skill(s): {', '.join(matched_skills[:5])}")
    if missing_skills:
        parts.append(f"missing {len(missing_skills)} skill(s): {', '.join(missing_skills[:5])}")
    if semantic_similarity >= 0.7:
        parts.append("strong contextual/semantic fit with the job description")
    elif semantic_similarity >= 0.4:
        parts.append("moderate contextual fit with the job description")
    else:
        parts.append("limited contextual overlap with the job description")
    if experience_score >= 1.0:
        parts.append("meets the experience requirement")
    elif experience_score > 0:
        parts.append("partially meets the experience requirement")
    else:
        parts.append("does not meet the minimum experience requirement")

    return "; ".join(parts).capitalize() + "."


def rank_candidates(job_description: str, required_skills: list, min_experience_years: float, candidates: list) -> list:
    """
    candidates: list of dicts, each:
      { resume_id, resume_text, skills, total_experience_years, education }

    Returns list of dicts (NOT yet sorted by caller — caller/Node side
    re-sorts, but we sort here too for direct API consumers):
      { resume_id, semantic_similarity, skill_match_score,
        experience_match_score, education_match_score,
        matched_skills, missing_skills, insight }
    """
    resume_texts = [c.get("resume_text") or "" for c in candidates]
    similarities = []

    if resume_texts:
        job_vec = get_embedding(job_description)
        resume_vecs = get_embeddings_batch(resume_texts)
        similarities = [compute_cosine_similarity(job_vec, vec) for vec in resume_vecs]

    results = []
    for candidate, sim in zip(candidates, similarities):
        skill_score, matched, missing = compute_skill_match(candidate.get("skills"), required_skills)
        exp_score = compute_experience_match(candidate.get("total_experience_years", 0), min_experience_years)
        edu_score = compute_education_match(candidate.get("education"))
        insight = generate_insight(matched, missing, sim, exp_score)

        results.append({
            "resume_id": candidate["resume_id"],
            "semantic_similarity": round(sim, 4),
            "skill_match_score": skill_score,
            "experience_match_score": exp_score,
            "education_match_score": edu_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "insight": insight,
        })

    # Default equal-ish sort for direct consumers (Node re-applies its own weights)
    results.sort(
        key=lambda r: (0.5 * r["semantic_similarity"] + 0.3 * r["skill_match_score"] + 0.2 * r["experience_match_score"]),
        reverse=True,
    )
    return results
