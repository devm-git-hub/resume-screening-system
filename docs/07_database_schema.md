# 07. Database Schema (MongoDB Collections)

Database: `resume_screening_db` (MongoDB, accessed via Mongoose ODM)

## 1. `users`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | required, bcrypt-hashed, `select:false` |
| role | String | enum: candidate / recruiter / admin |
| isActive | Boolean | default true |
| lastLogin | Date | |
| refreshTokenHash | String | `select:false` |
| createdAt / updatedAt | Date | timestamps |

## 2. `recruiters`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| user | ObjectId | FK → users, unique |
| companyName | String | required |
| designation | String | |
| companyWebsite | String | |
| industry | String | |
| postedJobs | [ObjectId] | FK → jobs |

## 3. `candidates`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| user | ObjectId | FK → users, unique |
| phone | String | |
| location | String | |
| headline | String | |
| totalExperienceYears | Number | derived from parsed resume |
| skills | [String] | lowercase, derived from parsed resume |
| education | [{degree, institution, year}] | |
| experience | [{title, company, duration, description}] | |
| resumes | [ObjectId] | FK → resumes |
| activeResume | ObjectId | FK → resumes |

## 4. `resumes`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| candidate | ObjectId | FK → candidates, indexed |
| originalFileName | String | |
| storagePath | String | disk/cloud path |
| fileType | String | enum: pdf / docx |
| fileSizeKB | Number | |
| rawText | String | full extracted text |
| parsedData | {name, email, phone, skills[], education[], experience[], totalExperienceYears, summary} | ML-service output |
| status | String | enum: uploaded / processing / parsed / failed |
| parsingError | String | |

## 5. `jobs`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| recruiter | ObjectId | FK → recruiters |
| title | String | required, text-indexed |
| description | String | required, text-indexed |
| requiredSkills | [String] | lowercase |
| minExperienceYears | Number | default 0 |
| location | String | |
| employmentType | String | enum: full-time/part-time/internship/contract |
| salaryRange | {min, max} | |
| embedding | [Number] | SBERT vector, `select:false` |
| status | String | enum: open/closed/draft |
| applications | [ObjectId] | FK → applications |

## 6. `applications`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| job | ObjectId | FK → jobs |
| candidate | ObjectId | FK → candidates |
| resume | ObjectId | FK → resumes |
| matchScore | ObjectId | FK → matchscores |
| status | String | enum: applied/shortlisted/rejected/hired/withdrawn |
| recruiterNotes | String | |

Unique compound index: `{job: 1, candidate: 1}` — prevents duplicate applications.

## 7. `matchscores`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | PK |
| resume | ObjectId | FK → resumes |
| job | ObjectId | FK → jobs |
| candidate | ObjectId | FK → candidates |
| semanticSimilarity | Number | 0–1, raw SBERT cosine similarity |
| skillMatchScore | Number | 0–1 |
| experienceMatchScore | Number | 0–1 |
| educationMatchScore | Number | 0–1 |
| finalMatchPercentage | Number | 0–100, weighted composite |
| matchedSkills | [String] | |
| missingSkills | [String] | |
| insights | String | AI-generated explanation |
| rank | Number | rank within the job's candidate pool |

Indexes: `{job: 1, finalMatchPercentage: -1}` (fast ranked retrieval), unique `{resume: 1, job: 1}` (idempotent re-matching via upsert).

## Relationships Summary
- `User` 1—0..1 `Candidate` / `Recruiter` (role-specific profile extension pattern)
- `Candidate` 1—* `Resume`
- `Recruiter` 1—* `Job`
- `Resume` × `Job` → `MatchScore` (many-to-many via a scoring join collection)
- `Job` × `Candidate` → `Application` (many-to-many via an application join collection)
