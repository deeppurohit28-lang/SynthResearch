from contextlib import asynccontextmanager
import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from routes.run_routes import router as run_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    yield


app = FastAPI(
    title="ResearchOS API",
    version="0.1.0",
    lifespan=lifespan,
)


from starlette.middleware.base import BaseHTTPMiddleware

class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            print(f"[Error Handler Middleware] Caught unhandled exception: {exc}")
            message = str(exc)
            status_code = 500
            if "429" in message or "quota" in message.lower() or "resourceexhausted" in message.lower():
                status_code = 429
                err_msg = "Google Gemini API Quota Exceeded (429 Rate Limit). Please wait a minute and try again."
            else:
                err_msg = f"Internal Server Error: {message}"
            
            response = JSONResponse(
                status_code=status_code,
                content={
                    "detail": {
                        "message": err_msg,
                        "error": type(exc).__name__,
                        "retryable": True
                    }
                }
            )
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            return response


app.add_middleware(ExceptionHandlerMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(run_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
