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
AGENT1_MODEL = "gemini-3.0-flash"   # persona generation
AGENT2_MODEL = "gemini-3.0-flash"   # interview guide
AGENT3_MODEL = "gemini-3.0-flash"   # simulation — one bundled call per persona
AGENT4_MODEL = "gemini-3.0-flash"   # synthesis — highest value output

# ── Max tokens per agent ─────────────────────────────────────────
AGENT1_MAX_TOKENS = 4096
AGENT2_MAX_TOKENS = 4096
AGENT3_MAX_TOKENS = 8192   # large because all questions + responses in one call
AGENT4_MAX_TOKENS = 8192

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
ENABLE_DEBUG_LOGGING     = False   # set True locally to log full prompts + responses
