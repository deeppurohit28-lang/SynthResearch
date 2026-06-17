import json
import anthropic
from config import settings
from utils.prompt_loader import load_prompt
from validators.persona_validator import validate_personas


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
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    system_prompt = load_prompt("agent1_persona")

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

        response = await client.messages.create(
            model=settings.AGENT1_MODEL,
            max_tokens=settings.AGENT1_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[Agent 1] attempt={attempt+1} input={response.usage.input_tokens} output={response.usage.output_tokens}")

        raw = response.content[0].text

        try:
            personas = _extract_json(raw)
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"persona_generation_failed: {last_error}")

        errors = validate_personas(personas, intake["persona_count"])

        if settings.ENABLE_DEBUG_LOGGING and errors:
            print(f"[Agent 1] validation errors: {errors}")

        if not errors:
            return {
                "personas": personas,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            }

        last_error = "; ".join(errors)
        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"persona_generation_failed: {last_error}")

    raise ValueError("persona_generation_failed: exhausted retries")
