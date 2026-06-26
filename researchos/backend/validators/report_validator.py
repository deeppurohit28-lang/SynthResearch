from config import settings

_REQUIRED_REPORT_FIELDS = [
    "research_goal", "persona_count", "themes", "cross_persona_patterns",
    "hypotheses", "recommendations", "confidence_disclaimer",
]
_REQUIRED_THEME_FIELDS = ["id", "title", "description", "frequency", "evidence_quotes"]
_REQUIRED_HYPOTHESIS_FIELDS = ["id", "statement", "confidence", "supporting_themes", "suggested_validation_method"]
_REQUIRED_REC_FIELDS = ["rank", "action", "rationale", "priority", "effort"]

_VALID_CONFIDENCE = {"low", "medium", "high"}
_VALID_PRIORITY   = {"high", "medium", "low"}
_VALID_EFFORT     = {"low", "medium", "high"}


def validate_report(report: dict, transcripts: list) -> tuple[list[str], dict]:
    """
    Returns (errors, hallucination_results).
    hallucination_results = {"quotes_verified": int, "quotes_failed": int}
    """
    errors: list[str] = []

    if not isinstance(report, dict):
        return ["Output is not a JSON object"], {"quotes_verified": 0, "quotes_failed": 0}

    for field in _REQUIRED_REPORT_FIELDS:
        if field not in report:
            errors.append(f"Missing field: '{field}'")

    # Build full-text lookup per persona for anti-hallucination check
    transcript_text: dict[str, str] = {}
    for t in transcripts:
        name = t.get("persona_name", "")
        full = " ".join(r.get("response", "") for r in t.get("responses", []))
        transcript_text[name] = full

    quotes_verified = 0
    quotes_failed   = 0

    # ── Themes ──────────────────────────────────────────────────
    themes = report.get("themes", [])
    if not (settings.MIN_THEMES <= len(themes) <= settings.MAX_THEMES):
        errors.append(f"Expected {settings.MIN_THEMES}–{settings.MAX_THEMES} themes, got {len(themes)}")

    # Themes must be ordered by frequency descending (US-06)
    freqs = [t.get("frequency", 0) for t in themes]
    if freqs != sorted(freqs, reverse=True):
        errors.append("themes must be ordered by frequency descending (most prevalent first)")

    for theme in themes:
        for field in _REQUIRED_THEME_FIELDS:
            if field not in theme:
                errors.append(f"Theme '{theme.get('id', '?')}': missing field '{field}'")

        quotes = theme.get("evidence_quotes", [])
        if len(quotes) < settings.MIN_EVIDENCE_QUOTES_PER_THEME:
            errors.append(
                f"Theme '{theme.get('id', '?')}': needs at least "
                f"{settings.MIN_EVIDENCE_QUOTES_PER_THEME} evidence quotes"
            )

        unique_personas = {q.get("persona_name") for q in quotes}
        if len(unique_personas) < settings.MIN_EVIDENCE_QUOTES_PER_THEME:
            errors.append(
                f"Theme '{theme.get('id', '?')}': quotes must come from "
                f"at least {settings.MIN_EVIDENCE_QUOTES_PER_THEME} different personas"
            )

        # Anti-hallucination: every quote must be verbatim in the transcript
        for q_obj in quotes:
            persona_name = q_obj.get("persona_name", "")
            quote_text   = q_obj.get("quote", "")
            source_text  = transcript_text.get(persona_name, "")

            if source_text and quote_text:
                if quote_text in source_text:
                    quotes_verified += 1
                else:
                    quotes_failed += 1
                    errors.append(
                        f"HALLUCINATION — Theme '{theme.get('id', '?')}': "
                        f"quote from {persona_name} not found verbatim in transcript: "
                        f"'{quote_text[:80]}...'"
                    )

    # ── Hypotheses ───────────────────────────────────────────────
    hypotheses = report.get("hypotheses", [])
    if not (settings.MIN_HYPOTHESES <= len(hypotheses) <= settings.MAX_HYPOTHESES):
        errors.append(
            f"Expected {settings.MIN_HYPOTHESES}–{settings.MAX_HYPOTHESES} hypotheses, "
            f"got {len(hypotheses)}"
        )

    for h in hypotheses:
        for field in _REQUIRED_HYPOTHESIS_FIELDS:
            if field not in h:
                errors.append(f"Hypothesis '{h.get('id', '?')}': missing field '{field}'")

        stmt = h.get("statement", "")
        for required_phrase in ["We believe", "will result in", "because"]:
            if required_phrase not in stmt:
                errors.append(
                    f"Hypothesis '{h.get('id', '?')}': statement missing '{required_phrase}'"
                )

        if not h.get("suggested_validation_method", "").strip():
            errors.append(f"Hypothesis '{h.get('id', '?')}': empty suggested_validation_method")

        confidence = h.get("confidence", "")
        if confidence not in _VALID_CONFIDENCE:
            errors.append(f"Hypothesis '{h.get('id', '?')}': invalid confidence '{confidence}'")

    # ── Recommendations ──────────────────────────────────────────
    recs = report.get("recommendations", [])
    if not (settings.MIN_RECOMMENDATIONS <= len(recs) <= settings.MAX_RECOMMENDATIONS):
        errors.append(
            f"Expected {settings.MIN_RECOMMENDATIONS}–{settings.MAX_RECOMMENDATIONS} recommendations, "
            f"got {len(recs)}"
        )

    # Ranks must be sequential from 1 (US-08)
    ranks = [rec.get("rank") for rec in recs if isinstance(rec.get("rank"), int)]
    if ranks and ranks != list(range(1, len(ranks) + 1)):
        errors.append(
            f"recommendation ranks must be sequential from 1, got {ranks}"
        )

    for rec in recs:
        for field in _REQUIRED_REC_FIELDS:
            if field not in rec:
                errors.append(f"Recommendation rank {rec.get('rank', '?')}: missing field '{field}'")

        if rec.get("priority", "") not in _VALID_PRIORITY:
            errors.append(f"Recommendation {rec.get('rank', '?')}: invalid priority")

        if rec.get("effort", "") not in _VALID_EFFORT:
            errors.append(f"Recommendation {rec.get('rank', '?')}: invalid effort")

    # ── Disclaimer ───────────────────────────────────────────────
    disclaimer = report.get("confidence_disclaimer", "").strip()
    if not disclaimer:
        errors.append("Missing confidence_disclaimer")

    return errors, {"quotes_verified": quotes_verified, "quotes_failed": quotes_failed}
