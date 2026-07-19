# 03. Methodology & Algorithms

## Methodology Overview

The system follows a **hybrid rule-based + deep-learning NLP pipeline**, structured into five stages:

1. **Ingestion** — Candidate uploads a resume (PDF/DOCX) via the frontend; recruiter submits a job description.
2. **Text Extraction** — The ML microservice extracts raw text from the uploaded file (`pdfplumber`/`PyMuPDF` for PDF, `python-docx` for DOCX).
3. **NLP Parsing** — spaCy NER + section-based heuristics extract name, email, phone, skills, education, and experience into structured JSON.
4. **Semantic Embedding & Similarity** — SBERT (`all-MiniLM-L6-v2`) encodes both the resume text and the job description into 384-dimensional vectors; cosine similarity is computed between them.
5. **Composite Scoring & Ranking** — Semantic similarity is combined with skill/experience/education sub-scores using configurable weights into one final match percentage; candidates for a job are sorted descending by this score.

## Algorithm 1 — Resume Parsing

```
ALGORITHM ParseResume(file)
INPUT: file (PDF or DOCX resume)
OUTPUT: structured resume data {name, email, phone, skills, education, experience, summary}

1. raw_text ← ExtractText(file)         // pdfplumber / PyMuPDF / python-docx
2. raw_text ← CleanText(raw_text)        // normalize whitespace, strip control chars
3. doc ← spaCy_NLP(raw_text)              // tokenization, POS tagging, NER
4. sections ← SplitIntoSections(raw_text) // header, education, experience, skills, summary
5. name ← FirstPersonEntity(doc) OR FirstNonEmptyLine(raw_text)
6. email ← RegexMatch(EMAIL_PATTERN, raw_text)
7. phone ← RegexMatch(PHONE_PATTERN, raw_text)
8. skills ← DictionaryMatch(raw_text, TECH_SKILLS_TAXONOMY)   // word-boundary safe matching
9. education ← ParseEducationSection(sections.education)       // degree keyword + year regex
10. experience ← ParseExperienceSection(sections.experience, doc)  // ORG/DATE entities per block
11. total_experience_years ← EstimateExperienceYears(experience)   // sum of date-range deltas
12. summary ← GenerateSummary(name, skills, total_experience_years, experience)
13. RETURN {raw_text, name, email, phone, skills, education, experience,
            total_experience_years, summary}
```

## Algorithm 2 — Semantic Similarity Computation

```
ALGORITHM ComputeSemanticSimilarity(resume_text, job_description)
INPUT: resume_text (string), job_description (string)
OUTPUT: similarity ∈ [0, 1]

1. v_resume ← SBERT.encode(resume_text)      // 384-dim dense vector
2. v_job    ← SBERT.encode(job_description)  // 384-dim dense vector
3. similarity ← CosineSimilarity(v_resume, v_job)
                = (v_resume · v_job) / (‖v_resume‖ * ‖v_job‖)
4. similarity ← Clip(similarity, 0, 1)
5. RETURN similarity
```

## Algorithm 3 — Skill / Experience / Education Sub-Scores

```
ALGORITHM ComputeSkillMatch(candidate_skills, required_skills)
1. IF required_skills is empty: RETURN (1.0, [], [])
2. matched ← candidate_skills ∩ required_skills
3. missing ← required_skills − candidate_skills
4. score ← |matched| / |required_skills|
5. RETURN (score, matched, missing)

ALGORITHM ComputeExperienceMatch(candidate_years, min_years_required)
1. IF min_years_required ≤ 0: RETURN 1.0
2. IF candidate_years ≥ min_years_required: RETURN 1.0
3. IF candidate_years ≤ 0: RETURN 0.0
4. RETURN candidate_years / min_years_required     // partial credit, proportional

ALGORITHM ComputeEducationMatch(education_entries)
1. IF education_entries is non-empty: RETURN 1.0
2. ELSE: RETURN 0.5   // unknown/unstructured, not penalized heavily
```

## Algorithm 4 — Composite Ranking Algorithm

```
ALGORITHM RankCandidates(job, candidates[])
INPUT: job (with description, required_skills, min_experience_years),
       candidates[] (each with resume_text, skills, experience_years, education)
OUTPUT: candidates[] sorted descending by final_match_percentage

WEIGHTS = { semantic: 0.50, skills: 0.30, experience: 0.15, education: 0.05 }

1. FOR EACH candidate IN candidates:
2.     sem   ← ComputeSemanticSimilarity(candidate.resume_text, job.description)
3.     skl, matched, missing ← ComputeSkillMatch(candidate.skills, job.required_skills)
4.     exp   ← ComputeExperienceMatch(candidate.experience_years, job.min_experience_years)
5.     edu   ← ComputeEducationMatch(candidate.education)
6.     final ← (WEIGHTS.semantic * sem + WEIGHTS.skills * skl
                + WEIGHTS.experience * exp + WEIGHTS.education * edu) * 100
7.     candidate.scores ← {sem, skl, exp, edu, final, matched, missing}
8.     candidate.insight ← GenerateInsight(matched, missing, sem, exp)
9. SORT candidates DESCENDING BY candidate.scores.final
10. ASSIGN rank ← index + 1 for each candidate in sorted order
11. RETURN candidates
```

**Design rationale for the weights (50/30/15/5):** semantic similarity is weighted highest because it is the project's core differentiator over legacy keyword ATS tools and captures holistic contextual fit; skill overlap is weighted second because explicit required skills remain a strong, low-noise signal recruiters trust; experience and education are weighted lower and are designed to give *partial credit* rather than hard-filter candidates out, reducing the risk of unfairly excluding non-traditional candidates. These weights are exposed as a configuration constant in `matchController.js` and can be tuned per-deployment without touching the ML service.

## Complexity & Performance Notes

- SBERT encoding is O(1) model forward-pass per document; batching (`get_embeddings_batch`) amortizes overhead when scoring many resumes against one job description in a single request.
- Skill matching is O(k) per candidate (k = number of required skills) using set intersection.
- For N candidates and a job with the SBERT batch-encoding approach, total matching cost is dominated by one batched forward pass over N resumes rather than N separate calls — this is the key production-scaling decision.
