-- ResearchOS — Supabase schema
-- Run this once in the Supabase SQL editor before starting the backend.

CREATE TABLE runs (
  -- Identity
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Pipeline status
  -- Values: intake | persona_review | guide_review |
  --         simulation_review | complete | abandoned
  status       TEXT NOT NULL DEFAULT 'intake',

  -- User identification (no auth required)
  user_email   TEXT,          -- optional, asked at intake
  session_id   TEXT,          -- anonymous browser UUID, always set

  -- Agent I/O (full JSON per stage)
  intake           JSONB,     -- intake form fields
  persona_set      JSONB,     -- Agent 1 output (post gate-1 edits stored by FE)
  interview_guide  JSONB,     -- Agent 2 output
  transcript_set   JSONB,     -- Agent 3 output
  report           JSONB,     -- Agent 4 output

  -- Behavior signals — Gate 1 (Personas)
  gate1_personas_edited       INTEGER DEFAULT 0,
  gate1_personas_deleted      INTEGER DEFAULT 0,
  gate1_personas_added        INTEGER DEFAULT 0,
  gate1_personas_regenerated  INTEGER DEFAULT 0,

  -- Behavior signals — Gate 2 (Interview Guide)
  gate2_questions_edited      INTEGER DEFAULT 0,
  gate2_questions_deleted     INTEGER DEFAULT 0,
  gate2_questions_added       INTEGER DEFAULT 0,
  gate2_questions_regenerated INTEGER DEFAULT 0,

  -- Behavior signals — Gate 3 (Transcripts)
  gate3_transcripts_regenerated INTEGER DEFAULT 0,
  gate3_transcripts_excluded    INTEGER DEFAULT 0,

  -- Behavior signals — Gate 4 (Report)
  gate4_hypotheses_edited  INTEGER DEFAULT 0,
  gate4_hypotheses_deleted INTEGER DEFAULT 0,
  gate4_recs_reordered     INTEGER DEFAULT 0,
  gate4_recs_deleted       INTEGER DEFAULT 0,

  -- Performance metadata
  total_tokens      INTEGER,
  total_cost_usd    DECIMAL(8, 4),
  agent1_cost_usd   DECIMAL(8, 4),
  agent2_cost_usd   DECIMAL(8, 4),
  agent3_cost_usd   DECIMAL(8, 4),
  agent1_latency_ms INTEGER,
  agent2_latency_ms INTEGER,
  agent3_latency_ms INTEGER,
  agent4_latency_ms INTEGER,
  total_latency_ms  INTEGER
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_runs_updated_at
  BEFORE UPDATE ON runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX idx_runs_session_id  ON runs(session_id);
CREATE INDEX idx_runs_status      ON runs(status);
CREATE INDEX idx_runs_created_at  ON runs(created_at DESC);
