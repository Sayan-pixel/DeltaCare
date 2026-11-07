# Workflow: API Contract Evolution

**Workflow ID**: WF-05  
**Category**: Interface Governance  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow whenever adding, modifying, or deprecating HTTP routes, request payloads, response schemas, or query parameters.

## 2. Inviolable Rule of Interface Changes
**API Changes are RESTRICTED Tier Operations**: Any change to `QuoteRequest` or `QuoteResponse` impacts both `apps/api` and `apps/web`. An AI agent must never unilaterally alter schemas without approval.

## 3. Impact Analysis & Approval Procedure
1. Create a [CHANGE_PROPOSAL.md](../templates/CHANGE_PROPOSAL.md).
2. Assess frontend impact: Does this require updating TypeScript interfaces, UI components, or error handlers?
3. Present the schema diff to the Technical Lead for explicit sign-off.

## 4. Implementation Procedure (Atomic Synchronization)
1. Update Pydantic models in `apps/api/src/schemas/`.
2. Update TypeScript interfaces in `apps/web/src/types/`.
3. Update API route handlers and validation tests.
4. Update frontend fetch client and component rendering.
5. Update [`docs/architecture/MODULE_BOUNDARIES.md`](../../docs/architecture/MODULE_BOUNDARIES.md) and OpenAPI specifications.

## 5. Verification
- API contract tests (`apps/api/tests/test_predict.py`) pass 100%.
- Frontend component tests (`apps/web/tests/`) pass with zero type errors.

