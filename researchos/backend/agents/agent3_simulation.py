import json
import asyncio
import anthropic
from config import settings
from utils.prompt_loader import load_prompt
from validators.transcript_validator import validate_transcript, fix_quality_flags


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
    """One bundled Claude call for a single persona covering all questions."""
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    system_prompt = _build_persona_system_prompt(persona, static_rules)
    user_prompt   = _build_all_questions_prompt(guide)

    response = await asyncio.wait_for(
        client.messages.create(
            model=settings.AGENT3_MODEL,
            max_tokens=settings.AGENT3_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        ),
        timeout=float(settings.AGENT3_TIMEOUT_SECONDS),
    )

    if settings.ENABLE_DEBUG_LOGGING:
        print(
            f"[Agent 3] {persona['name']} | "
            f"input={response.usage.input_tokens} output={response.usage.output_tokens}"
        )

    raw = response.content[0].text
    responses = _extract_json(raw)

    transcript = {
        "persona_id":   persona["id"],
        "persona_name": persona["name"],
        "responses":    responses,
    }

    # Correct quality flags based on actual word count
    transcript = fix_quality_flags(transcript)

    # Log validation warnings without failing the run
    errors = validate_transcript(transcript)
    if errors and settings.ENABLE_DEBUG_LOGGING:
        print(f"[Agent 3] {persona['name']} warnings: {errors}")

    return {
        "transcript":    transcript,
        "tokens_used":   response.usage.input_tokens + response.usage.output_tokens,
        "input_tokens":  response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
    }


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

    transcripts      = []
    failed_personas  = []
    total_tokens     = 0
    total_input      = 0
    total_output     = 0

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
        "transcripts":       transcripts,
        "failed_personas":   failed_personas,
        "partial_completion": len(failed_personas) > 0,
        "tokens_used":       total_tokens,
        "input_tokens":      total_input,
        "output_tokens":     total_output,
    }
