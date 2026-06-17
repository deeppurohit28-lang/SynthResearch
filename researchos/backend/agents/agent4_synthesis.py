import json
import anthropic
from config import settings
from utils.prompt_loader import load_prompt
from validators.report_validator import validate_report


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        end = len(lines) - 1 if lines[-1].strip().startswith("```") else len(lines)
        text = "\n".join(lines[1:end])
    return json.loads(text)


async def run_agent4(transcripts: list, intake: dict) -> dict:
    """
    Synthesize all transcripts into structured insight report.
    research_goal is re-introduced here from intake (read from Supabase by route).

    Returns {
        "report": {...},
        "hallucination_check_passed": bool,
        "quotes_verified": int,
        "quotes_failed": int,
        "tokens_used": int,
        "input_tokens": int,
        "output_tokens": int,
    }
    """
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    system_prompt = load_prompt("agent4_synthesis")

    # Filter out excluded transcripts (user toggled at Gate 3)
    active_transcripts = [t for t in transcripts if not t.get("_excluded", False)]

    user_prompt = (
        f"Research goal: {intake['research_goal']}\n"
        f"Product description: {intake['product_description']}\n"
        f"Persona count: {len(active_transcripts)}\n\n"
        f"Transcripts:\n{json.dumps(active_transcripts, indent=2)}\n\n"
        f"Complete all four synthesis steps and return the structured insight report as a JSON object."
    )

    last_error: str = ""

    for attempt in range(settings.MAX_RETRY_ATTEMPTS + 1):
        prompt = user_prompt
        if attempt > 0:
            prompt += f"\n\nPrevious attempt failed validation: {last_error}. Fix these issues and return valid JSON."

        response = await client.messages.create(
            model=settings.AGENT4_MODEL,
            max_tokens=settings.AGENT4_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        if settings.ENABLE_DEBUG_LOGGING:
            print(
                f"[Agent 4] attempt={attempt+1} "
                f"input={response.usage.input_tokens} output={response.usage.output_tokens}"
            )

        raw = response.content[0].text

        try:
            report = _extract_json(raw)
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"synthesis_failed: {last_error}")

        errors, hallucination_results = validate_report(report, active_transcripts)

        if settings.ENABLE_DEBUG_LOGGING and errors:
            print(f"[Agent 4] validation errors: {errors}")

        # Only retry on structural errors — hallucination warnings are surfaced but don't block
        critical_errors = [e for e in errors if "HALLUCINATION" not in e]

        if not critical_errors:
            return {
                "report":                   report,
                "validation_warnings":      errors,
                "hallucination_check_passed": hallucination_results["quotes_failed"] == 0,
                "quotes_verified":          hallucination_results["quotes_verified"],
                "quotes_failed":            hallucination_results["quotes_failed"],
                "tokens_used":              response.usage.input_tokens + response.usage.output_tokens,
                "input_tokens":             response.usage.input_tokens,
                "output_tokens":            response.usage.output_tokens,
            }

        last_error = "; ".join(critical_errors)
        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"synthesis_failed: {last_error}")

    raise ValueError("synthesis_failed: exhausted retries")
