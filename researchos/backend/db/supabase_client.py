from supabase import create_client, Client
from config import settings


def _client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# ── Run lifecycle ────────────────────────────────────────────────

def create_run(intake: dict, user_email: str | None, session_id: str) -> str:
    result = _client().table("runs").insert({
        "status": "intake",
        "intake": intake,
        "user_email": user_email,
        "session_id": session_id,
    }).execute()
    return result.data[0]["id"]


def get_run(run_id: str) -> dict | None:
    result = _client().table("runs").select("*").eq("id", run_id).maybe_single().execute()
    return result.data


def update_run(run_id: str, updates: dict) -> None:
    _client().table("runs").update(updates).eq("id", run_id).execute()


# ── Convenience savers (called from routes after each agent) ─────

def save_personas(run_id: str, personas: list, latency_ms: int) -> None:
    update_run(run_id, {
        "status": "persona_review",
        "persona_set": personas,
        "agent1_latency_ms": latency_ms,
    })


def save_guide(run_id: str, guide: dict, latency_ms: int) -> None:
    update_run(run_id, {
        "status": "guide_review",
        "interview_guide": guide,
        "agent2_latency_ms": latency_ms,
    })


def save_transcripts(run_id: str, transcripts: list, latency_ms: int) -> None:
    update_run(run_id, {
        "status": "simulation_review",
        "transcript_set": transcripts,
        "agent3_latency_ms": latency_ms,
    })


def save_report(run_id: str, report: dict, latency_ms: int, total_cost_usd: float) -> None:
    update_run(run_id, {
        "status": "complete",
        "report": report,
        "agent4_latency_ms": latency_ms,
        "total_cost_usd": total_cost_usd,
    })


# ── Behavior tracking ────────────────────────────────────────────

# Valid column names — guards against arbitrary column injection
_BEHAVIOR_COLUMNS = {
    "gate1_persona_edited":        "gate1_personas_edited",
    "gate1_persona_deleted":       "gate1_personas_deleted",
    "gate1_persona_added":         "gate1_personas_added",
    "gate1_persona_regenerated":   "gate1_personas_regenerated",
    "gate2_question_edited":       "gate2_questions_edited",
    "gate2_question_deleted":      "gate2_questions_deleted",
    "gate2_question_added":        "gate2_questions_added",
    "gate2_question_regenerated":  "gate2_questions_regenerated",
    "gate3_transcript_regenerated": "gate3_transcripts_regenerated",
    "gate3_transcript_excluded":   "gate3_transcripts_excluded",
    "gate4_hypothesis_edited":     "gate4_hypotheses_edited",
    "gate4_hypothesis_deleted":    "gate4_hypotheses_deleted",
    "gate4_rec_reordered":         "gate4_recs_reordered",
    "gate4_rec_deleted":           "gate4_recs_deleted",
}


def increment_behavior(run_id: str, event: str) -> None:
    column = _BEHAVIOR_COLUMNS.get(event)
    if not column:
        return  # unknown event — ignore silently

    run = get_run(run_id)
    if not run:
        return

    current = run.get(column) or 0
    update_run(run_id, {column: current + 1})
