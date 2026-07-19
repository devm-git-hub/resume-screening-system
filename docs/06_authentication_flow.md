# 06. Authentication Flow (Sequence Diagram)

## JWT-Based Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (React)
    participant B as Backend (Express API)
    participant DB as MongoDB

    U->>F: Enter email + password, click Login
    F->>B: POST /api/auth/login {email, password}
    B->>DB: User.findOne({email}).select('+password')
    DB-->>B: User document (hashed password)
    B->>B: bcrypt.compare(password, user.password)
    alt Invalid credentials
        B-->>F: 401 Unauthorized
        F-->>U: Show error toast
    else Valid credentials
        B->>B: generateAccessToken(user) [JWT, 7d expiry]
        B->>B: generateRefreshToken(user) [JWT, 30d expiry]
        B->>DB: user.lastLogin = now(); save()
        B-->>F: 200 OK {user, accessToken, refreshToken}
        F->>F: Store tokens in localStorage
        F-->>U: Redirect to role-based dashboard
    end

    Note over F,B: On every subsequent API call
    F->>B: Request with Authorization: Bearer <accessToken>
    B->>B: jwt.verify(accessToken, JWT_SECRET)
    alt Token valid
        B->>DB: User.findById(decoded.id)
        DB-->>B: Active user
        B-->>F: 200 OK (resource data)
    else Token expired
        B-->>F: 401 Token expired
        F->>B: POST /api/auth/refresh {refreshToken}
        B->>B: jwt.verify(refreshToken, JWT_REFRESH_SECRET)
        B-->>F: 200 OK {newAccessToken}
        F->>F: Retry original request with new token
    end
```

## Role-Based Access Control (RBAC)

Every protected route uses two middleware layers:

1. **`protect`** — verifies the JWT, loads the user from MongoDB, and rejects the request if the token is invalid/expired or the user is inactive.
2. **`authorize(...roles)`** — checks `req.user.role` against an allow-list; e.g., `authorize("recruiter")` on `POST /api/jobs` ensures only recruiter accounts can post jobs, while `authorize("recruiter", "admin")` on candidate search allows both roles.

Passwords are never stored in plaintext: `bcryptjs` hashes with a salt round of 12 in a Mongoose `pre('save')` hook, and the password field is `select: false` by default so it is never accidentally returned in a query unless explicitly requested (as during login).
