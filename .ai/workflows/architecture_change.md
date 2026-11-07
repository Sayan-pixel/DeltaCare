# Workflow: Architecture Modifications & ADR Creation

**Workflow ID**: WF-07  
**Category**: Architecture Governance  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow whenever proposing a change that affects cross-service boundaries, hosting platforms, serialization formats, or fundamental project invariants.

## 2. Inviolable Rule: ADR Required
No major architectural change may be implemented in code without a corresponding **Accepted Architecture Decision Record (ADR)** in `docs/decisions/`.

## 3. Procedure
1. Create a proposed ADR using [`docs/decisions/ADR_TEMPLATE.md`](../../docs/decisions/ADR_TEMPLATE.md).
2. Document context, problem statement, alternatives considered, advantages, and trade-offs.
3. Present the ADR to the Technical Lead for formal evaluation.
4. If approved, change status to `Accepted` and update `docs/decisions/README.md` and `docs/INDEX.md`.
5. Only after acceptance may implementation commence.

