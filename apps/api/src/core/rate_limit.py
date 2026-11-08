"""
Rate Limiting Configuration for DeltaCare API
Traceability: ADR-005 (In-Memory Token Bucket Rate Limiting)
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# In-memory IP-based rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],  # Enforced explicitly per endpoint
    storage_uri="memory://",
)

