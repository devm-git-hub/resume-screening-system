# 10. Deployment Guide

This system deploys as three independent services. A common, low-cost setup:

- **Frontend** → Vercel (static React build)
- **Backend (Node/Express)** → Render (Web Service)
- **ML Service (FastAPI)** → Render (Web Service, Python environment)
- **Database** → MongoDB Atlas (managed, free tier available)

## 1. MongoDB Atlas Setup
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Create a database user and whitelist `0.0.0.0/0` (or Render's static IPs) under Network Access.
3. Copy the connection string — this becomes `MONGO_URI`.

## 2. Deploying the ML Service (Render)
1. Push `ml-service/` to a GitHub repo (or a subfolder of the monorepo).
2. On Render: **New → Web Service** → connect the repo, set **Root Directory** to `ml-service`.
3. Build command:
   ```bash
   pip install -r requirements.txt && python -m spacy download en_core_web_sm
   ```
4. Start command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Set environment variables from `.env.example`.
6. Note the deployed URL, e.g. `https://resume-ml-service.onrender.com`.

## 3. Deploying the Backend (Render)
1. **New → Web Service** → Root Directory: `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment variables (from `.env.example`):
   - `MONGO_URI` → Atlas connection string
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` → strong random strings
   - `ML_SERVICE_URL` → the ML service's Render URL from Step 2
   - `CLIENT_URL` → the frontend's Vercel URL (for CORS)
5. Render provides persistent disk only on paid tiers — for production file storage, replace local `multer` disk storage with an S3-compatible bucket (e.g., AWS S3, Cloudflare R2) for durability across deploys/restarts.

## 4. Deploying the Frontend (Vercel)
1. Import the repo into Vercel, set **Root Directory** to `frontend`.
2. Framework preset: Vite.
3. Environment variable: `VITE_API_BASE_URL=https://<your-backend>.onrender.com/api`
4. Deploy. Vercel auto-builds with `npm run build` and serves the `dist/` output.

## 5. Post-Deployment Checklist
- [ ] Update backend CORS `CLIENT_URL` to the final Vercel domain.
- [ ] Confirm `/health` returns 200 on both backend and ML service.
- [ ] Test full flow: register → upload resume → post job → run matching → view ranked candidates.
- [ ] Rotate JWT secrets away from any values used during local development.
- [ ] Enable MongoDB Atlas backups (even on free tier, enable point-in-time where available).

## Local Development (Docker-free quick start)

```bash
# Terminal 1 — ML Service
cd ml-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets
npm run dev

# Terminal 3 — Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`, ML service at `http://localhost:8000`.
