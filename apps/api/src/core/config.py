"""
Application Configuration for DeltaCare API
Loads environment variables from apps/api/.env or system environment.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Locate apps/api directory and .env file
API_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = API_DIR / ".env"

if ENV_FILE.exists():
    load_dotenv(ENV_FILE)


class Settings:
    """Central configuration class."""
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS origins
    _cors_raw: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

    # Rate limiting (requests per minute per client IP)
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

    # Model and metadata paths
    MODEL_PATH: Path = (API_DIR / os.getenv("MODEL_PATH", "models/model.joblib")).resolve()
    METADATA_PATH: Path = (API_DIR / "models" / "model_metadata.json").resolve()

    # Business logic guardrails
    MINIMUM_PREMIUM_FLOOR: float = float(os.getenv("MINIMUM_PREMIUM_FLOOR", "1000.00"))


settings = Settings()

