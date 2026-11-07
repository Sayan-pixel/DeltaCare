# Definition of Done (DoD): DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior QA Engineer & Engineering Lead  
**Status**: Authoritative Invariant Set  

---

## 1. Master Definition of Done Checklist

A task or feature in DeltaCare is **NOT DONE** until it satisfies every applicable criterion below:

```mermaid
checklist
  title Definition of Done Quality Gates
  "1. Code Quality & Formatting" : done
  "2. Strict Typing & Zero Any" : done
  "3. Automated Tests Green" : done
  "4. ML Benchmark Gates Pass" : done
  "5. Documentation Synchronized" : done
  "6. Zero Secrets / PII Exposed" : done
```

---

## 2. Granular Criteria by Domain

### 2.1 Backend Code (`apps/api/`)
- [ ] Code passes linting with `ruff` and typecheck with `mypy --strict`.
- [ ] Pydantic request and response schemas are strictly defined and validated.
- [ ] Mathematical floor guardrail ($\ge \$1,000$) is enforced.
- [ ] All new logic is covered by unit/integration tests in `apps/api/tests/`.
- [ ] All `pytest` runs exit with code `0`.
- [ ] Zero database dependencies introduced.
- [ ] Zero user PII logged or stored.

### 2.2 Machine Learning Pipeline (`scripts/` & `apps/api/src/ml/`)
- [ ] Transformations and regressor are bundled in a single `model.joblib` pipeline.
- [ ] Holdout audit script passes: $R^2 \ge 0.85$ and $\text{MAE} \le \$2,000$.
- [ ] Training script executes completely headlessly without manual interaction.

### 2.3 Frontend Client (`apps/web/`)
- [ ] Code passes `tsc --noEmit` without errors (zero `any` types).
- [ ] UI is fully responsive from 360px (mobile) to 1440px+ (desktop).
- [ ] BMI slider has 300–500ms debounce verified by test.
- [ ] Smoking cessation savings delta badge renders correctly.
- [ ] Non-binder underwriting disclaimer is visible beneath quote.
- [ ] Component tests pass with exit code `0`.

### 2.4 Documentation & Repository Integrity
- [ ] Corresponding specifications in `docs/` are updated to match any contract modifications.
- [ ] No temporary files, virtual environments, or un-ignored data files committed.
- [ ] Git status is clean and ready for Technical Lead inspection.

