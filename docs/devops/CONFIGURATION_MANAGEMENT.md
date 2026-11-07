# Configuration Management & Secret Hygiene: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior DevOps Engineer & Platform Architect  
**Status**: Authoritative DevOps Baseline  

---

## 1. Twelve-Factor Configuration Principles

DeltaCare strictly implements **Factor III (Config: Store config in the environment)** of the Twelve-Factor App methodology:
1. **Zero Hardcoded Configuration**: Ports, URLs, rate limits, and allowed origins must be read from environment variables at runtime via Pydantic `BaseSettings`.
2. **Codebase Invariance**: The identical Docker image and static JavaScript bundle must be capable of running in development, testing, staging, or production simply by changing injected environment variables.

---

## 2. Configuration Schema Specification (`apps/api/src/core/config.py`)

```python
from typing import List
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")
    PORT: int = Field(8000, env="PORT")
    CORS_ORIGINS: List[str] = Field(["http://localhost:3000"], env="CORS_ORIGINS")
    RATE_LIMIT_PER_MINUTE: int = Field(60, env="RATE_LIMIT_PER_MINUTE")
    MODEL_PATH: str = Field("models/model.joblib", env="MODEL_PATH")
    MINIMUM_PREMIUM_FLOOR: float = Field(1000.00, env="MINIMUM_PREMIUM_FLOOR")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
```

---

## 3. Secret Hygiene & Template Synchronization

- **Committed Templates**:
  - `apps/api/.env.example` documents all backend variables with safe default placeholders.
  - `apps/web/.env.example` documents all frontend variables with safe default placeholders.
- **Strictly Ignored Files**:
  - `.env`, `.env.local`, `.env.development.local`, `.env.production.local` are explicitly ignored in root `.gitignore`.
- **Git Push Protection**: Pre-commit hooks and GitHub secret scanning permanently block committing files containing secret key signatures.

