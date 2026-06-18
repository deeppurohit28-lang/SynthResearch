import json
import google.generativeai as genai
from config import settings
from utils.prompt_loader import load_prompt
from utils.gemini_utils import generate_content_with_retry
from validators.guide_validator import validate_guide

_SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH",        "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",  "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT",  "threshold": "BLOCK_NONE"},
]


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
    system_prompt = load_prompt("agent2_guide")
    model = genai.GenerativeModel(
        model_name=settings.AGENT2_MODEL,
        system_instruction=system_prompt,
        safety_settings=_SAFETY_SETTINGS,
    )

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

        response = await generate_content_with_retry(
            model=model,
            prompt=prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=settings.AGENT2_MAX_TOKENS,
                response_mime_type="application/json",
            ),
            agent_name="Agent 2"
        )

        if settings.ENABLE_DEBUG_LOGGING:
            meta = response.usage_metadata
            print(f"[Agent 2] attempt={attempt+1} input={meta.prompt_token_count} output={meta.candidates_token_count}")

        raw = response.text

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
            meta = response.usage_metadata
            return {
                "guide":         guide,
                "tokens_used":   meta.total_token_count,
                "input_tokens":  meta.prompt_token_count,
                "output_tokens": meta.candidates_token_count,
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
    system_prompt = load_prompt("agent2_guide")
    model = genai.GenerativeModel(
        model_name=settings.AGENT2_MODEL,
        system_instruction=system_prompt,
        safety_settings=_SAFETY_SETTINGS,
    )

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

        response = await generate_content_with_retry(
            model=model,
            prompt=prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=settings.AGENT2_MAX_TOKENS,
                response_mime_type="application/json",
            ),
            agent_name="Agent 2 Regen"
        )

        if settings.ENABLE_DEBUG_LOGGING:
            meta = response.usage_metadata
            print(f"[Agent 2 regen] attempt={attempt+1} input={meta.prompt_token_count}")

        raw = response.text

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
                meta = response.usage_metadata
                return {
                    "question":      q,
                    "tokens_used":   meta.total_token_count,
                    "input_tokens":  meta.prompt_token_count,
                    "output_tokens": meta.candidates_token_count,
                }
        else:
            last_error = f"Missing fields: {', '.join(missing)}"

        if attempt >= settings.MAX_RETRY_ATTEMPTS:
            raise ValueError(f"question_regeneration_failed: {last_error}")

    raise ValueError("question_regeneration_failed: exhausted retries")
