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


async def regenerate_one_question(
    intake: dict,
    personas: list,
    existing_guide: dict,
    question_id: str,
) -> dict:
    """
    Generate one replacement question for the given question_id (Gate 2 regenerate).
    Returns {"question": {...}, "tokens_used": int, "input_tokens": int, "output_tokens": int}
    """
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    system_prompt = load_prompt("agent2_guide")

    persona_summary = _persona_landscape_summary(personas)
    remaining_questions = [q for q in existing_guide.get("questions", []) if q["id"] != question_id]
    existing_q_text = "\n".join(f"- [{q['id']}] {q['question']}" for q in remaining_questions)

    user_prompt = (
        f"Research goal: {intake['research_goal']}\n"
        f"Product description: {intake['product_description']}\n"
        f"Target user: {intake['target_user']}\n\n"
        f"Persona landscape:\n{persona_summary}\n\n"
        f"EXISTING QUESTIONS (do NOT duplicate these — generate one that covers different ground):\n"
        f"{existing_q_text}\n\n"
        f"Generate exactly 1 new core question with id \"{question_id}\" in this exact JSON format:\n"
        f"[{{\n"
        f'  "id": "{question_id}",\n'
        f'  "question": "string",\n'
        f'  "intent": "string (specific, not generic)",\n'
        f'  "follow_up_probes": ["string", "string"]\n'
        f"}}]\n\n"
        f"Return a JSON array containing exactly 1 question object."
    )

    last_error: str = ""

    for attempt in range(settings.MAX_RETRY_ATTEMPTS + 1):
        prompt = user_prompt
        if attempt > 0:
            prompt += f"\n\nPrevious attempt failed validation: {last_error}. Fix and return valid JSON."

        response = await client.messages.create(
            model=settings.AGENT2_MODEL,
            max_tokens=settings.AGENT2_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[Agent 2 regen] attempt={attempt+1} input={response.usage.input_tokens}")

        raw = response.content[0].text

        try:
            result = _extract_json(raw)
            questions = result if isinstance(result, list) else [result]
        except (json.JSONDecodeError, ValueError) as e:
            last_error = f"JSON parse error: {e}"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"question_regeneration_failed: {last_error}")

        if not questions:
            last_error = "Returned empty array"
            if attempt < settings.MAX_RETRY_ATTEMPTS:
                continue
            raise ValueError(f"question_regeneration_failed: {last_error}")

        q = questions[0]
        missing = [f for f in ["id", "question", "intent", "follow_up_probes"] if not q.get(f)]
        if not missing:
            if not isinstance(q.get("follow_up_probes"), list) or len(q["follow_up_probes"]) < 2:
                last_error = "follow_up_probes must have at least 2 items"
            else:
                return {
                    "question":     q,
                    "tokens_used":  response.usage.input_tokens + response.usage.output_tokens,
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                }
        else:
            last_error = f"Missing fields: {', '.join(missing)}"

        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"question_regeneration_failed: {last_error}")

    raise ValueError("question_regeneration_failed: exhausted retries")
