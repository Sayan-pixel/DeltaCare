# Workflow: Code Review & Quality Assurance

**Workflow ID**: WF-11  
**Category**: Quality Engineering  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when reviewing a pull request or evaluating generated code before merging into `main`.

## 2. Review Checklist (The 6 Pillars)
Every code review must systematically audit:
1. **Requirements Alignment**: Does the code directly satisfy an approved requirement in `docs/REQUIREMENTS.md`?
2. **Type Safety**: Are all Python types explicit (`mypy --strict`) and TypeScript types strict (zero `any`)?
3. **Security & Privacy**: Zero hardcoded credentials? Zero PII logged? Non-root Docker user?
4. **Test Coverage**: Are unit, API contract, and component tests present and passing?
5. **Statistical Integrity**: Did `scripts/audit_model.py` pass holdout benchmarks ($R^2 \ge 0.85$, $\text{MAE} \le \$2,000$)?
6. **Documentation Parity**: Is `docs/` updated to match?

## 3. Code Review Template
Output reviews using [`.ai/templates/CODE_REVIEW_TEMPLATE.md`](../templates/CODE_REVIEW_TEMPLATE.md).

