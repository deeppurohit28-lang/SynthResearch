import asyncio
import time
from collections import deque
import google.generativeai as genai
from config import settings

# Per-model rate limiter state — keyed by model name, initialized lazily.
# Safe in asyncio (single-threaded) — no lock needed for dict access itself.
_model_timestamps: dict = {}   # model_name -> deque of monotonic timestamps
_model_locks: dict = {}        # model_name -> asyncio.Lock


def _get_model_state(model_name: str):
    """Return (lock, timestamps) for a model, creating them on first access."""
    if model_name not in _model_locks:
        _model_locks[model_name] = asyncio.Lock()
        _model_timestamps[model_name] = deque()
    return _model_locks[model_name], _model_timestamps[model_name]


async def _acquire_rate_slot(model_name: str, agent_name: str = "Agent") -> None:
    """Block until a request slot is available for the given model's RPM cap."""
    rpm_cap = settings.MODEL_RPM_CAPS.get(model_name, 4)
    lock, timestamps = _get_model_state(model_name)

    while True:
        async with lock:
            now = time.monotonic()
            while timestamps and now - timestamps[0] >= 60:
                timestamps.popleft()
            if len(timestamps) < rpm_cap:
                timestamps.append(now)
                if settings.ENABLE_DEBUG_LOGGING:
                    print(f"[{agent_name} Rate:{model_name}] Slot {len(timestamps)}/{rpm_cap} acquired")
                return
            wait_sec = 60 - (now - timestamps[0]) + 0.5
        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[{agent_name} Rate:{model_name}] At cap ({rpm_cap}/min), waiting {wait_sec:.1f}s...")
        await asyncio.sleep(wait_sec)


def _classify_error(err_str: str) -> str:
    """
    Classify a Gemini API error into one of:
      'daily_quota' — RPD exhausted, retrying won't help until midnight
      'rpm_quota'   — per-minute rate limit, short backoff + retry
      'transient'   — 503 / unavailable, exponential backoff + retry
      'other'       — unrecognised, re-raise immediately
    """
    s = err_str.lower()
    is_quota = "429" in s or "quota" in s or "resourceexhausted" in s
    if is_quota:
        if "daily" in s or "per_day" in s or "per day" in s or "day_limit" in s or "perday" in s:
            return "daily_quota"
        return "rpm_quota"
    if "503" in s or "unavailable" in s:
        return "transient"
    return "other"


async def generate_content_with_retry(
    model: genai.GenerativeModel,
    prompt: str,
    generation_config: genai.GenerationConfig,
    agent_name: str = "Agent",
    model_name: str = "",
):
    """
    Wrap model.generate_content_async with:
      - Per-model sliding-window RPM rate limiter
      - Smart error classification: daily quota → fail fast, RPM → short retry, 503 → exponential
    """
    if not model_name:
        model_name = getattr(model, "model_name", "unknown").replace("models/", "")

    for api_attempt in range(6):
        await _acquire_rate_slot(model_name, agent_name)
        try:
            response = await model.generate_content_async(
                prompt,
                generation_config=generation_config,
            )
            return response

        except Exception as api_err:
            err_str = str(api_err)
            error_type = _classify_error(err_str)

            if error_type == "daily_quota":
                # Daily quota resets at midnight UTC — no point burning more retries
                raise RuntimeError(
                    f"[{agent_name}] Daily quota exhausted for {model_name}. "
                    f"Quota resets at midnight UTC. Switch models or wait. ({err_str[:200]})"
                )

            if error_type in ("rpm_quota", "transient") and api_attempt < 5:
                if error_type == "rpm_quota":
                    # Short exponential: rate limiter will queue the next slot anyway
                    backoff_sec = (2 ** api_attempt) * 5   # 5s, 10s, 20s, 40s, 80s
                else:
                    backoff_sec = (2 ** api_attempt) + 1   # 2s, 3s, 5s, 9s, 17s
                if settings.ENABLE_DEBUG_LOGGING:
                    print(
                        f"[{agent_name} Retry {api_attempt+1}/6] {error_type} on {model_name}. "
                        f"Backing off {backoff_sec}s... ({err_str[:120]})"
                    )
                await asyncio.sleep(backoff_sec)
                continue

            raise api_err

    raise RuntimeError(
        f"[{agent_name}] Retry loop on {model_name} exhausted without a response"
    )
