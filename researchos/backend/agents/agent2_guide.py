import json
import anthropic
from config import settings
from utils.prompt_loader import load_prompt
from validators.guide_validator import validate_guide


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        end = len(lines) - 1 if lines[-1].strip().startswith("```") else len(lines)
        text = "\n".join(lines[1:end])
    return json.loads(text)


def _persona_landscape_summary(personas: list) -> str:
    """Compact persona summary so Agent 2 can write universally applicable questions."""
    lines = []
    for p in personas:
        lines.append(f"- {p['name']}: {p['role']} ({p.get('tech_savviness', '?')} tech savviness) — {p.get('relationship_to_problem', '')}")
    return "\n".join(lines)


async def run_agent2(intake: dict, personas: list) -> dict:
    """
    Generate interview guide grounded in the research goal and persona landscape.
    Returns {"guide": {...}, "tokens_used": int, "input_tokens": int, "output_tokens": int}
    """
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    system_prompt = load_prompt("agent2_guide")

    persona_summary = _persona_landscape_summary(personas)

    user_prompt = (
        f"Research goal: {intake['research_goal']}\n"
        f"Product description: {intake['product_description']}\n"
        f"Target user: {intake['target_user']}\n\n"
        f"Persona landscape (use this to ensure questions work for every persona):\n{persona_summary}\n\n"
        f"Number of core questions: {intake['question_count']}\n\n"
        f"Generate the interview guide with exactly {intake['question_count']} core questions, "
        f"one warm-up question, one closing question, and 2 follow-up probes per core question."
    )

    last_error: str = ""

    for attempt in range(settings.MAX_RETRY_ATTEMPTS + 1):
        prompt = user_prompt
        if attempt > 0:
            prompt += f"\n\nPrevious attempt failed validation: {last_error}. Fix these issues and return valid JSON."

        response = await client.messages.create(
            model=settings.AGENT2_MODEL,
            max_tokens=settings.AGENT2_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[Agent 2] attempt={attempt+1} input={response.usage.input_tokens} output={response.usage.output_tokens}")

        raw = response.content[0].text

        try:
            guide = _extract_json(raw)
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"guide_generation_failed: {last_error}")

        errors = validate_guide(guide, intake["question_count"])

        if settings.ENABLE_DEBUG_LOGGING and errors:
            print(f"[Agent 2] validation errors: {errors}")

        if not errors:
            return {
                "guide": guide,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            }

        last_error = "; ".join(errors)
        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"guide_generation_failed: {last_error}")

    raise ValueError("guide_generation_failed: exhausted retries")
