-- ResearchOS — Eval Scores Schema
-- Run in the Supabase SQL editor AFTER schema.sql
-- Stores Agent 5 (LLM-as-judge) evaluation results for every completed run

-- ── JSONB dimension entry structure ─────────────────────────────────────────
-- Each entry in a1_dimensions / a2_dimensions / a3_dimensions / a4_dimensions
-- / pipeline_dimensions follows this shape:
--
-- Standard (LLM or deterministic):
-- {
--   "score":     integer 1–5,
--   "reasoning": "judge's explanation written before the score",
--   "method":    "llm" | "deterministic" | "embedding",
--   "raw_value": null | <computed value — only for deterministic checks>,
--   "final_score": integer 1–5   ← always use this for aggregation
-- }
--
-- Multi-pass (A3-D1 / A4-D1 / A4-D2 — run twice, take lower):
-- {
--   "score":                  integer 1–5,
--   "reasoning":              "first pass reasoning",
--   "second_pass_score":      integer 1–5,
--   "second_pass_reasoning":  "second pass reasoning",
--   "method":                 "llm_multi_pass",
--   "final_score":            integer 1–5   ← min(score, second_pass_score)
-- }
--
-- ── Overall score weighting (computed in Python, stored in *_overall) ────────
-- Agent 1:  Critical=3 / High=2 / Medium=1 / Low=0.5
--   A1-D1(H=2) A1-D2(H=2) A1-D3(H=2) A1-D4(H=2) A1-D5(H=2)
--   A1-D6(M=1) A1-D7(M=1) A1-D8(L=0.5)   total weight = 12.5
--
-- Agent 2:  High=2 / Medium=1
--   A2-D1(H=2) A2-D2(H=2) A2-D6(H=2) A2-D8(H=2)
--   A2-D3(M=1) A2-D4(M=1) A2-D5(M=1) A2-D7(M=1)   total weight = 12
--
-- Agent 3:  Critical=3 / High=2 / Medium=1
--   A3-D1(C=3) A3-D4(C=3)
--   A3-D2(H=2) A3-D3(H=2) A3-D5(H=2) A3-D6(H=2)
--   A3-D7(M=1) A3-D8(M=1)   total weight = 16
--
-- Agent 4:  Critical=3 / High=2 / Medium=1
--   A4-D1(C=3) A4-D2(C=3) A4-D5(C=3)
--   A4-D3(H=2) A4-D4(H=2) A4-D6(H=2) A4-D8(H=2)
--   A4-D7(M=1)   total weight = 18
--
-- Pipeline: Critical=3 / High=2
--   CP-1(C=3) CP-4(C=3) CP-2(H=2) CP-3(H=2)   total weight = 10
--
-- ── total_score cross-agent weights ─────────────────────────────────────────
-- a1=20%  a2=20%  a3=25%  a4=25%  pipeline=10%
-- Rationale: A3 and A4 weighted higher — convergence and synthesis quality
-- determine the end product value. Pipeline captures chain-level coherence.

CREATE TABLE eval_scores (
  -- Identity
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id     UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Eval metadata
  eval_model         TEXT NOT NULL,              -- model that ran the judge calls
  eval_version       TEXT NOT NULL DEFAULT 'v1', -- rubric version; increment when rubric changes
  golden_set_case_id TEXT,                       -- NULL for production runs; 'GS-01' etc. for golden set

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | complete | failed
  error  TEXT,                                   -- populated if status = 'failed'

  -- ── Agent 1 ────────────────────────────────────────────────────
  a1_overall    DECIMAL(3,2), -- weighted average of A1-D1 through A1-D8; range 1.00–5.00
  a1_dimensions JSONB,        -- {dim_id: {score, reasoning, method, raw_value, final_score}}

  -- ── Agent 2 ────────────────────────────────────────────────────
  a2_overall    DECIMAL(3,2),
  a2_dimensions JSONB,

  -- ── Agent 3 ────────────────────────────────────────────────────
  a3_overall               DECIMAL(3,2),
  a3_dimensions            JSONB,
  a3_convergence_similarity DECIMAL(5,4),
  -- Average pairwise cosine similarity of persona responses to the same question.
  -- Range 0.0000–1.0000. Lower = more diverse (better). Flag if > 0.85 (convergence).
  -- Computed from Gemini embedding API; stored separately from a3_dimensions
  -- because it is a continuous float, not a 1–5 score.

  -- ── Agent 4 ────────────────────────────────────────────────────
  a4_overall    DECIMAL(3,2),
  a4_dimensions JSONB,

  -- ── Cross-agent pipeline ────────────────────────────────────────
  pipeline_overall    DECIMAL(3,2),
  pipeline_dimensions JSONB,

  -- ── Aggregate ───────────────────────────────────────────────────
  total_score DECIMAL(3,2),
  -- Weighted: a1*0.20 + a2*0.20 + a3*0.25 + a4*0.25 + pipeline*0.10
  -- Range 1.00–5.00. Benchmark targets by difficulty:
  --   easy cases: ≥3.5  |  medium: ≥3.0  |  hard: ≥2.5  |  edge: case-specific

  -- ── Performance ─────────────────────────────────────────────────
  eval_duration_ms INTEGER, -- total wall-clock time for the full eval run
  llm_calls_made   INTEGER  -- LLM judge calls made (deterministic checks not counted)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Primary lookup: get eval for a specific run
CREATE INDEX idx_eval_run_id ON eval_scores(run_id);

-- Time-series queries: score trends over time
CREATE INDEX idx_eval_created_at ON eval_scores(created_at DESC);

-- Quality filtering: find runs below a score threshold
CREATE INDEX idx_eval_total_score ON eval_scores(total_score);

-- Golden set queries: aggregate scores per case across runs
CREATE INDEX idx_eval_golden_set ON eval_scores(golden_set_case_id)
  WHERE golden_set_case_id IS NOT NULL;

-- Version queries: compare scores before and after rubric changes
CREATE INDEX idx_eval_version ON eval_scores(eval_version);

-- Compound: golden set scores per version (benchmark trending)
CREATE INDEX idx_eval_golden_version ON eval_scores(golden_set_case_id, eval_version)
  WHERE golden_set_case_id IS NOT NULL;
