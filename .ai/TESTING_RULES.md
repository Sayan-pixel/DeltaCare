# Testing Rules & Quality Gates: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior QA Engineer & Requirements Analyst  
**Status**: Authoritative Invariant Set  

---

## 1. Testing Philosophy

Testing is not an optional afterthought; it is an automated quality gate that prevents broken deployments and degraded machine learning predictions.

Every pull request or task execution must satisfy automated test suites across all three tiers:
1. **Machine Learning Model Benchmark Audit**
2. **Backend API Integration Tests**
3. **Frontend Component & UX Tests**

---

## 2. Machine Learning Benchmark Gate

Before any `model.joblib` artifact can be merged or deployed, the automated audit script (`scripts/audit_model.py`) must pass two non-negotiable benchmarks on unseen test data:

1. **Coefficient of Determination ($R^2$)**:
   $$\mathbf{R^2 \ge 0.85}$$
2. **Mean Absolute Error ($\text{MAE}$)**:
   $$\mathbf{\text{MAE} \le \$2,000.00}$$

```python
# scripts/audit_model.py gate logic
def test_model_benchmarks():
    r2, mae = evaluate_holdout_metrics()
    assert r2 >= 0.85, f"R2 score {r2:.4f} failed benchmark threshold of 0.85"
    assert mae <= 2000.00, f"MAE {mae:.2f} failed benchmark threshold of $2,000.00"
```

---

## 3. Backend API Test Suite (`apps/api/tests/`)

Backend tests use `pytest` and FastAPI's `TestClient`.

| Test File | Verification Scope | Success Criteria |
| :--- | :--- | :--- |
| `test_health.py` | `GET /health` | Status 200, latency $< 50\text{ms}$, schema match. |
| `test_predict.py` | `POST /predict` | Status 200, correct fields, monthly = annual / 12, floor $\ge \$1,000$. |
| `test_predict.py` | Schema Rejection | Status 422 on invalid age, negative children, or bad enums. |
| `test_rate_limit.py`| Abuse Throttling | Status 429 on the 61st request within a 60-second window. |
| `test_model_benchmarks.py` | CI ML Audit | Enforces $R^2 \ge 0.85$ and $\text{MAE} \le \$2,000$ during CI runs. |

---

## 4. Frontend Component Test Suite (`apps/web/tests/`)

Frontend tests use Jest / Vitest and React Testing Library.

| Test File | Verification Scope | Success Criteria |
| :--- | :--- | :--- |
| `Form.test.tsx` | Field Validation | Inputs reject out-of-range numbers; submit disabled while computing. |
| `BmiSlider.test.tsx` | Debounce Timing | Continuous dragging fires exactly 1 API call per 400ms pause. |
| `WhatIfBadge.test.tsx`| Smoking Delta | Badge appears when smoker is "yes"; disappears when "no". |
| `ColdStart.test.tsx` | Staged UX Timers | Verifies state changes at 2s (spinner) and 3s (skeleton wake-up). |

