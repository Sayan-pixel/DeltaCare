# ADR-011: Decision Tree Regression Model Selection (CART)

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-20  
**Deciders**: Senior ML Engineer, Data Scientist, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-20  
**Related ADRs**: [ADR-003](003-unified-sklearn-pipeline.md), [ADR-008](008-static-holdout-mae-confidence-bounds.md)  
**Supersedes**: [ADR-006](006-tree-ensemble-xgboost-regression.md)

---

## 1. Context
The target dataset (`insurance.csv`, 1,338 records) exhibits a strong, non-linear interaction effect between `bmi` and `smoker`:
- For a non-smoker, an increase in BMI from 25 to 35 results in a modest, gradual increase in medical charges.
- For a smoker, that same increase in BMI crosses a severe threshold ($\text{BMI} \ge 30$) triggering a dramatic, multi-thousand-dollar surge in medical charges ($> \$30,000$).

Previously, DeltaCare employed an Extreme Gradient Boosting ensemble (`xgboost.XGBRegressor`, [ADR-006](006-tree-ensemble-xgboost-regression.md)). While accurate, XGBoost introduced significant architectural baggage:
- Native C++ shared library dependencies (`libgomp`, compiled OpenMP runtimes).
- Binary wheel incompatibilities and build overhead across Linux container architectures and newer Python runtimes (e.g., Python 3.12 wheel installation failures on Render/Alpine).
- An unnecessary model artifact weight ($220\text{ KB}$) for a relatively compact 1,338-row tabular domain.
- Black-box ensemble mechanics that make regulatory verification and exact rule-tree inspection more complex than necessary.

---

## 2. Problem Statement
Which regression algorithm family should DeltaCare select to satisfy actuarial quality benchmarks ($R^2 \ge 0.85$ and $\text{MAE} \le \$2,000$) while minimizing dependency complexity, ensuring 100% pure Scikit-Learn portability, eliminating native compilation toolchains, and providing transparent rule-based explainability?

---

## 3. Decision
Select a single **Classification and Regression Tree (CART)** regressor implemented via Scikit-Learn (`sklearn.tree.DecisionTreeRegressor`):
1. Configure `DecisionTreeRegressor` with:
   - `criterion="absolute_error"` (optimizing directly for Median/MAE-aligned loss, providing resilience against extreme outlier charges).
   - `max_depth=6` (strictly constraining tree depth to prevent leaf overfitting on the 1,338-row dataset).
   - `min_samples_leaf=10` (guaranteeing that each actuarial leaf node has sufficient empirical support, eliminating spurious non-monotonic smoking price reversals).
   - `random_state=42` (ensuring deterministic, reproducible training runs).
2. Integrate `DecisionTreeRegressor` directly into the unified `sklearn.pipeline.Pipeline` with `StandardScaler` and `OneHotEncoder(handle_unknown="ignore")`.
3. Fully remove `xgboost` from backend project dependencies (`requirements.txt`, Dockerfiles, Dependabot).
4. Update `model_metadata.json` and client-facing benchmarks to reflect holdout evaluation metrics ($R^2 = 0.8692$, $\text{MAE} = \$1,749.60$).

---

