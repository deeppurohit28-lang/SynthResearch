import json
import google.generativeai as genai
from config import settings
from utils.prompt_loader import load_prompt
from utils.gemini_utils import generate_content_with_retry
from validators.persona_validator import validate_personas

_SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",  "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT",  "threshold": "BLOCK_NONE"},
]


def _extract_json(text: str) -> list:
    """Parse JSON from model output, stripping markdown fences if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        end = len(lines) - 1 if lines[-1].strip().startswith("```") else len(lines)
        text = "\n".join(lines[1:end])
    return json.loads(text)


async def run_agent1(intake: dict) -> dict:
    """
    Generate N personas from intake context.
    Returns {"personas": [...], "tokens_used": int, "input_tokens": int, "output_tokens": int}
    """
    system_prompt = load_prompt("agent1_persona")
    model = genai.GenerativeModel(
        model_name=settings.AGENT1_MODEL,
        system_instruction=system_prompt,
        safety_settings=_SAFETY_SETTINGS,
    )

    user_prompt = (
        f"Product description: {intake['product_description']}\n"
        f"Target user (broad): {intake['target_user']}\n"
        f"Research goal: {intake['research_goal']}\n"
        f"Product stage: {intake['product_stage']}\n"
        f"Number of personas: {intake['persona_count']}\n\n"
        f"Complete all four steps and generate the persona array."
    )

    last_error: str = ""

    for attempt in range(settings.MAX_RETRY_ATTEMPTS + 1):
        prompt = user_prompt
        if attempt > 0:
            prompt += f"\n\nPrevious attempt failed validation: {last_error}. Fix these issues and return valid JSON."

        response = await generate_content_with_retry(
            model=model,
            prompt=prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=settings.AGENT1_MAX_TOKENS,
                response_mime_type="application/json",
            ),
            agent_name="Agent 1",
            model_name=settings.AGENT1_MODEL,
        )

        try:
            raw = response.text
            personas = _extract_json(raw)
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"persona_generation_failed: {last_error}")

        meta = response.usage_metadata
        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[Agent 1] attempt={attempt+1} input={meta.prompt_token_count} output={meta.candidates_token_count}")

        errors = validate_personas(personas, intake["persona_count"])

        if settings.ENABLE_DEBUG_LOGGING and errors:
            print(f"[Agent 1] validation errors: {errors}")

        if not errors:
            return {
                "personas":      personas,
                "tokens_used":   meta.total_token_count,
                "input_tokens":  meta.prompt_token_count,
                "output_tokens": meta.candidates_token_count,
            }

        last_error = "; ".join(errors)
        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"persona_generation_failed: {last_error}")

    raise ValueError("persona_generation_failed: exhausted retries")


async def regenerate_one_persona(intake: dict, existing_personas: list) -> dict:
    """
    Generate one replacement persona that complements the existing set (Gate 1 regenerate).
    Returns {"persona": {...}, "tokens_used": int, "input_tokens": int, "output_tokens": int}
    """
    system_prompt = load_prompt("agent1_persona")
    model = genai.GenerativeModel(
        model_name=settings.AGENT1_MODEL,
        system_instruction=system_prompt,
        safety_settings=_SAFETY_SETTINGS,
    )

    existing_summary = "\n".join(
        f"- {p.get('name')}: {p.get('role')} "
        f"({p.get('tech_savviness')} tech) — {p.get('relationship_to_problem', '')}"
        for p in existing_personas
    )

    user_prompt = (
        f"Product description: {intake['product_description']}\n"
        f"Target user (broad): {intake['target_user']}\n"
        f"Research goal: {intake['research_goal']}\n"
        f"Product stage: {intake['product_stage']}\n\n"
        f"EXISTING PERSONAS (do NOT duplicate these roles, behavioral profiles, or demographics):\n"
        f"{existing_summary}\n\n"
        f"Number of personas: 1\n\n"
        f"Generate exactly 1 new persona that fills a behavioral or demographic gap in the "
        f"existing set. Complete all four steps and return a JSON array containing exactly 1 persona."
    )

    last_error: str = ""

    for attempt in range(settings.MAX_RETRY_ATTEMPTS + 1):
        prompt = user_prompt
        if attempt > 0:
            prompt += f"\n\nPrevious attempt failed validation: {last_error}. Fix and return valid JSON."

        response = await generate_content_with_retry(
            model=model,
            prompt=prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=settings.AGENT1_MAX_TOKENS,
                response_mime_type="application/json",
            ),
            agent_name="Agent 1 Regen",
            model_name=settings.AGENT1_MODEL,
        )

        try:
            raw = response.text
            result = _extract_json(raw)
            personas = result if isinstance(result, list) else [result]
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"persona_regeneration_failed: {last_error}")

        if not personas:
            last_error = "Returned empty array"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"persona_regeneration_failed: {last_error}")

        meta = response.usage_metadata
        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[Agent 1 regen] attempt={attempt+1} input={meta.prompt_token_count}")

        errors = validate_personas(personas, 1)
        if not errors:
            return {
                "persona":       personas[0],
                "tokens_used":   meta.total_token_count,
                "input_tokens":  meta.prompt_token_count,
                "output_tokens": meta.candidates_token_count,
            }

        last_error = "; ".join(errors)
        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"persona_regeneration_failed: {last_error}")

    raise ValueError("persona_regeneration_failed: exhausted retries")
