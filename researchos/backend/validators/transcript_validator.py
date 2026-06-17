from config import settings

_REQUIRED_TRANSCRIPT_FIELDS = ["persona_id", "persona_name", "responses"]
_REQUIRED_RESPONSE_FIELDS   = ["question_id", "question", "response", "tone", "quality_flag"]
_VALID_TONES         = {"positive", "neutral", "negative", "mixed"}
_VALID_QUALITY_FLAGS = {"adequate", "thin"}

_CHARACTER_BREAK_MARKERS = [
    "as an ai", "as a language model", "as an artificial intelligence",
    "i am an ai", "i'm an ai", "i don't actually", "i don't have personal",
]


def validate_transcript(transcript: dict) -> list[str]:
    errors: list[str] = []

    if not isinstance(transcript, dict):
        return ["Transcript is not a JSON object"]

    for field in _REQUIRED_TRANSCRIPT_FIELDS:
        if field not in transcript:
            errors.append(f"Missing field: '{field}'")

    for i, r in enumerate(transcript.get("responses", [])):
        if not isinstance(r, dict):
            errors.append(f"Response {i}: not a JSON object")
            continue

        for field in _REQUIRED_RESPONSE_FIELDS:
            if field not in r:
                errors.append(f"Response {i}: missing field '{field}'")

        tone = r.get("tone", "")
        if tone not in _VALID_TONES:
            errors.append(f"Response {i}: invalid tone '{tone}'")

        quality = r.get("quality_flag", "")
        if quality not in _VALID_QUALITY_FLAGS:
            errors.append(f"Response {i}: invalid quality_flag '{quality}'")

        response_text = r.get("response", "").lower()
        for marker in _CHARACTER_BREAK_MARKERS:
            if marker in response_text:
                errors.append(f"Response {i}: character break detected — '{marker}'")

    return errors


def fix_quality_flags(transcript: dict) -> dict:
    """Auto-correct quality_flag based on actual word count. Runs after model output."""
    for r in transcript.get("responses", []):
        word_count = len(r.get("response", "").split())
        r["quality_flag"] = "thin" if word_count < settings.THIN_RESPONSE_WORD_LIMIT else "adequate"
    return transcript
