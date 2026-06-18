import asyncio
import time
from collections import deque
import google.generativeai as genai
from config import settings

# Sliding-window rate limiter — shared across all agents in this process
_rpm_timestamps: deque = deque()
_rpm_lock = asyncio.Lock()
_RPM_CAP = 8  # conservative buffer below Gemini free tier 10 RPM limit


async def _acquire_rate_slot(agent_name: str = "Agent") -> None:
    """Block until a request slot is available within the RPM cap."""
    while True:
        async with _rpm_lock:
            now = time.monotonic()
            # evict timestamps older than 60s
            while _rpm_timestamps and now - _rpm_timestamps[0] >= 60:
                _rpm_timestamps.popleft()
            if len(_rpm_timestamps) < _RPM_CAP:
                _rpm_timestamps.append(now)
                if settings.ENABLE_DEBUG_LOGGING:
                    print(f"[{agent_name} Rate] Slot {len(_rpm_timestamps)}/{_RPM_CAP} acquired")
                return
            # at cap — wait until the oldest slot falls out of the window
            wait_sec = 60 - (now - _rpm_timestamps[0]) + 0.5
        if settings.ENABLE_DEBUG_LOGGING:
            print(f"[{agent_name} Rate] At RPM cap ({_RPM_CAP}/min), waiting {wait_sec:.1f}s...")
        await asyncio.sleep(wait_sec)


async def generate_content_with_retry(
    model: genai.GenerativeModel,
    prompt: str,
    generation_config: genai.GenerationConfig,
    agent_name: str = "Agent"
):
    """
    Wrap model.generate_content_async with a client-side sliding-window
    rate limiter (8 RPM cap) and backoff on 429 (quota) or 503 (transient) errors.
    """
    for api_attempt in range(6):
        await _acquire_rate_slot(agent_name)
        try:
            response = await model.generate_content_async(
                prompt,
                generation_config=generation_config,
            )
            return response
        except Exception as api_err:
            err_str = str(api_err)
            is_quota = "429" in err_str or "quota" in err_str.lower() or "resourceexhausted" in err_str.lower()
            is_transient = "503" in err_str or "unavailable" in err_str.lower()

            if (is_quota or is_transient) and api_attempt < 5:
                if is_quota:
                    backoff_sec = 30 * (api_attempt + 1)  # 30s, 60s, 90s, 120s, 150s
                else:
                    backoff_sec = (2 ** api_attempt) + 1  # 2s, 3s, 5s, 9s, 17s
                if settings.ENABLE_DEBUG_LOGGING:
                    print(f"[{agent_name} API Retry] {'Quota' if is_quota else 'Transient'} error (attempt {api_attempt+1}/6). Retrying in {backoff_sec}s... (Error: {err_str})")
                await asyncio.sleep(backoff_sec)
                continue

            raise api_err

    raise RuntimeError("API retry loop terminated unexpectedly without returning response")
