import os
from dotenv import load_dotenv

load_dotenv()

# ── Secrets ─────────────────────────────────────────────────────
GOOGLE_API_KEY       = os.getenv("GOOGLE_API_KEY")
SUPABASE_URL         = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ENVIRONMENT          = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ── Model selection per agent ────────────────────────────────────
# Assigned by task requirement: capability vs volume trade-off
AGENT1_MODEL = "gemini-3-flash-preview"  # persona generation — medium-high capability, 1 call/run
AGENT2_MODEL = "gemini-2.5-flash-lite"   # interview guide — structured task, medium capability, 1 call/run
AGENT3_MODEL = "gemini-3.1-flash-lite"   # simulation — 5-8 calls/run, 500 RPD is the deciding factor
AGENT4_MODEL = "gemini-3.5-flash"        # synthesis — highest capability, large context, 1 call/run

# ── Per-model RPM caps (1 below actual API limit as safety buffer) ────────────
MODEL_RPM_CAPS = {
    "gemini-3.5-flash":        4,   # actual: 5 RPM
    "gemini-3-flash-preview":  4,   # actual: 5 RPM
    "gemini-2.5-flash":        4,   # actual: 5 RPM
    "gemini-2.5-flash-lite":   9,   # actual: 10 RPM
    "gemini-3.1-flash-lite":  14,   # actual: 15 RPM
}

# ── Max tokens per agent ─────────────────────────────────────────
AGENT1_MAX_TOKENS = 8192
AGENT2_MAX_TOKENS = 8192
AGENT3_MAX_TOKENS = 16384  # bumped: all questions + responses per persona in one call
AGENT4_MAX_TOKENS = 16384  # bumped: full synthesis report with themes, quotes, recommendations

# ── Pipeline defaults ────────────────────────────────────────────
DEFAULT_PERSONA_COUNT   = 5
DEFAULT_QUESTION_COUNT  = 6
MIN_PERSONAS            = 2
MAX_PERSONAS            = 8
MIN_QUESTIONS           = 4
MAX_QUESTIONS           = 8

# ── Quality thresholds ───────────────────────────────────────────
THIN_RESPONSE_WORD_LIMIT        = 100
MIN_THEMES                      = 3
MAX_THEMES                      = 5
MIN_HYPOTHESES                  = 3
MAX_HYPOTHESES                  = 5
MIN_RECOMMENDATIONS             = 3
MAX_RECOMMENDATIONS             = 5
MIN_EVIDENCE_QUOTES_PER_THEME   = 2

# ── Intake validation ────────────────────────────────────────────
MIN_PRODUCT_DESCRIPTION_CHARS   = 50
MIN_TARGET_USER_CHARS           = 30
MIN_RESEARCH_GOAL_CHARS         = 30

# ── Retry ────────────────────────────────────────────────────────
MAX_RETRY_ATTEMPTS       = 2

# ── Cost estimation (for pre-run display) ────────────────────────
# Gemini 3.1 Pro Preview pricing — verify at ai.google.dev/pricing before deploy
COST_PER_1K_INPUT_TOKENS  = 0.00125   # ~$1.25 / 1M input tokens (estimate)
COST_PER_1K_OUTPUT_TOKENS = 0.01000   # ~$10.00 / 1M output tokens (estimate)

# ── Feature flags ────────────────────────────────────────────────
ENABLE_COST_TRANSPARENCY = True
ENABLE_DEBUG_LOGGING     = True    # set True locally to log full prompts + responses
