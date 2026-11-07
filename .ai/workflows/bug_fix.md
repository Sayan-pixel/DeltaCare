# Workflow: Bug Fix (Defect Repair)

**Workflow ID**: WF-02  
**Category**: Maintenance & Quality  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow whenever resolving a software defect, regression, mathematical inaccuracy, or unexpected runtime exception.

## 2. Required Context & Documentation
- Read the filed defect report in [`docs/testing/BUG_REPORTING.md`](../../docs/testing/BUG_REPORTING.md).
- Inspect [`docs/REQUIREMENTS.md`](../../docs/REQUIREMENTS.md) and [`docs/ACCEPTANCE_CRITERIA.md`](../../docs/ACCEPTANCE_CRITERIA.md) to establish intended behavior.

## 3. Initial Investigation & Test Reproduction
1. Formulate a hypothesis explaining why the bug occurs.
2. **Mandatory Step**: Author an automated test in `apps/api/tests/` or `apps/web/tests/` that reproduces the defect.
3. Execute the test and confirm that it **fails**. Never attempt to fix a bug without an automated failing test.

## 4. Approval Requirements (Permission Model)
- **NORMAL**: Localized fixes within existing function bodies.
- **RESTRICTED**: Fixes requiring modifications to API schemas, rate limits, or CORS policies.

## 5. Implementation Procedure
1. Create a dedicated branch: `fix/<bug-name>`.
2. Apply the minimal necessary patch to resolve the defect.
3. Run the reproduction test and confirm that it now **passes**.
4. Run the full regression test suite to guarantee zero collateral breakage.

## 6. Completion Criteria & Reporting
- Bug report status updated to resolved with test link.
- Output final report detailing root cause, files modified, and regression verification evidence.

