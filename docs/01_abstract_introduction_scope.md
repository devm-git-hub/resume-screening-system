# 01. Abstract, Introduction, Problem Statement, Objectives & Scope

## Abstract

Recruitment today is bottlenecked at its very first step: screening resumes. A single job opening can attract hundreds of applications, and traditional Applicant Tracking Systems (ATS) filter these using rigid keyword matching, which routinely rejects qualified candidates who describe their skills in different words than the job description uses, and just as easily lets under-qualified candidates through if they "keyword-stuff" their resume.

This project, **AI-Powered Automated Resume Screening and Job Matching System**, addresses this gap using Natural Language Processing (NLP) and Machine Learning. The system parses resumes (PDF/DOCX) using NLP techniques — Named Entity Recognition (NER), section segmentation, and dictionary-based skill extraction — to convert unstructured resume text into structured candidate profiles (skills, education, experience). It then compares each resume against a job description using **Sentence-BERT (SBERT)** sentence embeddings and cosine similarity, capturing *semantic* meaning rather than exact keyword overlap. A weighted composite score — combining semantic similarity, skill overlap, experience fit, and education fit — ranks candidates for each job posting, and each candidate is given a human-readable, AI-generated explanation of their score to preserve transparency and reduce black-box bias.

The system is built as a three-tier architecture: a React.js frontend, a Node.js/Express REST API backend, and a Python FastAPI microservice dedicated to NLP/ML inference, with MongoDB as the persistence layer. This separation lets the ML component be scaled, retrained, or swapped independently of the core application logic — a pattern used in real-world production ML systems.

## Introduction

Recruitment (talent acquisition) is one of the most resource-intensive processes within any organization. Recruiters manually review large volumes of resumes for every open position, a process that is slow, inconsistent between reviewers, and susceptible to unconscious bias. Meanwhile, candidates whose resumes are phrased differently from the job posting — even if they possess the exact skills required — are frequently filtered out by keyword-based ATS software before a human ever sees their application.

Recent advances in NLP, particularly transformer-based sentence embedding models such as BERT and its derivatives (SBERT), make it possible to computationally represent the *meaning* of a sentence or document as a dense vector, and compare two such vectors for semantic similarity — not just literal word overlap. This project applies that technology directly to the resume-screening problem, alongside classical NLP (NER, rule-based extraction) for structured field extraction, and a transparent, tunable, weighted ranking formula for combining semantic and structured signals into one match score.

## Problem Statement

> Manual resume screening is slow, inconsistent, and biased toward exact keyword matches, causing recruiters to overlook qualified candidates and spend excessive time on repetitive, low-value screening work — while candidates receive no visibility into why they were rejected or how well they actually fit a role.

Specifically, existing systems suffer from:
1. **Keyword rigidity** — "JS" vs "JavaScript" vs "Javascript developer" are treated as unrelated by naive keyword matchers.
2. **No semantic understanding** — a candidate describing "built RESTful services with Node.js" is not recognized as relevant to a JD asking for "backend API development experience."
3. **Manual, non-scalable ranking** — recruiters must read every resume linearly; there's no principled, explainable ranking mechanism.
4. **Bias risk** — human screening is subject to unconscious bias (name, university prestige, gaps in employment) which a well-designed algorithmic layer can help standardize, *provided it is transparent and auditable*.
5. **No candidate-facing insight** — candidates rarely learn *why* they matched or didn't match a role.

## Objectives

1. Automatically extract structured data (name, contact info, skills, education, experience) from unstructured resume files (PDF/DOCX) using NLP.
2. Represent both resumes and job descriptions as dense semantic vectors using Sentence-BERT, enabling meaning-based comparison rather than keyword matching.
3. Compute a composite, explainable match score per candidate per job by combining semantic similarity with structured skill/experience/education overlap.
4. Rank and present candidates to recruiters in order of suitability, with supporting evidence (matched/missing skills, AI-generated insight).
5. Provide separate, role-appropriate dashboards for candidates (resume upload, match visibility) and recruiters (job posting, candidate ranking, analytics).
6. Reduce recruiter time-to-shortlist and improve consistency and fairness of the initial screening stage.
7. Build the system with production-grade practices: JWT authentication, RBAC, input validation, rate limiting, and a modular, independently-scalable ML microservice.

## Scope

**In scope:**
- Resume upload and parsing for PDF and DOCX formats.
- English-language resumes and job descriptions (model choice can be swapped for multilingual SBERT variants).
- Skill/education/experience extraction via a hybrid rule-based + NLP approach.
- Semantic similarity-based matching and explainable, weighted candidate ranking.
- Recruiter and Candidate dashboards, search/filter, analytics, and CSV export of rankings.
- JWT-based authentication with role-based access control (candidate / recruiter / admin).

**Out of scope (documented as future enhancements):**
- Video/audio interview analysis.
- Multilingual resume parsing beyond what the underlying SBERT model natively supports.
- Deep bias-auditing tooling (e.g., formal fairness metrics across demographic proxies) — the current system focuses on *transparency* (showing why a score was given) rather than formal fairness certification.
- Integration with third-party job boards / applicant tracking systems (LinkedIn, Naukri, etc.).
- Real-time collaborative recruiter workflows (multi-recruiter shared pipelines, interview scheduling).
