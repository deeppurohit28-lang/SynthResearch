import json
import asyncio
import google.generativeai as genai
from config import settings
from utils.prompt_loader import load_prompt
from utils.gemini_utils import generate_content_with_retry
from validators.transcript_validator import validate_transcript, fix_quality_flags

_SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",  "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT",  "threshold": "BLOCK_NONE"},
]


def _extract_json(text: str) -> list:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        end = len(lines) - 1 if lines[-1].strip().startswith("```") else len(lines)
        text = "\n".join(lines[1:end])
    return json.loads(text)


def _build_persona_system_prompt(persona: dict, static_rules: str) -> str:
    """Inject persona identity into the system prompt."""
    goals_str = "\n  ".join(f"• {g}" for g in persona.get("goals", []))
    frustrations_str = "\n  ".join(f"• {f}" for f in persona.get("frustrations", []))

    identity = (
        f"You are {persona['name']}.\n\n"
        f"YOUR PROFILE:\n"
        f"  Age: {persona['age']} | Role: {persona['role']} | Location: {persona['location']}\n"
        f"  Background: {persona['background']}\n"
        f"  Goals:\n  {goals_str}\n"
        f"  Frustrations:\n  {frustrations_str}\n"
        f"  How you relate to this problem: {persona['relationship_to_problem']}\n"
        f"  Tech comfort level: {persona['tech_savviness']}\n"
        f"  In your own words: \"{persona['quote']}\"\n\n"
    )
    return identity + static_rules


def _build_all_questions_prompt(guide: dict) -> str:
    """Build the user prompt with all questions bundled, requesting a JSON array response."""
    lines = [
        "You are in a research interview. Answer ALL questions below as yourself.",
        "",
        "Return a JSON array — one object per question — in this EXACT format:",
        "[",
        "  {",
        '    "question_id": "warmup",',
        '    "question": "exact question text here",',
        '    "response": "your full in-character answer (minimum 100 words)",',
        '    "tone": "positive" | "neutral" | "negative" | "mixed",',
        '    "quality_flag": "adequate" | "thin"',
        "  },",
        "  { ... one object per question ... }",
        "]",
        "",
        "quality_flag: 'adequate' if your response is 100+ words, 'thin' if shorter.",
        "Return ONLY the JSON array. No preamble, no explanation outside the JSON.",
        "",
        "=== INTERVIEW QUESTIONS ===",
        "",
        f"[WARM_UP] (question_id: \"warmup\")",
        guide["warmup_question"],
        "",
    ]

    for q in guide["questions"]:
        lines.append(f"[{q['id'].upper()}] (question_id: \"{q['id']}\")")
        lines.append(q["question"])
        lines.append("")

    lines.append(f"[CLOSING] (question_id: \"closing\")")
    lines.append(guide["closing_question"])

    return "\n".join(lines)


async def _simulate_persona(persona: dict, guide: dict, static_rules: str) -> dict:
    """One bundled Gemini call per persona, with retry on JSON parse failure (CC-01)."""
    system_prompt    = _build_persona_system_prompt(persona, static_rules)
    base_user_prompt = _build_all_questions_prompt(guide)

    model = genai.GenerativeModel(
        model_name=settings.AGENT3_MODEL,
        system_instruction=system_prompt,
        safety_settings=_SAFETY_SETTINGS,
    )

    last_error: str = ""

    for attempt in range(settings.MAX_RETRY_ATTEMPTS + 1):
        user_prompt = base_user_prompt
        if attempt > 0:
            user_prompt += f"\n\nPrevious attempt failed: {last_error}. Return ONLY a valid JSON array."

        response = await generate_content_with_retry(
            model=model,
            prompt=user_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=settings.AGENT3_MAX_TOKENS,
            ),
            agent_name=f"Agent 3 ({persona['name']})"
        )

        meta = response.usage_metadata
        if settings.ENABLE_DEBUG_LOGGING:
            print(
                f"[Agent 3] {persona['name']} attempt={attempt+1} | "
                f"input={meta.prompt_token_count} output={meta.candidates_token_count}"
            )

        try:
            raw = response.text
            responses = _extract_json(raw)
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"transcript_generation_failed: {last_error}")

        transcript = {
            "persona_id":   persona["id"],
            "persona_name": persona["name"],
            "responses":    responses,
        }

        # Correct quality flags based on actual word count
        transcript = fix_quality_flags(transcript)

        # Validate and attach warnings — character breaks surface to frontend (GAP-07)
        errors = validate_transcript(transcript)
        transcript["validation_warnings"] = errors

        if settings.ENABLE_DEBUG_LOGGING and errors:
            print(f"[Agent 3] {persona['name']} warnings: {errors}")

        return {
            "transcript":    transcript,
            "tokens_used":   meta.total_token_count,
            "input_tokens":  meta.prompt_token_count,
            "output_tokens": meta.candidates_token_count,
        }

    raise ValueError("transcript_generation_failed: exhausted retries")


async def run_agent3(personas: list, guide: dict) -> dict:
    """
    Simulate all personas in parallel — one bundled call per persona.
    research_goal is intentionally NOT passed here (demand characteristics prevention).

    Returns {
        "transcripts": [...],
        "failed_personas": [...],
        "partial_completion": bool,
        "tokens_used": int,
        "input_tokens": int,
        "output_tokens": int,
    }
    """
    static_rules = load_prompt("agent3_simulation")

    tasks = [
        _simulate_persona(persona, guide, static_rules)
        for persona in personas
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    transcripts     = []
    failed_personas = []
    total_tokens    = 0
    total_input     = 0
    total_output    = 0

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            failed_personas.append(personas[i]["id"])
            if settings.ENABLE_DEBUG_LOGGING:
                print(f"[Agent 3] {personas[i]['name']} FAILED: {result}")
        else:
            transcripts.append(result["transcript"])
            total_tokens += result["tokens_used"]
            total_input  += result["input_tokens"]
            total_output += result["output_tokens"]

    return {
        "transcripts":        transcripts,
        "failed_personas":    failed_personas,
        "partial_completion": len(failed_personas) > 0,
        "tokens_used":        total_tokens,
        "input_tokens":       total_input,
        "output_tokens":      total_output,
    }


async def simulate_one_persona(persona: dict, guide: dict) -> dict:
    """Simulate a single persona — used by the Gate 3 regenerate transcript endpoint."""
    static_rules = load_prompt("agent3_simulation")
    return await _simulate_persona(persona, guide, static_rules)
