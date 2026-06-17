# Technical Specification
## ResearchOS — Agentic Synthetic User Research Platform

---

**Version:** 0.2 (Phase 3 — Build)
**Date:** 2026-06-17
**Author:** Deep Purohit
**Status:** Draft
**Linked PRD:** `PRD-ResearchOS.md`

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Data Model](#3-data-model)
4. [API Contract](#4-api-contract)
5. [Configuration Strategy](#5-configuration-strategy)
6. [Development Observability](#6-development-observability)
7. [Project Folder Structure](#7-project-folder-structure)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────┐
│     BROWSER (Next.js / React)   │
│                                 │
│  UI screens, form state,        │
│  sessionStorage for in-flight   │
│  run state between API calls    │
└──────────┬──────────────────────┘
           │ fetch() — one call per agent
           ▼
┌─────────────────────────────────┐
│    FASTAPI BACKEND (Railway)    │
│                                 │
│  POST /api/run/create                    │
│  POST /api/run/{id}/personas             │
│  POST /api/run/{id}/personas/regenerate  │
│  POST /api/run/{id}/guide                │
│  POST /api/run/{id}/guide/regenerate     │
│  POST /api/run/{id}/simulate             │
│  POST /api/run/{id}/simulate/regenerate  │
│  POST /api/run/{id}/synthesise           │
│  PATCH /api/run/{id}/behavior            │
│                                 │
│  Orchestrates LLM calls         │
│  Validates JSON output          │
│  Writes run state to Supabase   │
└──────┬──────────────┬───────────┘
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────────┐
│ GEMINI API  │  │    SUPABASE      │
│             │  │  (PostgreSQL)    │
│ All 4       │  │                  │
│ agent calls │  │  runs table —    │
│ gemini-3.1- │  │  every run       │
│ pro-preview │  │  stored with     │
│             │  │  full I/O        │
└─────────────┘  └──────────────────┘
```

### 1.2 Data Flow Per Agent Call

```
1. Frontend calls POST /api/run/{id}/personas
          ↓
2. FastAPI loads system prompt from /prompts/agent1_persona_system.txt
          ↓
3. FastAPI builds user prompt from intake JSON + settings.py values
          ↓
4. FastAPI calls Claude API (Anthropic SDK)
          ↓
5. FastAPI receives raw response
          ↓
6. FastAPI validates JSON schema (fail → retry up to MAX_RETRY_ATTEMPTS)
          ↓
7. FastAPI writes result to Supabase (persona_set column, status updated)
          ↓
8. FastAPI returns persona JSON to frontend
          ↓
9. Frontend stores in sessionStorage, renders Gate 1
```

### 1.3 Agent 3 Parallel Execution

Agent 3 (Interview Simulation) makes 30 LLM calls (5 personas × 6 questions). These are parallelised per persona — all 5 persona batches run simultaneously, questions within each persona run sequentially.

```python
# Conceptual structure (Python asyncio)

async def simulate_all_personas(personas, guide):
    tasks = [simulate_persona(persona, guide) for persona in personas]
    transcripts = await asyncio.gather(*tasks, return_exceptions=True)
    return transcripts

async def simulate_persona(persona, guide):
    responses = []
    for question in guide["questions"]:
        response = await call_claude_agent3(persona, question)
        responses.append(response)
    return build_transcript(persona, responses)
```

Wall-clock time: ~30–60 seconds (not 5 personas × 6 questions × ~5s = 150s sequential).

### 1.4 Context Flow — What Each Agent Receives

The research goal is intentionally excluded from Agent 3 to prevent demand characteristics (see PRD Section 11, FR-04).

| Context Field | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|---|---|---|---|---|
| product_description | ✓ | ✓ | ✓ | ✓ |
| target_user | ✓ | ✓ | ✓ | ✓ |
| **research_goal** | **✓** | **✓** | **✗ Excluded** | **✓** |
| product_stage | ✓ | ✓ | — | — |
| persona_array | — | ✓ | ✓ (one per call) | — |
| interview_guide | — | — | ✓ | — |
| transcripts | — | — | — | ✓ |

---

## 2. Tech Stack

### 2.1 Stack Decisions

| Layer | Choice | Why | Cost |
|---|---|---|---|
| Frontend | Next.js (React + TypeScript) | Component-based UI, Vercel-native deployment | Free |
| Styling | Tailwind CSS | Fastest clean UI without a custom design system | Free |
| Frontend hosting | Vercel (Hobby) | One-click deploy from GitHub, generous free tier | Free |
| Backend | FastAPI (Python) | Native async for parallel LLM calls; Google Generative AI Python SDK | Free |
| Backend hosting | Railway (free tier) | Persistent server, no function timeout — critical for Agent 3's 30–60s execution | Free (~$5 credit/month) |
| Database | Supabase (PostgreSQL) | Free 500MB; JSONB stores agent outputs natively; dashboard lets you review every user run | Free |
| LLM | Google Gemini API | `gemini-3.1-pro-preview` for all 4 agents via `google-generativeai` Python SDK | ~$0.10–0.30/run (estimate) |
| Version control | GitHub | Free |

**Total infrastructure cost: $0. Only spend is Anthropic API usage during testing (~$5–15 for full development cycle).**

### 2.2 Why Not Next.js Full-Stack (Frontend + Backend in One)?

Vercel Hobby serverless functions have a **10-second timeout**. Agent 3 parallel simulation takes 30–60 seconds. A separate FastAPI server on Railway has no timeout constraint, solving this without workarounds or paid plan upgrades.

### 2.3 Why Supabase Over sessionStorage?

`sessionStorage` disappears when the tab closes. When real users test the product, their runs are lost — you can't review what they submitted, what the pipeline produced, or where they dropped off. Supabase persists every run server-side with full I/O stored as JSON, enabling behavioral analysis of real usage.

---

## 3. Data Model

### 3.1 Supabase — Runs Table

One row per research run. Every agent's output stored as JSONB. Behavior signals tracked as integer counters for usage analysis.

```sql
CREATE TABLE runs (
  -- Identity
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Pipeline status
  -- Values: intake | persona_review | guide_review |
  --         simulation_review | report | complete | abandoned
  status                        TEXT NOT NULL DEFAULT 'intake',

  -- User identification (lightweight, no auth required)
  user_email                    TEXT,         -- optional, asked at intake
  session_id                    TEXT,         -- anonymous browser UUID, always set

  -- Agent I/O (full JSON stored per stage)
  intake                        JSONB,        -- intake form fields
  persona_set                   JSONB,        -- Agent 1 output + user edits
  interview_guide               JSONB,        -- Agent 2 output + user edits
  transcript_set                JSONB,        -- Agent 3 output (all transcripts)
  report                        JSONB,        -- Agent 4 output + user edits

  -- Behavior signals (Gate 1 — Personas)
  gate1_personas_edited         INTEGER DEFAULT 0,
  gate1_personas_deleted        INTEGER DEFAULT 0,
  gate1_personas_added          INTEGER DEFAULT 0,
  gate1_personas_regenerated    INTEGER DEFAULT 0,

  -- Behavior signals (Gate 2 — Interview Guide)
  gate2_questions_edited        INTEGER DEFAULT 0,
  gate2_questions_deleted       INTEGER DEFAULT 0,
  gate2_questions_added         INTEGER DEFAULT 0,
  gate2_questions_regenerated   INTEGER DEFAULT 0,

  -- Behavior signals (Gate 3 — Transcripts)
  gate3_transcripts_regenerated INTEGER DEFAULT 0,
  gate3_transcripts_excluded    INTEGER DEFAULT 0,

  -- Behavior signals (Gate 4 — Report)
  gate4_hypotheses_edited       INTEGER DEFAULT 0,
  gate4_hypotheses_deleted      INTEGER DEFAULT 0,
  gate4_recs_reordered          INTEGER DEFAULT 0,
  gate4_recs_deleted            INTEGER DEFAULT 0,

  -- Performance metadata
  total_tokens                  INTEGER,
  total_cost_usd                DECIMAL(8, 4),
  agent1_latency_ms             INTEGER,
  agent2_latency_ms             INTEGER,
  agent3_latency_ms             INTEGER,
  agent4_latency_ms             INTEGER,
  total_latency_ms              INTEGER
);
```

### 3.2 What You Can Answer From This Table

| Question | Query approach |
|---|---|
| What research goals are users entering? | `SELECT intake->>'research_goal' FROM runs` |
| Where are users abandoning the pipeline? | `SELECT status, COUNT(*) FROM runs GROUP BY status ORDER BY COUNT DESC` |
| Are users editing personas or accepting AI output? | `SELECT gate1_personas_edited > 0, COUNT(*) FROM runs GROUP BY 1` |
| What product domains are people researching? | Read `intake` JSONB for patterns across `product_description` field |
| How long does the full pipeline actually take? | `SELECT AVG(total_latency_ms) FROM runs WHERE status = 'complete'` |
| Which runs cost the most? | `SELECT id, total_cost_usd FROM runs ORDER BY total_cost_usd DESC LIMIT 10` |
| Do users who edit personas get better output? | Compare report quality across `gate1_personas_edited = 0` vs `> 0` |

### 3.3 User Identification (No Auth Required)

Two lightweight mechanisms — no login system needed for MVP:

**Anonymous session ID (always set):**
Generate a UUID in the browser on first visit, store in `localStorage`. Every run from that browser gets the same `session_id`. Lets you see "this person ran 3 studies" without knowing who they are.

**Optional email (asked at intake):**
One optional field at the bottom of the intake form: "Email (optional — to follow up on your results)". Stored as `user_email` on the run. Lets you reach out to specific users for follow-up conversations.

### 3.4 In-Browser Session State

`sessionStorage` stores the active run's in-flight state between API calls. This is fast (no network round-trip) and is the source of truth for the current gate screen. Supabase is the persistent backup.

```
sessionStorage keys:
  researchos_run_id         → current run UUID
  researchos_intake         → intake form JSON
  researchos_personas       → latest persona array (post-edit)
  researchos_guide          → latest guide (post-edit)
  researchos_transcripts    → transcript set
  researchos_report         → final report JSON
```

---

## 4. API Contract

### 4.1 Endpoints

All endpoints are on the FastAPI server. Frontend calls them sequentially — one per agent stage. Each call is independent; state is carried by the frontend via `run_id` and `sessionStorage`.

---

#### POST /api/run/create

Creates a new run in Supabase and returns the run ID.

**Request body:**
```json
{
  "intake": {
    "product_description": "string",
    "target_user": "string",
    "research_goal": "string",
    "product_stage": "idea | pre-mvp | mvp | post-launch",
    "persona_count": 5,
    "question_count": 6
  },
  "user_email": "string | null",
  "session_id": "string"
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "status": "intake",
  "estimated_cost_usd": 0.28,
  "estimated_latency_seconds": 180
}
```

---

#### POST /api/run/{run_id}/personas

Runs Agent 1. Receives intake, returns persona array.

**Request body:**
```json
{
  "run_id": "uuid"
}
```
*(Intake is read from Supabase by run_id — not re-sent by frontend)*

**Response:**
```json
{
  "run_id": "uuid",
  "status": "persona_review",
  "personas": [ /* persona array per FR-02 schema */ ],
  "latency_ms": 4200,
  "tokens_used": 1847,
  "cost_usd": 0.021
}
```

**On validation failure (retry exhausted):**
```json
{
  "error": "persona_generation_failed",
  "message": "Agent 1 did not return valid JSON after 2 attempts.",
  "retryable": true
}
```

---

#### POST /api/run/{run_id}/guide

Runs Agent 2. Receives modified persona array from frontend (post-Gate 1 edits).

**Request body:**
```json
{
  "run_id": "uuid",
  "personas": [ /* modified persona array from Gate 1 */ ]
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "status": "guide_review",
  "guide": { /* interview guide per FR-03 schema */ },
  "latency_ms": 2800,
  "tokens_used": 1203,
  "cost_usd": 0.014
}
```

---

#### POST /api/run/{run_id}/simulate

Runs Agent 3 for all personas in parallel. Receives modified guide from frontend (post-Gate 2 edits).

**Request body:**
```json
{
  "run_id": "uuid",
  "personas": [ /* modified personas from Gate 1 */ ],
  "guide": { /* modified guide from Gate 2 */ }
}
```

**Note:** `research_goal` is NOT included in the Agent 3 context. FastAPI reads research_goal from Supabase only for Agents 1, 2, and 4. This is enforced server-side.

**Response:**
```json
{
  "run_id": "uuid",
  "status": "simulation_review",
  "transcripts": [ /* transcript array per FR-04 schema */ ],
  "partial_completion": false,
  "failed_personas": [],
  "latency_ms": 44000,
  "tokens_used": 9840,
  "cost_usd": 0.089
}
```

**On partial completion (one persona failed):**
```json
{
  "run_id": "uuid",
  "status": "simulation_review",
  "transcripts": [ /* 4 of 5 transcripts */ ],
  "partial_completion": true,
  "failed_personas": ["persona_3"],
  "latency_ms": 48000
}
```

---

#### POST /api/run/{run_id}/synthesise

Runs Agent 4. Receives transcript set with exclusion flags applied.

**Request body:**
```json
{
  "run_id": "uuid",
  "transcripts": [ /* transcripts with _excluded flag set by user at Gate 3 */ ]
}
```

**Note:** `research_goal` is re-introduced here. FastAPI reads it from Supabase and injects it into the Agent 4 prompt.

**Response:**
```json
{
  "run_id": "uuid",
  "status": "complete",
  "report": { /* insight report per FR-05 schema */ },
  "hallucination_check_passed": true,
  "quotes_verified": 8,
  "quotes_failed": 0,
  "latency_ms": 12000,
  "tokens_used": 4210,
  "cost_usd": 0.063
}
```

---

#### PATCH /api/run/{run_id}/behavior

Called by the frontend whenever a user takes an edit action at a gate. Increments the relevant behavior counter in Supabase. Does not re-run any agent.

**Request body:**
```json
{
  "event": "gate1_persona_edited | gate1_persona_deleted | gate1_persona_added | gate1_persona_regenerated | gate2_question_edited | gate2_question_deleted | gate2_question_added | gate3_transcript_regenerated | gate3_transcript_excluded | gate4_hypothesis_edited | gate4_rec_reordered | gate4_rec_deleted"
}
```

**Response:**
```json
{ "ok": true }
```

---

#### POST /api/run/{run_id}/personas/regenerate

Gate 1 action — regenerate a single persona card without touching the rest. Reads intake from Supabase.

**Request body:**
```json
{
  "existing_personas": [ /* current persona array (minus the one being replaced) */ ]
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "persona": { /* single persona object per FR-02 schema */ },
  "latency_ms": 3100,
  "tokens_used": 920,
  "cost_usd": 0.011
}
```

---

#### POST /api/run/{run_id}/guide/regenerate

Gate 2 action — regenerate a single interview question. Reads intake from Supabase.

**Request body:**
```json
{
  "personas": [ /* current persona array */ ],
  "existing_guide": { /* full current guide */ },
  "question_id": "q3"
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "question": { "id": "q3", "question": "string", "intent": "string", "follow_up_probes": ["string", "string"] },
  "latency_ms": 1800,
  "tokens_used": 610,
  "cost_usd": 0.007
}
```

---

#### POST /api/run/{run_id}/simulate/regenerate

Gate 3 action — re-run a single persona's interview. `research_goal` is still excluded (demand characteristics prevention still applies).

**Request body:**
```json
{
  "persona": { /* persona object */ },
  "guide": { /* full interview guide */ }
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "transcript": { /* transcript object per FR-04 schema, includes validation_warnings */ },
  "latency_ms": 18000,
  "tokens_used": 2240,
  "cost_usd": 0.028
}
```

---

## 5. Configuration Strategy

### 5.1 Why Separate Config From Logic

Every value that might change during iteration — model choice, persona count defaults, quality thresholds, prompt rules — lives outside the logic code. Changing any of these requires touching zero Python logic files.

### 5.2 Prompt Files

One plain text file per agent system prompt. Loaded at runtime, not hardcoded.

```
/backend
  /prompts
    agent1_persona_system.txt
    agent2_guide_system.txt
    agent3_simulation_system.txt
    agent4_synthesis_system.txt
```

**How they're loaded in FastAPI:**

```python
# utils/prompt_loader.py
from pathlib import Path

def load_prompt(agent: str) -> str:
    path = Path(__file__).parent.parent / "prompts" / f"{agent}_system.txt"
    return path.read_text(encoding="utf-8")
```

**Iteration loop:**
1. Output looks bad → identify which agent
2. Open the agent's `.txt` file
3. Add/modify the rule
4. Restart FastAPI (`uvicorn` with `--reload`)
5. Re-test with fixed test input
6. Compare output to previous version

### 5.3 Settings File

All tunable values in one file. No magic numbers scattered across the codebase.

```python
# /backend/config/settings.py

# ── Model selection per agent ──────────────────────────────────
AGENT1_MODEL = "gemini-3.1-pro-preview"   # persona generation
AGENT2_MODEL = "gemini-3.1-pro-preview"   # interview guide
AGENT3_MODEL = "gemini-3.1-pro-preview"   # simulation — one bundled call per persona
AGENT4_MODEL = "gemini-3.1-pro-preview"   # synthesis — highest value output

# ── Pipeline defaults ──────────────────────────────────────────
DEFAULT_PERSONA_COUNT   = 5
DEFAULT_QUESTION_COUNT  = 6
MIN_PERSONAS            = 2
MAX_PERSONAS            = 8
MIN_QUESTIONS           = 4
MAX_QUESTIONS           = 8

# ── Quality thresholds ─────────────────────────────────────────
THIN_RESPONSE_WORD_LIMIT        = 100
MIN_THEMES                      = 3
MAX_THEMES                      = 5
MIN_HYPOTHESES                  = 3
MAX_HYPOTHESES                  = 5
MIN_RECOMMENDATIONS             = 3
MAX_RECOMMENDATIONS             = 5
MIN_EVIDENCE_QUOTES_PER_THEME   = 2

# ── Intake validation ──────────────────────────────────────────
MIN_PRODUCT_DESCRIPTION_CHARS   = 50
MIN_TARGET_USER_CHARS           = 20
MIN_RESEARCH_GOAL_CHARS         = 20

# ── Retry + timeout ───────────────────────────────────────────
MAX_RETRY_ATTEMPTS              = 2
AGENT3_TIMEOUT_SECONDS          = 90

# ── Cost estimation (for pre-run display to user) ─────────────
# Gemini 3.1 Pro Preview — verify at ai.google.dev/pricing before deploy
COST_PER_1K_INPUT_TOKENS  = 0.00125   # estimate
COST_PER_1K_OUTPUT_TOKENS = 0.01000   # estimate

# ── Feature flags ─────────────────────────────────────────────
ENABLE_COST_TRANSPARENCY         = True
ENABLE_DEBUG_LOGGING             = False   # set True locally to log full prompts
```

**What changes look like:**

| Change needed | File to edit | Lines of logic code touched |
|---|---|---|
| Agent 1 generates generic personas | `agent1_persona_system.txt` | 0 |
| Switch Agent 3 to Sonnet for quality | `settings.py` line 10 | 0 |
| Increase thin response threshold | `settings.py` line 22 | 0 |
| Add a new synthesis rule | `agent4_synthesis_system.txt` | 0 |
| Change default persona count to 3 | `settings.py` line 14 | 0 |

### 5.4 Environment Variables (.env)

Secrets and environment-specific values. Never committed to Git.

```
# /backend/.env

GOOGLE_API_KEY=AIza...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
ENVIRONMENT=development   # or production
FRONTEND_URL=http://localhost:3000   # set to Vercel URL in production
```

---

## 6. Development Observability

### 6.1 Three Review Surfaces

**Surface 1 — Anthropic Console (console.anthropic.com)**
Test and iterate each agent's prompt before writing any code. Paste the system prompt + a sample user prompt, run it, review the output, tweak, re-run. Fix the prompt here first — only move it into the `.txt` file when the output is good.

**Surface 2 — FastAPI Terminal Logs**
When `ENABLE_DEBUG_LOGGING = True`, every agent call logs:

```
[Agent 1] INPUT TOKENS: 847
[Agent 1] PROMPT: You are an expert UX researcher... [truncated]
[Agent 1] RAW RESPONSE: {"id": "persona_1", "name": "Priya"...}
[Agent 1] VALIDATION: ✓ count=5 ✓ distinct_roles ✓ anti_sycophancy_persona_present
[Agent 1] LATENCY: 4.2s | COST: $0.018

[Agent 3] persona_2 | q3 → COMPLETE (134 words) | tone: negative
[Agent 3] persona_4 | q1 → THIN (67 words) — flagged
[Agent 3] persona_1 | q5 → COMPLETE (118 words) | tone: mixed
```

In production (`ENABLE_DEBUG_LOGGING = False`): log only metadata — no full prompt or response content.

**Surface 3 — The Gate Screens**
You are the first test user. What you see at each gate tells you which agent needs fixing:

| What the gate looks wrong | Root cause | Fix |
|---|---|---|
| All personas look like the same archetype | MECE / anti-sycophancy failed | `agent1_persona_system.txt` |
| Questions sound leading or generic | Forbidden question rules not enforced | `agent2_guide_system.txt` |
| Transcript responses are short and hollow | Character context not maintained | `agent3_simulation_system.txt` |
| Hypotheses are vague or restate the research goal | Lean UX format not enforced | `agent4_synthesis_system.txt` |
| A quote in the report doesn't exist in the transcript | Anti-hallucination check failed | Validator + Agent 4 prompt |
| Pipeline breaks with a JSON parse error | Schema instruction not reliable | Prompt schema block + retry logic |

### 6.2 Fixed Test Input

Use this same intake for every development test run. When you change a prompt, re-run with this input and compare output to the previous version.

```json
{
  "product_description": "A tool that helps solo founders track MRR without a finance background. Connects to Stripe and shows revenue in plain English — no spreadsheets needed.",
  "target_user": "Non-technical solo founders running B2B SaaS products under $10K MRR who manage their finances themselves",
  "research_goal": "What are the biggest friction points founders face when trying to understand their revenue trends?",
  "product_stage": "pre-mvp",
  "persona_count": 5,
  "question_count": 6
}
```

### 6.3 One Agent at a Time

Build and validate each agent before adding the next. A bad persona set (Agent 1) makes everything downstream look broken — you won't know if it's Agent 2's fault or Agent 1's.

```
v0.1  Build intake form + Agent 1 → test → fix → lock
v0.2  Add Agent 2               → test → fix → lock
v0.3  Add Agent 3               → test → fix → lock (highest risk)
v0.4  Add Agent 4               → test → fix → lock
v0.5  Report rendering + polish → ship MVP
```

---

## 7. Project Folder Structure

```
researchos/
│
├── frontend/                        # Next.js app
│   ├── pages/
│   │   ├── index.tsx                # Screen 1 — Landing
│   │   ├── intake.tsx               # Screen 2 — Intake Form
│   │   └── run/
│   │       ├── [id]/
│   │       │   ├── personas.tsx     # Screen 4 — Gate 1
│   │       │   ├── guide.tsx        # Screen 6 — Gate 2
│   │       │   ├── transcripts.tsx  # Screen 8 — Gate 3
│   │       │   └── report.tsx       # Screen 10 — Report
│   ├── components/
│   │   ├── PersonaCard.tsx
│   │   ├── QuestionRow.tsx
│   │   ├── TranscriptPanel.tsx
│   │   ├── ReportSection.tsx
│   │   ├── LoadingState.tsx
│   │   └── ConfidenceDisclaimer.tsx
│   ├── lib/
│   │   ├── api.ts                   # fetch wrappers for backend calls
│   │   └── session.ts               # sessionStorage helpers
│   └── tailwind.config.js
│
├── backend/                         # FastAPI app
│   ├── main.py                      # FastAPI app entry point
│   ├── config/
│   │   └── settings.py              # all tunable values
│   ├── prompts/
│   │   ├── agent1_persona_system.txt
│   │   ├── agent2_guide_system.txt
│   │   ├── agent3_simulation_system.txt
│   │   └── agent4_synthesis_system.txt
│   ├── agents/
│   │   ├── agent1_persona.py        # Agent 1 orchestration
│   │   ├── agent2_guide.py          # Agent 2 orchestration
│   │   ├── agent3_simulation.py     # Agent 3 parallel execution
│   │   └── agent4_synthesis.py      # Agent 4 orchestration
│   ├── validators/
│   │   ├── persona_validator.py     # schema + rule checks
│   │   ├── guide_validator.py
│   │   ├── transcript_validator.py
│   │   └── report_validator.py      # includes anti-hallucination check
│   ├── routes/
│   │   └── run_routes.py            # all /api/run/* endpoints
│   ├── db/
│   │   └── supabase_client.py       # Supabase read/write helpers
│   └── utils/
│       └── prompt_loader.py         # loads .txt prompt files
│
├── .env                             # secrets — never committed
├── .env.example                     # template for .env
└── README.md
```

---

*Document last updated: 2026-06-16*
*Next: Phase 3 — Build & AI Integration*
