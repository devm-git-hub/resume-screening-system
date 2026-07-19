# 08. API Documentation

Base URL (local): `http://localhost:5000/api`
All protected routes require header: `Authorization: Bearer <accessToken>`

## Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as candidate or recruiter. Body: `{name, email, password, role, companyName?}` |
| POST | `/auth/login` | Public | Login. Body: `{email, password}`. Returns `{user, accessToken, refreshToken}` |
| POST | `/auth/refresh` | Public | Exchange a valid refresh token for a new access token. Body: `{refreshToken}` |
| GET | `/auth/me` | Private | Returns the logged-in user's profile |

## Resumes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/resumes/upload` | Candidate | Multipart upload (`resume` field, PDF/DOCX ≤5MB). Triggers ML parsing pipeline |
| GET | `/resumes/mine` | Candidate | List the logged-in candidate's resumes |
| GET | `/resumes/:id` | Private | Get one resume with parsed data |
| DELETE | `/resumes/:id` | Candidate (owner) | Deletes a resume and its file from disk |

## Jobs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/jobs` | Recruiter | Create a job posting. Body: `{title, description, requiredSkills[], minExperienceYears, location, employmentType, salaryRange}` |
| GET | `/jobs` | Public | List jobs. Query: `search, location, employmentType, page, limit` |
| GET | `/jobs/:id` | Public | Get single job details |
| PUT | `/jobs/:id` | Recruiter (owner) | Update a job posting |
| DELETE | `/jobs/:id` | Recruiter / Admin | Delete a job posting |

## Matching
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/matches/run/:jobId` | Recruiter | Runs/refreshes AI matching for all parsed resumes against the given job |
| GET | `/matches/job/:jobId` | Recruiter | Get ranked candidates for a job. Query: `page, limit, minScore` |
| GET | `/matches/candidate/:candidateId` | Private | Get all job matches for a specific candidate |

## Candidates
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/candidates` | Recruiter / Admin | Search/filter candidates. Query: `skills, minExperience, search, page, limit` |
| GET | `/candidates/:id` | Private | Get one candidate's full profile |
| PUT | `/candidates/me` | Candidate | Update the logged-in candidate's own profile |

## Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/analytics/overview` | Recruiter / Admin | Total jobs, candidates, resumes, applications, average match score |
| GET | `/analytics/top-skills` | Recruiter / Admin | Top 15 most common skills across candidates |
| GET | `/analytics/match-distribution/:jobId` | Recruiter / Admin | Histogram buckets of match scores for a job |

## ML Microservice (internal, called by backend — not exposed to frontend directly)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/parse-resume` | Multipart file upload → returns structured parsed resume JSON |
| POST | `/embed-text` | `{text}` → returns SBERT embedding vector |
| POST | `/match-candidates` | `{job_description, required_skills, min_experience_years, candidates[]}` → returns per-candidate sub-scores + insight |

## Sample Request/Response

**POST /api/auth/register**
```json
// Request
{
  "name": "Aditi Sharma",
  "email": "aditi@example.com",
  "password": "SecurePass123",
  "role": "candidate"
}

// Response 201
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "_id": "...", "name": "Aditi Sharma", "email": "aditi@example.com", "role": "candidate" },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**GET /api/matches/job/:jobId**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "finalMatchPercentage": 87.4,
      "semanticSimilarity": 0.81,
      "skillMatchScore": 1.0,
      "matchedSkills": ["react", "node.js", "mongodb"],
      "missingSkills": ["docker"],
      "insights": "Matches 3 required skill(s): react, node.js, mongodb; missing 1 skill(s): docker; strong contextual/semantic fit with the job description; meets the experience requirement.",
      "rank": 1,
      "candidate": { "user": { "name": "Aditi Sharma", "email": "aditi@example.com" } }
    }
  ],
  "pagination": { "total": 24, "page": 1, "pages": 3 }
}
```
