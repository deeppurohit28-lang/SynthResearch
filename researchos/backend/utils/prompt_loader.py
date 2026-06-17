from pathlib import Path


def load_prompt(agent: str) -> str:
    path = Path(__file__).parent.parent / "prompts" / f"{agent}_system.txt"
    return path.read_text(encoding="utf-8")
