import asyncio
import time
from fastapi import APIRouter, HTTPException

from config import settings
from models.schemas import (
    CreateRunRequest,
    PersonasRequest,
    GuideRequest,
    SimulateRequest,
    SynthesiseRequest,
    BehaviorRequest,
    RegeneratePersonaRequest,
    RegenerateQuestionRequest,
    RegenerateTranscriptRequest,
)
from agents import agent1_persona, agent2_guide, agent3_simulation, agent4_synthesis
from db import supabase_client as db
from utils.cost import calculate_cost, estimate_run_cost

router = APIRouter()


# ── Helper ───────────────────────────────────────────────────────

def _is_haiku(model: str) -> bool:
    return "haiku" in model.lower()


# ── POST /run/create ─────────────────────────────────────────────

@router.post("/run/create")
async def create_run(request: CreateRunRequest):
    intake_dict = request.intake.model_dump()

    estimated_cost, estimated_latency = estimate_run_cost(
        request.intake.persona_count,
        request.intake.question_count,
    )

    run_id = await asyncio.to_thread(
        db.create_run,
        intake_dict,
        request.user_email,
        request.session_id,
    )

    return {
        "run_id": run_id,
        "status": "intake",
        "estimated_cost_usd": estimated_cost,
        "estimated_latency_seconds": estimated_latency,
    }


# ── POST /run/{run_id}/personas ──────────────────────────────────

@router.post("/run/{run_id}/personas")
async def generate_personas(run_id: str, request: PersonasRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    intake = run["intake"]

    try:
        start = time.time()
        result = await agent1_persona.run_agent1(intake)
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT1_MODEL),
        )

        await asyncio.to_thread(db.save_personas, run_id, result["personas"], latency_ms, cost_usd)

        return {
            "run_id": run_id,
            "status": "persona_review",
            "personas": result["personas"],
            "latency_ms": latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd": cost_usd,
        }

    except ValueError as e:
        raise HTTPException(status_code=500, detail={
            "error": "persona_generation_failed",
            "message": str(e),
            "retryable": True,
        })


# ── POST /run/{run_id}/guide ─────────────────────────────────────

@router.post("/run/{run_id}/guide")
async def generate_guide(run_id: str, request: GuideRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    intake = run["intake"]
    personas_dict = [p.model_dump() for p in request.personas]

    try:
        start = time.time()
        result = await agent2_guide.run_agent2(intake, personas_dict)
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT2_MODEL),
        )

        await asyncio.to_thread(db.save_guide, run_id, result["guide"], latency_ms, cost_usd)

        return {
            "run_id": run_id,
            "status": "guide_review",
            "guide": result["guide"],
            "latency_ms": latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd": cost_usd,
        }

    except ValueError as e:
        raise HTTPException(status_code=500, detail={
            "error": "guide_generation_failed",
            "message": str(e),
            "retryable": True,
        })


# ── POST /run/{run_id}/simulate ──────────────────────────────────

@router.post("/run/{run_id}/simulate")
async def simulate_interviews(run_id: str, request: SimulateRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    # research_goal is intentionally NOT passed to Agent 3 — demand characteristics prevention.
    # The route enforces this by only passing personas + guide.
    personas_dict = [p.model_dump() for p in request.personas]
    guide_dict    = request.guide.model_dump()

    try:
        start = time.time()
        result = await agent3_simulation.run_agent3(personas_dict, guide_dict)
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT3_MODEL),
        )

        await asyncio.to_thread(db.save_transcripts, run_id, result["transcripts"], latency_ms, cost_usd)

        return {
            "run_id": run_id,
            "status": "simulation_review",
            "transcripts": result["transcripts"],
            "partial_completion": result["partial_completion"],
            "failed_personas": result["failed_personas"],
            "latency_ms": latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd": cost_usd,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error": "simulation_failed",
            "message": str(e),
            "retryable": True,
        })


# ── POST /run/{run_id}/synthesise ────────────────────────────────

