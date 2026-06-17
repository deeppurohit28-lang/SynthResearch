# ResearchOS

Agentic synthetic user research platform. 4-agent pipeline: Persona → Guide → Simulation → Synthesis.

## Repo structure

```
researchos/
├── backend/    ← FastAPI (Python) — done
└── frontend/   ← Next.js (TypeScript) — build here
```

## Backend

**Stack:** FastAPI + Anthropic Claude API + Supabase

**Run locally:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in your keys
uvicorn main:app --reload --port 8000
```

**Health check:** `GET http://localhost:8000/health`

**API base:** `http://localhost:8000/api`

## API endpoints (backend → frontend contract)

| Method | Path | What it does |
|--------|------|--------------|
| POST | `/api/run/create` | Submit intake form, get run_id + cost estimate |
| POST | `/api/run/{id}/personas` | Run Agent 1 — returns full persona array |
| POST | `/api/run/{id}/personas/regenerate` | Gate 1 — regenerate ONE persona card |
| POST | `/api/run/{id}/guide` | Run Agent 2 — returns interview guide |
| POST | `/api/run/{id}/guide/regenerate` | Gate 2 — regenerate ONE question |
| POST | `/api/run/{id}/simulate` | Run Agent 3 — returns all transcripts (parallel) |
| POST | `/api/run/{id}/simulate/regenerate` | Gate 3 — re-run ONE persona's interview |
| POST | `/api/run/{id}/synthesise` | Run Agent 4 — returns insight report |
| PATCH | `/api/run/{id}/behavior` | Track gate edit events (analytics) |

Full request/response shapes: see `TECH-SPEC.md` → Section 4.

## Frontend (Antigravity builds this)

**Stack:** Next.js + React + TypeScript + Tailwind CSS → deploy to Vercel

**Design:** All screen specs in `DESIGN-SPEC.md` (10 screens, color system, typography, copy).

**Session state:** Generate a UUID on first visit, store in `localStorage` as `researchos_session_id`. Pass as `session_id` in every `/api/run/create` call.

**In-flight state between API calls:** `sessionStorage` keys:
- `researchos_run_id`
- `researchos_intake`
- `researchos_personas`
- `researchos_guide`
- `researchos_transcripts`
- `researchos_report`

**Backend URL env var:** `NEXT_PUBLIC_API_URL`
- Dev: `http://localhost:8000`
- Prod: Railway backend URL (set in Vercel env vars)

## Supabase setup

Run `backend/db/schema.sql` once in the Supabase SQL editor before first run.

## Specs

- `PRD-ResearchOS.md` — product requirements, agent prompts, acceptance criteria
- `TECH-SPEC.md` — architecture, data model, API contract, folder structure
- `DESIGN-SPEC.md` — brand, color system, typography, all 10 screen specs + copy
