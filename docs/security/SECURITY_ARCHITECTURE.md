# Security Architecture & Trust Boundaries: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Application Security Architect  
**Status**: Authoritative Security Baseline  
**Approved References**: [ADR-002](../decisions/002-zero-dollar-hosting-strategy.md), [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. Security Architecture Diagram & Trust Boundaries

DeltaCare partitions the system into three distinct Trust Zones separated by hardened security boundaries:

```mermaid
flowchart TB
    subgraph Zone_Untrusted [Zone 0: Untrusted Public Internet]
        BrowserUser[Anonymous User Browser]
        BotScraper[Malicious Bot / Scraper]
    end

    subgraph Zone_Edge [Zone 1: Edge DMZ - Vercel Network]
        EdgeShield[Vercel L3/L4 DDoS Shield]
        EdgeTLS[TLS 1.3 Termination]
        StaticAssets[Static Next.js Web Bundle]
    end

    subgraph Zone_Container [Zone 2: Execution Pod - Hugging Face Spaces]
        HFProxy[Hugging Face Reverse Proxy]
        
        subgraph DockerBoundary [Docker Non-Root Container Boundary :7860]
            CORSGate[CORSMiddleware Origin Gate]
            RateGate[slowapi Token Bucket 60 req/min]
            SchemaGate[Pydantic Type & Range Validator]
            InMemPipeline[In-Memory XGBoost Pipeline model.joblib]
            GuardrailGate[Mathematical Floor Guardrail]
            CleanSTDOUT[Sanitized STDOUT Logger]
        end
    end

    BrowserUser -->|HTTPS 443| EdgeShield
    BotScraper -->|HTTPS 443| EdgeShield
    EdgeShield --> EdgeTLS
    EdgeTLS --> StaticAssets
    
    BrowserUser -->|Direct REST POST /predict| HFProxy
    BotScraper -->|Direct REST POST /predict| HFProxy
    HFProxy --> CORSGate
    CORSGate --> RateGate
    RateGate --> SchemaGate
    SchemaGate --> InMemPipeline
    InMemPipeline --> GuardrailGate
    GuardrailGate --> CleanSTDOUT
```

---

## 2. Trust Boundary Definitions

### Trust Boundary 1: Public Internet $\rightarrow$ Edge Network (Zone 0 to Zone 1)
- **Protocol**: HTTPS over TLS 1.3 (TCP 443).
- **Controls**: Anycast routing, automated certificate rotation, volumetric Layer 3/4 DDoS absorption.
- **Threats**: Distributed Denial of Service (DDoS), DNS spoofing, man-in-the-middle (MitM).

### Trust Boundary 2: Web Client $\rightarrow$ API Gateway (Zone 0 to Zone 2)
- **Protocol**: REST over HTTPS / JSON.
- **Controls**:
  - `Access-Control-Allow-Origin: https://deltacare.vercel.app` (Blocks unauthorized browser contexts).
  - In-memory rate limiting via `slowapi` (Max 60 req/min per IP).
  - Pydantic schema validation (Drops malformed payloads with HTTP 422).
- **Threats**: Scraper flood attacks, adversarial payload injections, cross-site request forgery.

### Trust Boundary 3: API Gateway $\rightarrow$ In-Memory Engine (Zone 2 Internal)
- **Protocol**: Local process function execution.
- **Controls**:
  - Non-root user execution inside Docker (`USER appuser`).
  - Read-only serialized pipeline artifact (`model.joblib`).
  - Mathematical clamping floor preventing negative estimates.
- **Threats**: Deserialization exploits (RCE), out-of-memory container crashes.

---

## 3. Defense-in-Depth Layering

| Defense Layer | Mechanism | Implementation | Failure Mode |
| :--- | :--- | :--- | :--- |
| **Layer 1: Network** | Anycast + TLS 1.3 | Vercel Edge / HF Proxy | Connection dropped |
| **Layer 2: Origin** | CORS Whitelisting | FastAPI `CORSMiddleware` | HTTP 403 Forbidden |
| **Layer 3: Rate** | Token Bucket Throttling | `slowapi` in-memory | HTTP 429 Too Many Requests |
| **Layer 4: Schema** | Strict Bounds & Enums | Pydantic `BaseModel` | HTTP 422 Unprocessable Entity |
| **Layer 5: Business**| Value Clamping Floor | `apply_prediction_guardrail()` | Clamps to min $1,000.00 |
| **Layer 6: Logging**| Sanitized STDOUT | Structured JSON Logger | Raw payload omitted |

