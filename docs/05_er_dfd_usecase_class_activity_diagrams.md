# 05. ER Diagram, Data Flow Diagram, Use Case, Class & Activity Diagrams

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o| CANDIDATE : "has profile"
    USER ||--o| RECRUITER : "has profile"
    CANDIDATE ||--o{ RESUME : uploads
    CANDIDATE ||--o{ APPLICATION : submits
    CANDIDATE ||--o{ MATCHSCORE : "scored for"
    RECRUITER ||--o{ JOB : posts
    JOB ||--o{ APPLICATION : receives
    JOB ||--o{ MATCHSCORE : "matched against"
    RESUME ||--o{ MATCHSCORE : "scored by"
    RESUME ||--o| APPLICATION : "attached to"

    USER {
        ObjectId _id
        string name
        string email
        string password
        string role
        boolean isActive
        date lastLogin
    }

    CANDIDATE {
        ObjectId _id
        ObjectId user FK
        string phone
        string location
        string headline
        number totalExperienceYears
        array skills
        array education
        array experience
        ObjectId activeResume FK
    }

    RECRUITER {
        ObjectId _id
        ObjectId user FK
        string companyName
        string designation
        string industry
    }

    RESUME {
        ObjectId _id
        ObjectId candidate FK
        string originalFileName
        string storagePath
        string fileType
        string rawText
        object parsedData
        string status
    }

    JOB {
        ObjectId _id
        ObjectId recruiter FK
        string title
        string description
        array requiredSkills
        number minExperienceYears
        string location
        string employmentType
        array embedding
        string status
    }

    APPLICATION {
        ObjectId _id
        ObjectId job FK
        ObjectId candidate FK
        ObjectId resume FK
        ObjectId matchScore FK
        string status
    }

    MATCHSCORE {
        ObjectId _id
        ObjectId resume FK
        ObjectId job FK
        ObjectId candidate FK
        number semanticSimilarity
        number skillMatchScore
        number experienceMatchScore
        number educationMatchScore
        number finalMatchPercentage
        array matchedSkills
        array missingSkills
        string insights
        number rank
    }
```

## 2. Data Flow Diagram (DFD) — Level 1

```mermaid
flowchart LR
    Candidate([Candidate]) -->|Uploads Resume| P1[1.0 Resume Upload & Parsing]
    P1 -->|Structured Resume Data| D1[(Resume Store)]
    P1 -->|Extracted Skills/Experience| D2[(Candidate Profile Store)]

    Recruiter([Recruiter]) -->|Posts Job Description| P2[2.0 Job Management]
    P2 -->|Job Record + Embedding| D3[(Job Store)]

    Recruiter -->|Triggers Matching| P3[3.0 Semantic Matching & Ranking]
    D1 --> P3
    D3 --> P3
    P3 -->|Match Scores + Ranks| D4[(MatchScore Store)]
    D4 -->|Ranked Candidates| Recruiter

    Candidate -->|Views| P4[4.0 Candidate Dashboard]
    D4 --> P4
    P4 -->|Match Results & Insights| Candidate

    Recruiter -->|Views| P5[5.0 Analytics & Reporting]
    D1 --> P5
    D3 --> P5
    D4 --> P5
    P5 -->|Dashboards, Charts, CSV Export| Recruiter
```

## 3. Use Case Diagram

```mermaid
flowchart TB
    Candidate([Candidate])
    Recruiter([Recruiter])
    Admin([Admin])

    subgraph System["AI Resume Screening System"]
        UC1((Register / Login))
        UC2((Upload Resume))
        UC3((View My Resumes))
        UC4((View Job Matches))
        UC5((Post Job))
        UC6((Run AI Matching))
        UC7((View Ranked Candidates))
        UC8((Search / Filter Candidates))
        UC9((Export Report))
        UC10((View Analytics))
        UC11((Manage Users / System))
    end

    Candidate --> UC1
    Candidate --> UC2
    Candidate --> UC3
    Candidate --> UC4

    Recruiter --> UC1
    Recruiter --> UC5
    Recruiter --> UC6
    Recruiter --> UC7
    Recruiter --> UC8
    Recruiter --> UC9
    Recruiter --> UC10

    Admin --> UC1
    Admin --> UC8
    Admin --> UC10
    Admin --> UC11
```

## 4. Class Diagram (Core Domain Model)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        -String password
        +String role
        +comparePassword(candidate) Boolean
        +toSafeObject() Object
    }

    class Candidate {
        +ObjectId user
        +String phone
        +Number totalExperienceYears
        +String[] skills
        +Object[] education
        +Object[] experience
        +ObjectId activeResume
    }

    class Recruiter {
        +ObjectId user
        +String companyName
        +ObjectId[] postedJobs
    }

    class Resume {
        +ObjectId candidate
        +String originalFileName
        +String status
        +Object parsedData
        +parseWithMLService() Promise
    }

    class Job {
        +ObjectId recruiter
        +String title
        +String description
        +String[] requiredSkills
        +Number minExperienceYears
        +Number[] embedding
    }

    class MatchScore {
        +ObjectId resume
        +ObjectId job
        +Number semanticSimilarity
        +Number skillMatchScore
        +Number finalMatchPercentage
        +String[] matchedSkills
        +Number rank
    }

    class MatchingEngine {
        +computeSemanticSimilarity(text1, text2) Number
        +computeSkillMatch(candidateSkills, requiredSkills) Object
        +computeExperienceMatch(years, minYears) Number
        +rankCandidates(job, candidates) MatchScore[]
    }

    User "1" --> "0..1" Candidate
    User "1" --> "0..1" Recruiter
    Candidate "1" --> "*" Resume
    Recruiter "1" --> "*" Job
    Resume "1" --> "*" MatchScore
    Job "1" --> "*" MatchScore
    MatchingEngine ..> MatchScore : creates
```

## 5. Activity Diagram — End-to-End Matching Flow

```mermaid
flowchart TD
    Start([Start]) --> A[Candidate registers & logs in]
    A --> B[Candidate uploads resume]
    B --> C{File valid PDF/DOCX?}
    C -->|No| B
    C -->|Yes| D[ML Service extracts text & parses NLP fields]
    D --> E[Structured resume data saved to MongoDB]
    E --> F[Recruiter registers & logs in]
    F --> G[Recruiter posts job description]
    G --> H[Recruiter clicks 'Run AI Matching']
    H --> I[Backend sends JD + resumes batch to ML service]
    I --> J[ML computes SBERT similarity + sub-scores]
    J --> K[Backend computes weighted final score & ranks]
    K --> L[MatchScore documents saved/updated]
    L --> M[Recruiter views ranked candidate list]
    M --> N{Recruiter satisfied?}
    N -->|No, refine JD| G
    N -->|Yes| O[Recruiter shortlists / exports report]
    O --> End([End])
```
