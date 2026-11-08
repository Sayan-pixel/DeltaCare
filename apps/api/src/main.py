"""
DeltaCare FastAPI Main Application Entrypoint
Exposes stateless health check and prediction endpoints.
Traceability: FR-004, FR-005, FR-006, ADR-002, ADR-005, ADR-010
"""

import time
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .core.config import settings
from .core.logging import logger
from .core.rate_limit import limiter
from .ml.model import model_service
from .schemas.quote import HealthResponse, QuoteRequest, QuoteResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: loads serialized ML pipeline on startup."""
    logger.info("Initializing DeltaCare API service...")
    try:
        model_service.load_model()
    except Exception as e:
        logger.error(f"Failed to load ML pipeline during startup: {e}", exc_info=True)
        # In development/test or if model missing, do not crash immediately so health endpoint can report state
    yield
    logger.info("Shutting down DeltaCare API service...")


app = FastAPI(
    title="DeltaCare API",
    description="Transparent, data-driven health insurance premium prediction REST API.",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# Attach rate limiter state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware isolation
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "X-Requested-With"],
)


class StructuredLoggingMiddleware:
    """
    Pure ASGI middleware enforcing zero PII retention.
    Logs HTTP operational metadata only: method, path, status, and duration.
    Avoids Starlette BaseHTTPMiddleware AnyIO deadlocks.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.perf_counter()
        status_code = [200]

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_code[0] = message["status"]
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
            logger.info(
                f"{scope.get('method', 'UNKNOWN')} {scope.get('path', '')} -> {status_code[0]} ({duration_ms}ms)",
                extra={
                    "method": scope.get("method"),
                    "path": scope.get("path"),
                    "status_code": status_code[0],
                    "duration_ms": duration_ms,
                },
            )


app.add_middleware(StructuredLoggingMiddleware)


@app.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    tags=["Monitoring"],
)
async def health_check() -> HealthResponse:
    """
    Returns service health and model initialization status.
    Traceability: FR-004
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        model_loaded=model_service.is_loaded,
    )


@app.post(
    "/predict",
    response_model=QuoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Health Insurance Premium Estimate",
    tags=["Prediction"],
)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def predict_premium(request: Request, quote_req: QuoteRequest) -> QuoteResponse:
    """
    Stateless actuarial quote calculation.
    Enforces business floor (>= $1,000/yr) and returns confidence intervals.
    Traceability: FR-005, FR-006, ADR-005, ADR-008
    """
    try:
        return model_service.predict(quote_req)
    except RuntimeError as re:
        logger.error(f"Inference error: {re}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": "Pricing engine is not ready. Please try again shortly."},
        )
    except Exception as exc:
        logger.error(f"Unexpected prediction failure: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal error occurred while calculating the estimate."},
        )