@router.post("/run/{run_id}/synthesise")
async def synthesise(run_id: str, request: SynthesiseRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    # research_goal re-introduced from Supabase — never from the request body
    intake = run["intake"]

    try:
        start = time.time()
        result = await agent4_synthesis.run_agent4(request.transcripts, intake)
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT4_MODEL),
        )

        # Sort themes by frequency descending (US-06 — enforce even if model skips ordering)
        report = result["report"]
        if isinstance(report.get("themes"), list):
            report["themes"] = sorted(
                report["themes"], key=lambda t: t.get("frequency", 0), reverse=True
            )

        await asyncio.to_thread(
            db.save_report, run_id, report, latency_ms, cost_usd
        )

        return {
            "run_id": run_id,
            "status": "complete",
            "report": report,
            "hallucination_check_passed": result["hallucination_check_passed"],
            "quotes_verified": result["quotes_verified"],
            "quotes_failed": result["quotes_failed"],
            "latency_ms": latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd": cost_usd,
        }

    except ValueError as e:
        raise HTTPException(status_code=500, detail={
            "error": "synthesis_failed",
            "message": str(e),
            "retryable": True,
        })


# ── PATCH /run/{run_id}/behavior ─────────────────────────────────

@router.patch("/run/{run_id}/behavior")
async def track_behavior(run_id: str, request: BehaviorRequest):
    await asyncio.to_thread(db.increment_behavior, run_id, request.event.value)
    return {"ok": True}


# ── POST /run/{run_id}/personas/regenerate ────────────────────────
# Gate 1: regenerate a single persona card without touching the rest

@router.post("/run/{run_id}/personas/regenerate")
async def regenerate_persona(run_id: str, request: RegeneratePersonaRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    intake = run["intake"]
    existing_personas_dict = [p.model_dump() for p in request.existing_personas]

    try:
        start = time.time()
        result = await agent1_persona.regenerate_one_persona(intake, existing_personas_dict)
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT1_MODEL),
        )

        return {
            "run_id":      run_id,
            "persona":     result["persona"],
            "latency_ms":  latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd":    cost_usd,
        }

    except ValueError as e:
        raise HTTPException(status_code=500, detail={
            "error":     "persona_regeneration_failed",
            "message":   str(e),
            "retryable": True,
        })


# ── POST /run/{run_id}/guide/regenerate ───────────────────────────
# Gate 2: regenerate a single interview question

@router.post("/run/{run_id}/guide/regenerate")
async def regenerate_question(run_id: str, request: RegenerateQuestionRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    intake = run["intake"]
    personas_dict = [p.model_dump() for p in request.personas]
    guide_dict    = request.existing_guide.model_dump()

    try:
        start = time.time()
        result = await agent2_guide.regenerate_one_question(
            intake, personas_dict, guide_dict, request.question_id
        )
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT2_MODEL),
        )

        return {
            "run_id":      run_id,
            "question":    result["question"],
            "latency_ms":  latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd":    cost_usd,
        }

    except ValueError as e:
        raise HTTPException(status_code=500, detail={
            "error":     "question_regeneration_failed",
            "message":   str(e),
            "retryable": True,
        })


# ── POST /run/{run_id}/simulate/regenerate ────────────────────────
# Gate 3: re-run simulation for a single persona transcript

@router.post("/run/{run_id}/simulate/regenerate")
async def regenerate_transcript(run_id: str, request: RegenerateTranscriptRequest):
    run = await asyncio.to_thread(db.get_run, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    # research_goal intentionally NOT passed — demand characteristics prevention still applies
    try:
        start = time.time()
        result = await agent3_simulation.simulate_one_persona(
            request.persona.model_dump(),
            request.guide.model_dump(),
        )
        latency_ms = int((time.time() - start) * 1000)

        cost_usd = calculate_cost(
            result["input_tokens"],
            result["output_tokens"],
            is_haiku=_is_haiku(settings.AGENT3_MODEL),
        )

        return {
            "run_id":      run_id,
            "transcript":  result["transcript"],
            "latency_ms":  latency_ms,
            "tokens_used": result["tokens_used"],
            "cost_usd":    cost_usd,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error":     "transcript_regeneration_failed",
            "message":   str(e),
            "retryable": True,
        })
