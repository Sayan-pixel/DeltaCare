# ADR-005: In-Memory Token Bucket Abuse Prevention via slowapi

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior Security Architect, Backend Engineer, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-002](002-zero-dollar-hosting-strategy.md), [ADR-004](adr/004-stateless-b2c-mvp.md)

---

## 1. Context
DeltaCare exposes a public REST API on a free-tier Hugging Face Space. The frontend provides an interactive, debounced slider that allows users to adjust BMI dynamically. Because the API is publicly reachable, malicious scrapers or flood scripts could exhaust the container's 2 vCPUs if not properly throttled.

---

## 2. Problem Statement
How can DeltaCare enforce strict request rate limiting and abuse prevention on the backend API without introducing a paid Redis cluster or violating the $0.00 perpetual budget?

---

## 3. Decision
Implement an **in-memory token-bucket rate limiter** using the Python `slowapi` library:
1. Enforce a ceiling of **60 requests per minute per client IP address** on the `/predict` route.
2. If breached, return an immediate `HTTP 429 Too Many Requests` response with a standard `Retry-After: 60` header.
3. The frontend intercepts HTTP 429 and displays a polite user notice: *"Calculation limit reached. Please wait a moment before recalculating."*

---

## 4. Reasoning
- **Zero Cost**: `slowapi` operates directly inside process RAM using Python data structures, requiring no external Redis or Memcached service.
- **Slider Compatibility**: A 60 req/min limit paired with a 400ms frontend debounce provides more than enough headroom for human slider interaction (maximum realistic human input: ~20–30 req/min), while aggressively halting automated scrapers.
- **Fail-Safe Container Protection**: Drops malicious requests at the gateway before they can invoke Pandas or XGBoost inference routines.

---

## 5. Alternatives Considered
- **Alternative 1: Managed Redis Cluster (Upstash / Redis Cloud)** $\rightarrow$ *Rejected*: Free tiers have tight daily request limits (e.g., 10,000 commands/day) and introduce network hop latency and potential billing transitions.
- **Alternative 2: No Rate Limiting (Rely solely on CORS)** $\rightarrow$ *Rejected*: Direct curl/Postman scripts can forge headers or bypass CORS, risking CPU starvation.

---

## 6. Advantages (Positive Consequences)
- Protects container compute resources completely within process memory.
- Zero infrastructure cost or external network dependencies.
- Standard HTTP 429 compliance.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- If the container restarts or spins down, in-memory rate-limit counters are reset.
- In multi-process deployments, token buckets are isolated per process (acceptable for our single-container setup).

---

## 8. Technical Consequences
- `slowapi` added to `apps/api/requirements.txt`.
- Middleware mounted in `apps/api/src/main.py`.

---

## 9. Security Implications
- Defends against Layer 7 volumetric flooding and rapid scraping attacks.

---

## 10. Operational & DevOps Implications
- Token buckets consume negligible memory ($< 2\text{MB}$ for thousands of active IPs).

---

## 11. Constraints for Future Development
- Do not remove rate limiting from public prediction routes.

---

## 12. Reversal Conditions
- If the backend scales horizontally across multiple distributed container instances in Phase 2, migrate to a shared Redis-backed rate limiter.

