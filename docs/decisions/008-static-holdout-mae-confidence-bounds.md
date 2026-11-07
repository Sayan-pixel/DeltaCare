# ADR-008: Statistical Confidence Margins via Validation MAE

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior Data Scientist, Product Manager, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-003](003-unified-sklearn-pipeline.md), [ADR-006](006-tree-ensemble-xgboost-regression.md)

---

## 1. Context
No regression model achieves 100% predictive accuracy. Presenting consumers with a rigid point estimate (e.g., "$362.50 / month") implies a false promise of underwriting precision. When the eventual policy premium differs from that exact number, consumer trust is destroyed.

---

## 2. Problem Statement
How should DeltaCare communicate the statistical uncertainty of its predictions to users in an honest, understandable, and computationally efficient manner?

---

## 3. Decision
Return and render a **statistical confidence range bracket** derived from the model's empirical holdout Mean Absolute Error ($\text{MAE}$):
1. The API response includes the point prediction and the margin: `{ "predicted_annual": float, "confidence_margin_annual": float, ... }`.
2. The UI renders this as a visible range: `[predicted - margin, predicted + margin]`, displayed directly beneath the hero price.

---

## 4. Reasoning
- **Empirical Honesty**: MAE directly quantifies the average expected dollar deviation on unseen data.
- **Consumer Trust**: Showing a range (e.g., "$330 – $395 / mo") correctly sets expectations that the figure is an actuarial ballpark rather than a binding quote.
- **Computational Simplicity**: Avoids training multiple quantile regression models (which would triple model artifact size and inference overhead) while delivering identical consumer clarity.

---

## 5. Alternatives Considered
- **Alternative 1: Rigid Point Estimate Only** $\rightarrow$ *Rejected*: Deceptive; creates false user expectations.
- **Alternative 2: Quantile Regression Forest (10th & 90th percentiles)** $\rightarrow$ *Rejected for Phase 1*: Triples model file size and memory footprint; static MAE is sufficient for MVP.

---

## 6. Advantages (Positive Consequences)
- Statistically sound and transparent consumer experience.
- Fast execution with zero added inference overhead.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- A constant additive margin assumes homoscedastic error distribution across all demographic subgroups.

---

## 8. Technical Consequences
- `QuoteResponse` schema in Pydantic includes `range_annual` and `range_monthly`.

---

## 9. Security & Legal Implications
- Strongly mitigates false advertising liabilities when paired with the non-binder disclaimer.

---

## 10. Operational & DevOps Implications
- Validation MAE is automatically updated during CI audit script execution.

---

## 11. Constraints for Future Development
- Never remove confidence range rendering from the frontend results view.

---

## 12. Reversal Conditions
- In Phase 3, evaluate dynamic heteroscedastic quantile regression if regional variance demands non-uniform bounds.

