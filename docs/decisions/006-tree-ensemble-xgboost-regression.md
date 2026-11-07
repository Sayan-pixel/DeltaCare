# ADR-006: Tree Ensemble Model Selection (XGBoost)

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior ML Engineer, Data Scientist, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-003](003-unified-sklearn-pipeline.md)

---

## 1. Context
The target dataset (`insurance.csv`, 1,338 records) contains a massive, non-linear interaction effect between `bmi` and `smoker`:
- For a non-smoker, an increase in BMI from 25 to 35 results in a modest, linear increase in medical charges.
- For a smoker, that same increase in BMI results in an exponential, multi-thousand-dollar surge in medical charges.

---

## 2. Problem Statement
Which regression algorithm family should DeltaCare select to achieve an $R^2 \ge 0.85$ and $\text{MAE} \le \$2,000$ without requiring fragile manual polynomial feature engineering?

---

## 3. Decision
Select a **Gradient Boosted Tree Ensemble** implemented via **XGBoost** (`xgboost.XGBRegressor`):
1. Use `XGBRegressor` as the estimator within the unified `sklearn.pipeline.Pipeline`.
2. Use **SHAP** (SHapley Additive exPlanations) during training to quantify feature contributions and validate the What-If smoking delta logic.

---

## 4. Reasoning
- **Native Non-Linear Splitting**: Decision tree ensembles map multi-variable interaction splits (`if smoker == yes and bmi > 30`) natively without requiring manual interaction term engineering.
- **Superior Predictive Power**: Linear models (even with Lasso/Ridge regularization) struggle to exceed $R^2 \approx 0.75$ on this dataset without extensive feature fabrication. XGBoost consistently reaches $R^2 \ge 0.86$ and $\text{MAE} \le \$1,800$ out of the box.
- **Docker Wheel Stability**: XGBoost provides pre-built, highly optimized Linux CPU binary wheels that install cleanly in Docker without compilation toolchains.

---

## 5. Alternatives Considered
- **Alternative 1: Ordinary Least Squares (OLS) / Ridge Regression** $\rightarrow$ *Rejected*: Underfits the non-linear `smoker` $\times$ `bmi` interaction ($R^2 \approx 0.74$, failing quality benchmark).
- **Alternative 2: Deep Neural Network (MLP / PyTorch)** $\rightarrow$ *Rejected*: Massive overkill for 1,338 tabular rows; slower CPU inference; risk of overfitting.
- **Alternative 3: LightGBM** $\rightarrow$ *Evaluated*: Viable alternative, but XGBoost exhibits more consistent wheel installation across Python minor versions in Debian containers.

---

## 6. Advantages (Positive Consequences)
- High predictive accuracy ($R^2 \ge 0.85$, $\text{MAE} \le \$2,000$).
- Fast training ($< 2$ seconds on CPU) and ultra-low inference latency ($< 15\text{ms}$).
- Seamless integration with Scikit-learn Pipeline API.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Tree ensembles can overfit small datasets if tree depth and learning rate are unconstrained; requires conservative hyperparameter defaults (`max_depth=3`, `n_estimators=100`).

---

## 8. Technical Consequences
- `xgboost` added to `apps/api/requirements.txt`.

---

## 9. Security Implications
- Deterministic, non-stateful inference execution.

---

## 10. Operational & DevOps Implications
- Model training script runs headlessly in CI in $< 5\text{ seconds}$.

---

## 11. Constraints for Future Development
- Do not swap the regressor for an unvalidated linear model without running `scripts/audit_model.py`.

---

## 12. Reversal Conditions
- If a future actuarial dataset exhibits strictly linear mechanics or requires formal regulatory coefficient disclosures, re-evaluate regularized GLM regressors.

