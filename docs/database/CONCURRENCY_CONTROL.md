# Concurrency Control & Race Condition Prevention: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Database Architect & Systems Engineer  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md), [ADR-005](../decisions/005-in-memory-token-bucket-rate-limiting.md)

---

## 1. Concurrency Model: Phase 1 (MVP)

Phase 1 operates under an **Asynchronous Non-Blocking Event Loop** powered by Uvicorn and FastAPI.

```mermaid
flowchart LR
    Client1[Client 1 Req] --> Uvicorn[Uvicorn ASGI Event Loop]
    Client2[Client 2 Req] --> Uvicorn
    Client3[Client 3 Req] --> Uvicorn
    
    Uvicorn --> TokenCheck{slowapi Token Bucket\nThread-Safe Dict}
    TokenCheck -->|Token Available| ReadOnlyModel[ModelPredictor.predict()\nPure Read-Only In-Memory Math]
    TokenCheck -->|Token Exhausted| Reject429[HTTP 429 Drop]
    
    ReadOnlyModel --> Resp1[Response 1]
    ReadOnlyModel --> Resp2[Response 2]
```

### 1.1 Inherent Concurrency Safety
- **No Shared Mutable State**: Prediction requests do not modify shared global variables, database rows, or disk files.
- **Read-Only Model Invocation**: The fitted XGBoost tree structures and scaler weights in memory are completely immutable during inference. Multiple async requests execute predictions simultaneously against the same loaded pipeline without mutex locks or race conditions.
- **Rate-Limiter Thread Safety**: `slowapi` uses thread-safe timestamp comparisons for in-memory token replenishment.

---

## 2. Duplicate Submissions & Idempotency

### 2.1 Idempotency of Quoting Transactions
- The `POST /predict` calculation is **strictly pure and idempotent**:
  $$\forall \text{ identical inputs } x, \quad f(x) = y \quad (\text{deterministic result})$$
- Submitting the identical request 10 times produces the identical numerical quote without altering server state.

### 2.2 Client-Side Duplicate Submission Damping
- When the user clicks **"Get Instant Quote"**, the button disables immediately in the DOM, preventing accidental rapid double-clicking.
- The 400ms debounce hook absorbs rapid slider adjustments, ensuring that out-of-order responses do not cause stale data flicker in the UI.

---

## 3. Phase 2 Concurrency Control (Planned PostgreSQL B2B)

When Phase 2 introduces multi-user broker data persistence:
- **Optimistic Concurrency Control (OCC)**: Broker and client profile updates will include a `version: integer` column. Conflicting concurrent updates return `HTTP 409 Conflict` rather than silently overwriting data.
- **Pessimistic Row Locking (`FOR UPDATE`)**: Restricted exclusively to critical financial quote binding operations.

