# ADR-009: Client-Side 400ms Debounce Traffic Damping

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior Frontend Engineer, Security Architect, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-005](005-in-memory-token-bucket-rate-limiting.md)

---

## 1. Context
DeltaCare features an interactive BMI slider allowing users to explore the cost impact of weight adjustments in real time. Continuous mouse or touch dragging on a slider can generate 50–100 input events per second. Dispatching network fetch requests on every tick would instantly trigger the backend rate limiter (60 req/min) and overwhelm the free-tier container.

---

## 2. Problem Statement
How should the frontend manage rapid slider scrubbing events to provide a fluid, real-time user experience while keeping API traffic strictly within backend rate-limiting bounds?

---

## 3. Decision
Implement client-side event damping using a **400ms debounce hook (`useDebounce`)**:
1. When the user scrubs the slider, local React state updates immediately to reflect the visual position.
2. The network dispatch is delayed until the user pauses scrubbing for $\ge 400\text{ms}$.
3. Once the 400ms threshold passes, a single `POST /predict` request is dispatched.

---

## 4. Reasoning
- **Traffic Reduction**: Damps API request volume by **$85–90\%$** during active interaction.
- **Perceptual Fluidity**: A 400ms delay feels instantaneous to human users while preventing self-DDoS.
- **Rate Limit Synergy**: Completely prevents legitimate users from triggering HTTP 429 rate limit errors while scrubbing.

---

## 5. Alternatives Considered
- **Alternative 1: Throttling instead of Debouncing** $\rightarrow$ *Rejected*: Throttling dispatches requests at fixed intervals during dragging, creating unnecessary intermediate network requests that the user has already scrolled past.
- **Alternative 2: Disabling Live Updates (Submit Button Only)** $\rightarrow$ *Rejected*: Destroys the interactive "What-If" exploration value proposition.

---

## 6. Advantages (Positive Consequences)
- Protects container compute from excessive network traffic.
- Provides a responsive, smooth user interface.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- A brief 400ms pause is required before the price card updates.

---

## 8. Technical Consequences
- `useDebounce.ts` hook created in `apps/web/src/hooks/`.

---

## 9. Security Implications
- Shields backend compute resources at the client layer.

---

## 10. Operational & DevOps Implications
- Drastically reduces CPU cycle consumption on Hugging Face Spaces.

---

## 11. Constraints for Future Development
- Any continuous slider or rapid input in the UI must be debounced by at least 300ms.

---

## 12. Reversal Conditions
- If the backend transitions to a dedicated high-throughput cluster and WebSockets are introduced for live streaming inference, debounce intervals may be reduced to $< 100\text{ms}$.