## 4. Reasoning
- **Benchmark Superiority**: The CART model achieves $R^2 = 0.8692$ (exceeding the $\ge 0.85$ requirement and matching the previous XGBoost baseline of $0.8695$) and $\text{MAE} = \$1,749.60$ (well below the $\le \$2,000$ ceiling).
- **Guaranteed Smoking Monotonicity**: Setting `min_samples_leaf=10` provides adequate sample regularization to ensure that smoking status never decreases estimated charges across any demographic profile combination ($0$ violations across $> 1,500$ paired profile audits).
- **Native Non-Linear Splitting**: Decision trees naturally partition feature space via orthogonal binary splits (`smoker == yes` $\rightarrow$ `bmi > 30`), capturing interaction thresholds cleanly without manual polynomial or feature interaction engineering.
- **Outlier Robustness via L1 Loss**: Using `criterion="absolute_error"` computes leaf predictions as median target values rather than sample means, preventing high-charge chronic outlier claims from distorting standard plan estimates.
- **Zero Native C++ Dependencies**: Running natively in pure Scikit-Learn eliminates `xgboost`, removing all C++ runtime link requirements, reducing vulnerability surface area, and ensuring frictionless multi-platform deployment (Windows, Linux, Docker, Python 3.11/3.12).
- **Ultra-Lightweight Footprint**: The serialized pipeline artifact is reduced by $> 94\%$ (from $220\text{ KB}$ down to $12.4\text{ KB}$), enabling sub-millisecond cold loading and negligible container memory consumption.
- **Actuarial Interpretability**: A depth-6 decision tree can be visually rendered, printed as pseudo-code decision rules, and audited deterministically by compliance or underwriting teams.

---

## 5. Alternatives Considered
- **Alternative 1: Retain XGBoost Ensemble** $\rightarrow$ *Rejected*: Unnecessary dependency overhead, potential container build breaks on new Python runtimes, and redundant model complexity when a single tree meets all benchmarks.
- **Alternative 2: Ordinary Least Squares (OLS) / Ridge Regression** $\rightarrow$ *Rejected*: Fails quality benchmarks ($R^2 \approx 0.74$, $\text{MAE} > \$2,500$) due to inability to model the non-linear `smoker` $\times$ `bmi` surge without manual feature interaction fabrication.
- **Alternative 3: Random Forest Regressor** $\rightarrow$ *Evaluated*: Achieves comparable accuracy, but introduces multi-tree ensemble overhead and larger artifact size without delivering practical accuracy gains over the tuned single CART tree.
- **Alternative 4: Multilayer Perceptron (MLP)** $\rightarrow$ *Rejected*: High risk of overfitting on 1,338 rows, non-transparent weights, and unnecessary CPU compute overhead.

---

## 6. Advantages (Positive Consequences)
- **Zero Train-Serve Skew**: Unified pipeline remains serialized as a single `model.joblib`.
- **Lightweight Runtime**: Fast container cold-starts on free hosting tiers (e.g. Render, Hugging Face Spaces).
- **Auditability**: Complete decision logic can be extracted and audited with `export_text` or `export_graphviz`.
- **Dependabot Simplicity**: Removes frequent C++ wrapper and security patch updates associated with native tree booster libraries.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Single trees produce piecewise constant step predictions rather than smooth continuous gradients. In an actuarial health insurance context, however, tiered price brackets are industry-standard and desirable.

---

## 8. Technical Consequences
- `xgboost` removed from `apps/api/requirements.txt` and `.github/dependabot.yml`.
- `scripts/train_model.py` and `scripts/audit_model.py` migrated to `DecisionTreeRegressor`.
- `apps/api/models/model.joblib` and `apps/api/models/model_metadata.json` updated.
- Frontend benchmarks and feature descriptions in `apps/web` updated to reference CART.

---

## 9. Security Implications
- Decreased attack surface due to fewer third-party binary dependencies.
- Completely deterministic, stateless inference execution.

---

## 10. Operational & DevOps Implications
- Model training executes in $< 1\text{ second}$ on standard CPU.
- Automated tests (`pytest`, `scripts/audit_model.py`) run in CI without needing pre-installed C++ compilers.

---

## 11. Constraints for Future Development
- Tree depth should remain constrained (`max_depth <= 8`, `min_samples_leaf >= 5`) during any retraining to prevent leaf memorization on small sample updates.

---

## 12. Reversal Conditions
- If the dataset expands into hundreds of thousands of multi-dimensional records where single-tree variance causes degradation below $R^2 < 0.85$, re-evaluate ensemble methods (Random Forest or Gradient Boosting).
