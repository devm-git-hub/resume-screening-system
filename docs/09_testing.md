# 09. Testing

## Testing Strategy

| Level | Scope | Tools |
|---|---|---|
| Unit Testing | Individual functions: skill matching, experience scoring, JWT generation, resume section parsing | Jest (Node), Pytest (Python) |
| Integration Testing | API endpoints end-to-end (auth → upload → parse → match) | Supertest + Jest, Pytest + FastAPI TestClient |
| System Testing | Full user flows through the UI (register → upload resume → recruiter posts job → runs matching → views ranked list) | Manual + Cypress (optional, future enhancement) |
| ML Model Validation | Precision of skill extraction, cosine similarity sanity checks on known similar/dissimilar text pairs | Pytest with fixture resumes/JDs |

## Sample Backend Test Cases (Jest + Supertest)

```javascript
// backend/__tests__/auth.test.js
const request = require("supertest");
const app = require("../server");

describe("POST /api/auth/register", () => {
  it("registers a new candidate successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@example.com", password: "password123", role: "candidate",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects duplicate email registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@example.com", password: "password123", role: "candidate",
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com", password: "wrongpass",
    });
    expect(res.statusCode).toBe(401);
  });
});
```

```javascript
// backend/__tests__/resume.test.js
describe("POST /api/resumes/upload", () => {
  it("rejects upload without auth token", async () => {
    const res = await request(app).post("/api/resumes/upload");
    expect(res.statusCode).toBe(401);
  });

  it("rejects non-PDF/DOCX file types", async () => {
    const res = await request(app)
      .post("/api/resumes/upload")
      .set("Authorization", `Bearer ${candidateToken}`)
      .attach("resume", Buffer.from("dummy"), "resume.txt");
    expect(res.statusCode).toBe(400);
  });
});
```

## Sample ML Service Test Cases (Pytest)

```python
# ml-service/tests/test_ranking.py
from app.ranking import compute_skill_match, compute_experience_match

def test_skill_match_full_overlap():
    score, matched, missing = compute_skill_match(
        ["python", "react", "mongodb"], ["python", "react"]
    )
    assert score == 1.0
    assert missing == []

def test_skill_match_partial_overlap():
    score, matched, missing = compute_skill_match(["python"], ["python", "react"])
    assert score == 0.5
    assert "react" in missing

def test_experience_match_meets_requirement():
    assert compute_experience_match(5, 3) == 1.0

def test_experience_match_under_requirement():
    assert round(compute_experience_match(1, 4), 2) == 0.25
```

```python
# ml-service/tests/test_embeddings.py
from app.embeddings import get_embedding, compute_cosine_similarity

def test_similar_sentences_score_high():
    v1 = get_embedding("Experienced backend developer skilled in Node.js and REST APIs")
    v2 = get_embedding("Looking for a backend engineer with Node.js and API development experience")
    sim = compute_cosine_similarity(v1, v2)
    assert sim > 0.5

def test_dissimilar_sentences_score_low():
    v1 = get_embedding("Experienced backend developer skilled in Node.js")
    v2 = get_embedding("Award-winning pastry chef specializing in French desserts")
    sim = compute_cosine_similarity(v1, v2)
    assert sim < 0.4
```

## Test Case Summary Table

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-01 | Register with valid data | 201, tokens returned | Pass |
| TC-02 | Register with duplicate email | 400, error message | Pass |
| TC-03 | Login with correct credentials | 200, tokens returned | Pass |
| TC-04 | Login with incorrect password | 401 | Pass |
| TC-05 | Upload PDF resume as candidate | 201, status "parsed" after ML call | Pass |
| TC-06 | Upload .txt file | 400, rejected by multer filter | Pass |
| TC-07 | Access recruiter-only route as candidate | 403 Forbidden | Pass |
| TC-08 | Run matching for job with parsed resumes | MatchScore docs created, sorted by score | Pass |
| TC-09 | Semantically related resume/JD pair | Cosine similarity > 0.5 | Pass |
| TC-10 | Unrelated resume/JD pair | Cosine similarity < 0.4 | Pass |
| TC-11 | Skill overlap computation | Correct matched/missing sets | Pass |
| TC-12 | JWT expiry → refresh flow | New access token issued via refresh endpoint | Pass |

## Running the Tests

```bash
# Backend
cd backend
npm test

# ML Service
cd ml-service
pytest -v
```
