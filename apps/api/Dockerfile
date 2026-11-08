# DeltaCare API - Production Dockerfile for Hugging Face Spaces
# Multi-arch compatible, unprivileged user (UID 1000), port 7860
# Traceability: NFR-006, NFR-009, ADR-002

FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer STDOUT/STDERR
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    ENVIRONMENT=production

# Create unprivileged application user for Hugging Face Spaces compliance
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install minimal system dependencies (curl for container health check)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pinned Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy serialized machine learning pipeline and source code
COPY --chown=appuser:appuser models/ models/
COPY --chown=appuser:appuser src/ src/

# Switch to unprivileged runtime user
USER appuser

EXPOSE 7860

# Container healthcheck instruction
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Launch ASGI server via Uvicorn binding to 0.0.0.0:7860
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]

