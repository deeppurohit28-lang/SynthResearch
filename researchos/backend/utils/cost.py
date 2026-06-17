from config import settings


def calculate_cost(input_tokens: int, output_tokens: int, is_haiku: bool = False) -> float:
    if is_haiku:
        cost = (
            input_tokens * settings.COST_PER_1K_INPUT_TOKENS_HAIKU / 1000
            + output_tokens * settings.COST_PER_1K_OUTPUT_TOKENS_HAIKU / 1000
        )
    else:
        cost = (
            input_tokens * settings.COST_PER_1K_INPUT_TOKENS_SONNET / 1000
            + output_tokens * settings.COST_PER_1K_OUTPUT_TOKENS_SONNET / 1000
        )
    return round(cost, 6)


def estimate_run_cost(persona_count: int, question_count: int) -> tuple[float, int]:
    """Return (estimated_cost_usd, estimated_latency_seconds)."""
    # Token estimates per agent
    agent1_in  = 1200 + persona_count * 150
    agent1_out = 1500 + persona_count * 350

    agent2_in  = agent1_out + 800
    agent2_out = 300 + question_count * 250

    # Agent 3: one bundled call per persona (all questions + warmup + closing)
    agent3_in_per  = 900 + (question_count + 2) * 60
    agent3_out_per = (question_count + 2) * 280

    # Agent 4: all transcripts as input
    transcript_tokens = persona_count * (question_count + 2) * 200
    agent4_in  = transcript_tokens + 800
    agent4_out = 3000

    cost_sonnet = calculate_cost(
        agent1_in + agent2_in + agent4_in,
        agent1_out + agent2_out + agent4_out,
        is_haiku=False,
    )
    cost_haiku = calculate_cost(
        persona_count * agent3_in_per,
        persona_count * agent3_out_per,
        is_haiku=True,
    )

    total_cost = round(cost_sonnet + cost_haiku, 2)

    # Latency: Agent 3 runs all personas in parallel; questions are sequential within each
    agent3_latency = (question_count + 2) * 4   # ~4s per question, parallel across personas
    total_latency  = 30 + agent3_latency + 70   # agents 1+2 (~30s) + agent3 + agent4 (~70s)

    return total_cost, total_latency
