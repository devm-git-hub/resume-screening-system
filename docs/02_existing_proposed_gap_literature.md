# 02. Existing System, Proposed System, Gap Identification & Literature Survey

## Existing System

Most currently deployed Applicant Tracking Systems (ATS) — and many academic prototypes — rely on one or more of the following approaches:

1. **Keyword/Boolean matching**: The JD and resume are reduced to keyword sets; a match score is the count/percentage of overlapping keywords. Fast but linguistically naive.
2. **TF-IDF + cosine similarity**: An improvement over pure keyword counting — it weighs terms by corpus-wide rarity — but is still a *bag-of-words* method with no understanding of word order, synonymy, or context. "Managed a team" and "team management experience" score low similarity under TF-IDF despite meaning the same thing.
3. **Manual recruiter screening**: The de facto standard at most companies for anything beyond an initial keyword filter. Effective at nuanced judgment but does not scale, is inconsistent across reviewers, and is the slowest stage in the hiring funnel.
4. **Rule-based resume parsers**: Many commercial parsers (Sovren, RChilli, Affinda) use hand-built regex/grammar rules for field extraction; they are accurate for `field extraction` but do not attempt semantic job-fit scoring at all — matching is left entirely to the ATS's keyword layer.

## Proposed System

The proposed system replaces the keyword/TF-IDF matching layer with **transformer-based semantic embeddings (Sentence-BERT)**, while keeping and refining the structured-extraction layer (NER + rule-based parsing) that traditional parsers rely on. Concretely, it proposes:

- A **hybrid resume parser**: spaCy NER for entities (person names, organizations, dates) combined with section-based regex/heuristic parsing for skills, education, and experience — more robust than pure regex, more field-accurate than pure NER.
- A **semantic matching engine**: SBERT encodes the full resume text and the job description into 384-dimensional vectors; cosine similarity between them captures contextual/semantic relatedness, not just literal token overlap.
- A **transparent composite scoring formula**: rather than a single opaque "AI score," the final match percentage is a weighted sum of four interpretable sub-scores (semantic similarity, skill overlap, experience fit, education fit), and each candidate additionally receives a short natural-language explanation of their score.
- **Separation of concerns via microservices**: the ML/NLP workload (CPU/GPU-intensive, Python-native) is isolated from the transactional backend (Node.js/Express), so each can be scaled, monitored, and iterated on independently — matching real-world MLOps practice.

## Gap Identification

| Gap in Existing Systems | How the Proposed System Addresses It |
|---|---|
| Keyword-only matching misses semantically equivalent phrasing | SBERT cosine similarity captures contextual meaning |
| No explainability behind a match score | Weighted sub-scores + AI-generated natural-language insight per candidate |
| Parsing and matching are usually separate, disconnected tools | End-to-end pipeline: upload → parse → embed → match → rank, in one system |
| Static/binary keyword scores don't reflect degrees of experience fit | Experience-match sub-score scales proportionally to years of experience vs. requirement |
| Recruiters get no visibility into *why* the algorithm ranked candidates a certain way | Insight field is surfaced directly in the Recruiter Dashboard UI |
| ML inference logic tightly coupled to application backend, hard to scale/replace | Independent FastAPI ML microservice behind a versioned internal API |

## Literature Survey

A brief survey of the techniques underpinning this project (approaches are summarized in Claude's own words below; specific papers/tools referenced by name for attribution):

- **TF-IDF and cosine similarity** for document matching is a long-standing baseline in information retrieval; it remains fast and interpretable but cannot capture synonymy or word-order-dependent meaning, which motivates moving to embedding-based methods for resume-JD matching.
- **Word2Vec / GloVe** word embeddings improved on bag-of-words by giving individual words dense vector representations capturing some semantic relationships, but they still average poorly over full sentences/documents and don't account for context (the same word gets the same vector regardless of surrounding text).
- **BERT** (Bidirectional Encoder Representations from Transformers) introduced contextual embeddings — the same word gets a different vector depending on its sentence context — dramatically improving NLP task performance, but raw BERT is computationally expensive to use for pairwise sentence-similarity search across many documents (it needs a forward pass per pair).
- **Sentence-BERT (SBERT)**, introduced by Reimers & Gurevych, fine-tunes BERT-style models specifically to produce sentence-level embeddings such that cosine similarity between two independently-computed embeddings approximates semantic similarity — enabling efficient, pre-computable embeddings for large-scale semantic search, which is exactly the resume-vs-JD matching use case this project needs.
- **spaCy** is an industrial-strength NLP library commonly used in production resume-parsing systems for tokenization, part-of-speech tagging, and Named Entity Recognition (identifying PERSON, ORG, DATE entities), which this project uses as the entity-extraction backbone.
- **Existing commercial resume parsers** (e.g., RChilli, Affinda, Sovren, HireAbility) focus primarily on structured field extraction and typically integrate with a separate ATS keyword-matching layer rather than performing semantic job-fit scoring themselves — this is the specific gap this project's SBERT-based matching layer targets.
- **Academic work on AI-based résumé screening** generally converges on a hybrid approach — combining embedding-based semantic similarity with structured skill/experience checks — rather than relying on embeddings alone, since pure semantic similarity can be fooled by well-written-but-irrelevant resumes; this project's weighted composite score follows that same hybrid principle.
