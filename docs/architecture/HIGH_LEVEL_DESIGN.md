# High-Level Design (HLD): DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Software Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-001](../decisions/001-decoupled-monorepo.md), [ADR-002](../decisions/002-zero-dollar-hosting-strategy.md), [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. High-Level System Workflow

The end-to-end execution flow of DeltaCare links browser event handling with low-latency containerized inference.

```mermaid
sequenceDiagram
    autonumber
    actor User as Anonymous Consumer
    participant Web as Next.js Web Client (Vercel)
    participant API as FastAPI Gateway (HF Spaces)
    participant ML as Serialized Pipeline (model.joblib)

    Note over User,Web: Page Mount & Pre-Warming
    Web->>API: GET /health (Non-blocking background ping)
    API-->>Web: 200 OK {"status": "healthy"}

    Note over User,Web: Actuarial Form Input
    User->>Web: Enters Age(35), BMI(28.5), Smoker(Yes)
    Web->>Web: Client-side validation & Debounce check

    Note over Web,API: Quoting Transaction
    User->>Web: Clicks "Get Instant Quote"
    Web->>Web: Sets loading state (0-2s spinner)
    Web->>API: POST /predict {"age": 35, "bmi": 28.5, "smoker": "yes", ...}
    
    API->>API: Check slowapi rate limit (IP token bucket)
    API->>API: Validate Pydantic QuoteRequest schema
    API->>ML: pipeline.predict(DataFrame)
    ML-->>API: Raw Prediction: $8,450.00
    API->>API: Apply math floor guardrail (max($8450, $1000))
    API-->>Web: 200 OK {"predicted_annual": 8450.0, "predicted_monthly": 704.17, "margin_annual": 1950.0}

    Note over Web,API: Dynamic What-If Calculation
    Web->>API: POST /predict {"age": 35, "bmi": 28.5, "smoker": "no", ...}
    API-->>Web: 200 OK {"predicted_annual": 5120.0, "predicted_monthly": 426.67}

    Note over Web,User: Presentation
    Web->>Web: Compute Delta: $8,450 - $5,120 = $3,330/yr
    Web->>User: Renders Primary Monthly ($704/mo), Range ($541-$866), Savings Badge ($3,330/yr), & Disclaimer
```

---

## 2. Component Design & Responsibilities

### 2.1 Web Presentation Component (`apps/web`)
- **Single-Page Form**: Captures 6 actuarial inputs with immediate browser-side validation.
- **Interactive Slider Component**: Provides a synchronized BMI slider and numeric input field wrapped in a 400ms debounce handler.
- **Dynamic Result Card**:
  - Emphasizes Monthly Premium as the dominant hero metric.
  - Computes and renders statistical confidence brackets ($\pm \text{MAE}$).
  - Computes counterfactual lifestyle deltas (Smoking Cessation savings badge).
- **Cold-Start Orchestrator**: Manages progressive UI feedback during dormant container wake-ups.

### 2.2 Quoting Engine API Component (`apps/api`)
- **Application Gateway**: Configured via FastAPI and served by Uvicorn.
- **Security & Throttling Subsystem**: Enforces CORS origin restrictions and in-memory rate limiting.
- **Schema Validation Gateway**: Guarantees typed contracts via Pydantic; rejects malformed inputs with HTTP 422.
- **In-Memory ML Singleton**: Pre-loads the serialized XGBoost pipeline on server startup to guarantee sub-100ms inference times.
- **Business Guardrail Filter**: Enforces mathematical floors to eliminate negative or absurd predictions.

---

## 3. Communication Protocols & Standards

| Communication Path | Protocol | Payload Format | Security Transport | Latency Target |
| :--- | :--- | :--- | :--- | :--- |
| **Browser $\rightarrow$ Vercel CDN** | HTTPS / HTTP/2 | HTML / JS / CSS bundle | TLS 1.3 | $< 200\text{ms}$ |
| **Browser $\rightarrow$ API Gateway** | HTTPS / REST | JSON (`QuoteRequest`) | TLS 1.3 + CORS | $< 100\text{ms}$ (active) |
| **Gateway $\rightarrow$ ML Singleton** | In-Process Memory | Pandas DataFrame | Process boundary | $< 5\text{ms}$ |

