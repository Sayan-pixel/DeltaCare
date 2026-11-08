"""
Structured Operational Logging for DeltaCare API
Traceability: ADR-010 (Structured STDOUT Log Sanitization, Zero PII)
"""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict


class StructuredJsonFormatter(logging.Formatter):
    """
    Formats log records as single-line JSON objects to STDOUT.
    Ommits user demographic attributes, names, and PII.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }

        # Include structured extra fields if provided
        if hasattr(record, "request_id"):
            log_entry["request_id"] = getattr(record, "request_id")
        if hasattr(record, "method"):
            log_entry["method"] = getattr(record, "method")
        if hasattr(record, "path"):
            log_entry["path"] = getattr(record, "path")
        if hasattr(record, "status_code"):
            log_entry["status_code"] = getattr(record, "status_code")
        if hasattr(record, "duration_ms"):
            log_entry["duration_ms"] = getattr(record, "duration_ms")

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configures root logger with structured JSON handler."""
    logger = logging.getLogger("deltacare.api")
    logger.setLevel(level)

    # Avoid adding duplicate handlers on reload
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)

    # Prevent propagation to default root handler
    logger.propagate = False
    return logger


logger = setup_logging()

