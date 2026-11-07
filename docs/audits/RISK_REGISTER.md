# Comprehensive Risk Register: DeltaCare

**Document Version**: 1.0.0  
**Audit Date**: 2026-11-08  
**Lead Auditor**: Senior Risk & Security Analyst  
**Status**: Authoritative Risk Baseline  

---

## 1. Project Risk Profile & Matrix

```mermaid
quadrantChart
    title DeltaCare Residual Risk Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Likelihood --> High Likelihood
    quadrant-1 Unacceptable Risk (None)
    quadrant-2 Tolerable Operational Risk (R-01, R-02)
    quadrant-3 Negligible Technical Risk (R-05, R-06)
    quadrant-4 Managed Low-Severity Risk (R-03, R-04)
    "R-01: HF 15s Cold Start": [0.4, 0.7]
    "R-02: Scraping Abuse Surge": [0.5, 0.6]
    "R-03: Model Underwriting Misunderstanding": [0.7, 0.2]
    "R-04: Train-Serve Skew": [0.8, 0.1]
    "R-05: PII Data Breach": [0.9, 0.05]
    "R-06: Container Memory OOM": [0.7, 0.08]
```

---

## 2. Granular Risk Analysis & Active Mitigations

| Risk ID | Risk Title & Context | Initial Likelihood | Initial Impact | Active Architectural Mitigation | Residual Likelihood | Residual Impact | Status |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: | :---: |
| **R-01** | **Hugging Face 15s Cold Starts** | High | Medium | Optimistic `GET /health` pre-warming on DOM mount + 3-stage progress indicators (0–2s spinner $\rightarrow$ 3–10s skeleton $\rightarrow$ 20s abort). | Medium | Low | **Managed** |
| **R-02** | **Scraping / Container CPU Exhaustion** | High | Medium | Two-tier defense: 400ms client debounce damps requests by 90%; `slowapi` drops excess traffic at 60 req/min per IP with HTTP 429. | Low | Low | **Managed** |
| **R-03** | **Consumer False Underwriting Claims** | Medium | High | Prominently displayed statutory non-binder disclaimer directly beneath the quote card; statelessness prevents binding contracts. | Low | Low | **Managed** |
| **R-04** | **Train-Serve Skew & Feature Drift** | High | Critical | Single serialized `model.joblib` pipeline bundling `ColumnTransformer` + XGBoost; raw DataFrame passed to `predict()`. | Negligible | Critical | **Mitigated** |
| **R-05** | **Sensitive Health PII Data Leakage** | Low | Critical | Strict Statelessness: 0ms RAM purge; zero database; request bodies omitted from structured STDOUT logs. | Negligible | Low | **Mitigated** |
| **R-06** | **Container Out-of-Memory (OOM) Crash** | High (on 512MB) | High | Deployed to Hugging Face Spaces 16GB RAM tier, providing an $8\times$ memory safety buffer over peak 2.0GB ceiling. | Negligible | High | **Mitigated** |

---

## 3. Continuous Risk Review Cadence
- Risk levels are re-evaluated during monthly SRE reviews ([`docs/operations/MAINTENANCE_PROCEDURES.md`](../operations/MAINTENANCE_PROCEDURES.md)).
- Any newly discovered architectural vulnerability or cloud policy alteration triggers an immediate update to this register.

