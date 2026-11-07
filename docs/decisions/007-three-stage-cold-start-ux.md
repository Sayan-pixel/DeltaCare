# ADR-007: 3-Stage Cold-Start Progress UX Hierarchy

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior Frontend Engineer, UX Architect, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-002](002-zero-dollar-hosting-strategy.md)

---

## 1. Context
Hosting our backend API on Hugging Face Spaces' free tier incurs a 12–15 second container spin-up delay (cold start) after 48 hours of platform dormancy. A frozen screen or generic spinner for 15 seconds causes users to assume the application is broken and bounce immediately.

---

## 2. Problem Statement
How should the web frontend manage user perception and state during a 12–15 second backend container cold start without user abandonment or unhandled promise errors?

---

## 3. Decision
Implement a **3-stage psychological loading hierarchy** driven by React state timers:
1. **Stage 1 ($0 \le t < 2\text{s}$)**: Standard UI behavior. Submit button disables, shows an inline spinner, and updates text to *"Calculating..."*.
2. **Stage 2 ($2\text{s} \le t \le 10\text{s}$)**: The UI transitions into a **pulsating Skeleton Loader** where the price card will appear, with a calming status message: *"Waking up the pricing engine... (this takes a few seconds)"*.
3. **Stage 3 ($t > 20\text{s}$)**: A client-side `AbortController` trips to prevent infinite hanging, transitioning to an actionable recovery notice: *"Our servers are warming up. Please click calculate again."* with a prominent Retry button.

---

## 4. Reasoning
- **Psychological Time Perception**: Research shows that explaining *why* a delay is occurring (e.g., "Waking up the server") increases user wait tolerance from $\sim 4$ seconds to $> 20$ seconds.
- **Fail-Safe Recovery**: Hard timeouts prevent unhandled network errors and give users a clean path to retry once the container finishes booting.

---

## 5. Alternatives Considered
- **Alternative 1: Single Infinite Spinner** $\rightarrow$ *Rejected*: High bounce rate; users assume site has crashed.
- **Alternative 2: Paid Always-On Hosting** $\rightarrow$ *Rejected*: Violates the strict $0 perpetual budget constraint.

---

## 6. Advantages (Positive Consequences)
- Eliminates user abandonment during cold starts.
- Clean, professional UX that transparently handles free-tier realities.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Requires state timer management and skeleton component styling in the frontend.

---

## 8. Technical Consequences
- `ColdStartSkeleton.tsx` component created in `apps/web/src/components/`.
- `AbortController` configured in `apps/web/src/services/api.ts`.

---

## 9. Security Implications
- Prevents resource exhaustion from orphaned pending fetch requests.

---

## 10. Operational & DevOps Implications
- Masks free-tier cloud constraints entirely within frontend code.

---

## 11. Constraints for Future Development
- Never remove staged feedback timers from the frontend fetch hook.

---

## 12. Reversal Conditions
- If the backend migrates to a paid, always-on instance with zero cold starts, simplify to a standard single-stage spinner.

