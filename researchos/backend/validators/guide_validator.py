_REQUIRED_GUIDE_FIELDS = ["research_goal", "warmup_question", "questions", "closing_question"]
_REQUIRED_QUESTION_FIELDS = ["id", "question", "intent", "follow_up_probes"]
_BINARY_STARTERS = ["do you", "have you", "is this", "can you", "will you", "did you", "are you"]


def validate_guide(guide: dict, expected_question_count: int) -> list[str]:
    errors: list[str] = []

    if not isinstance(guide, dict):
        return ["Output is not a JSON object"]

    for field in _REQUIRED_GUIDE_FIELDS:
        if field not in guide or not guide[field]:
            errors.append(f"Missing or empty field: '{field}'")

    questions = guide.get("questions", [])
    if len(questions) != expected_question_count:
        errors.append(f"Expected {expected_question_count} questions, got {len(questions)}")

    for i, q in enumerate(questions):
        if not isinstance(q, dict):
            errors.append(f"Question {i}: not a JSON object")
            continue

        for field in _REQUIRED_QUESTION_FIELDS:
            if field not in q or not q[field]:
                errors.append(f"Question {i}: missing or empty '{field}'")

        probes = q.get("follow_up_probes", [])
        if not isinstance(probes, list) or len(probes) < 2:
            errors.append(f"Question {i}: needs at least 2 follow-up probes")

        question_text = q.get("question", "").lower().strip()
        if any(question_text.startswith(s) for s in _BINARY_STARTERS):
            errors.append(
                f"Question {i}: likely binary/yes-no question — '{q.get('question', '')[:60]}'"
            )

        intent = q.get("intent", "").lower().strip()
        if intent in {"to understand the user", "to learn about the user", "to understand"}:
            errors.append(f"Question {i}: intent is too generic — be specific about what this surfaces")

    return errors
