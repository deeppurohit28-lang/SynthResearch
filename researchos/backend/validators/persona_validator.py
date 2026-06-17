from config import settings

_REQUIRED_FIELDS = [
    "id", "name", "age", "role", "location", "background",
    "goals", "frustrations", "behavioral_context",
    "relationship_to_problem", "tech_savviness", "quote",
]
_VALID_TECH_SAVVINESS = {"low", "medium", "high"}


def validate_personas(personas: list, expected_count: int) -> list[str]:
    errors: list[str] = []

    if not isinstance(personas, list):
        return ["Output is not a JSON array"]

    if len(personas) != expected_count:
        errors.append(f"Expected {expected_count} personas, got {len(personas)}")

    roles_seen: set[str] = set()

    for i, p in enumerate(personas):
        if not isinstance(p, dict):
            errors.append(f"Persona {i}: not a JSON object")
            continue

        for field in _REQUIRED_FIELDS:
            if field not in p or p[field] is None or p[field] == "":
                errors.append(f"Persona {i} ({p.get('name', '?')}): missing or empty '{field}'")

        role = p.get("role", "")
        if role in roles_seen:
            errors.append(f"Persona {i}: duplicate role '{role}'")
        roles_seen.add(role)

        frustrations = p.get("frustrations", [])
        if not isinstance(frustrations, list) or len(frustrations) < 1:
            errors.append(f"Persona {i} ({p.get('name', '?')}): needs at least 1 frustration")

        if not p.get("relationship_to_problem", "").strip():
            errors.append(f"Persona {i} ({p.get('name', '?')}): 'relationship_to_problem' is empty")

        tech = p.get("tech_savviness", "")
        if tech not in _VALID_TECH_SAVVINESS:
            errors.append(f"Persona {i} ({p.get('name', '?')}): invalid tech_savviness '{tech}'")

        quote = p.get("quote", "")
        if "as a " in quote.lower():
            errors.append(
                f"Persona {i} ({p.get('name', '?')}): quote contains generic 'as a [role]' pattern"
            )

    return errors
