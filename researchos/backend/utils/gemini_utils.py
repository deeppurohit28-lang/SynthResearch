import asyncio
import google.generativeai as genai
from config import settings

async def generate_content_with_retry(
    model: genai.GenerativeModel,
    prompt: str,
    generation_config: genai.GenerationConfig,
    agent_name: str = "Agent"
):
    """
    Wrap model.generate_content_async with exponential backoff on 429 (quota) or 503 (transient) errors.
    """
    for api_attempt in range(6):  # Retry up to 5 times (6 attempts total)
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
                    # RPM window is 60s — each retry waits progressively longer to clear it
                    backoff_sec = 30 * (api_attempt + 1)  # 30s, 60s, 90s, 120s, 150s
                else:
                    # Transient 503 — short exponential backoff is fine
                    backoff_sec = (2 ** api_attempt) + 1  # 2s, 3s, 5s, 9s, 17s
                if settings.ENABLE_DEBUG_LOGGING:
                    print(f"[{agent_name} API Retry] {'Quota' if is_quota else 'Transient'} error (attempt {api_attempt+1}/6). Retrying in {backoff_sec}s... (Error: {err_str})")
                await asyncio.sleep(backoff_sec)
                continue
            
            # If we've exhausted all attempts or if it is a different kind of exception, raise it
            raise api_err
            
    raise RuntimeError("API retry loop terminated unexpectedly without returning response")
