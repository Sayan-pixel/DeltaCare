# Workflow: New Feature Implementation

**Workflow ID**: WF-01  
**Category**: Feature Development  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow whenever introducing new user-facing capabilities, UI components, API endpoints, or analytical features (e.g., adding a What-If comparison card or implementing debounced input controls).

## 2. Required Context & Documentation
- Read [`docs/SCOPE.md`](../../docs/SCOPE.md) to verify the feature is approved for the current phase.
- Read [`docs/FUNCTIONAL_REQUIREMENTS.md`](../../docs/FUNCTIONAL_REQUIREMENTS.md) for detailed functional specs.
- Read [`docs/ACCEPTANCE_CRITERIA.md`](../../docs/ACCEPTANCE_CRITERIA.md) for Gherkin criteria.

## 3. Initial Investigation & Impact Analysis
- Identify which application tier (`apps/api` or `apps/web`) is impacted.
- **Budget Audit**: Verify that the proposed feature requires zero paid cloud infrastructure or external paid APIs.
- **Memory Audit**: Verify that the feature does not push Docker memory beyond 2.0GB.
- **Privacy Audit**: Confirm that zero user PII is collected or persisted.

## 4. Approval Requirements (Permission Model)
- **NORMAL**: If the feature fits existing API schemas and frontend components, proceed autonomously.
- **RESTRICTED**: If the feature requires modifying `QuoteRequest`, `QuoteResponse`, or adding a dependency, submit a [CHANGE_PROPOSAL.md](../templates/CHANGE_PROPOSAL.md) and obtain explicit Technical Lead approval before implementing.

## 5. Implementation Procedure
1. Create a dedicated branch: `feat/<feature-name>`.
2. Author automated tests first (Test-Driven Development).
3. Implement minimal clean code satisfying strict typing (`mypy --strict`, TypeScript strict mode).
4. Verify non-negative prediction floors and rate limits are respected.

## 6. Testing Procedure
- Run unit and component tests: `pytest` and `npm test`.
- Verify holdout ML quality benchmarks if model code is touched (`R² >= 0.85`, `MAE <= $2,000`).
- Verify zero lint/type errors (`ruff`, `tsc`).

## 7. Documentation Updates
- Update [`docs/REQUIREMENTS.md`](../../docs/REQUIREMENTS.md) status to implemented.
- Update [`docs/architecture/`](../../docs/architecture/) if data flow or component trees changed.

## 8. Completion Criteria & Reporting
Follow the standard 12-point report format in [`.ai/TASK_EXECUTION_PROTOCOL.md`](../TASK_EXECUTION_PROTOCOL.md).

