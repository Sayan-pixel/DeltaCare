# Master Test Plan & Traceability Matrix: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal QA Architect  
**Status**: Authoritative Testing Baseline  

---

## 1. Master Requirements Traceability Matrix (RTM)

Every functional requirement (`FR-xxx`) and non-functional requirement (`NFR-xxx`) maps directly to testable acceptance criteria, explicit test cases, and verification commands.

| Req ID | Requirement Summary | Acceptance Criteria | Test Case ID | Test Category | Verification Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-001** | Scripted Data Ingestion | `AC-ML-01` | **TC-001** | Integration | `python scripts/ingest_data.py` |
| **FR-002** | Interaction-Aware Tree Model | `AC-ML-01` | **TC-002** | ML Benchmark | `python scripts/audit_model.py` |
| **FR-003** | Unified Pipeline Serialization | `AC-ML-02` | **TC-003** | Unit / ML | `pytest apps/api/tests/test_model_benchmarks.py` |
| **FR-004** | Health Check Endpoint | `AC-API-01` | **TC-004** | API Contract | `pytest apps/api/tests/test_health.py` |
| **FR-005** | Stateless Prediction Route | `AC-API-02` | **TC-005** | API Contract | `pytest apps/api/tests/test_predict.py` |
| **FR-006** | Mathematical Floor ($\ge \$1,000$) | `AC-API-02` | **TC-006** | Unit / Guardrail | `pytest apps/api/tests/test_predict.py -k floor` |
| **FR-007** | Single-Screen Form Capture | `AC-UI-01` | **TC-007** | Component / UI | `npm --prefix apps/web test Form.test.tsx` |
| **FR-008** | Dual Metric Presentation | `AC-UI-01` | **TC-008** | Component / UI | `npm --prefix apps/web test QuoteResult.test.tsx` |
| **FR-009** | Statistical Confidence Range | `AC-UI-01` | **TC-009** | Component / UI | `npm --prefix apps/web test QuoteResult.test.tsx` |
| **FR-010** | Dynamic Smoking What-If Badge | `AC-UI-02` | **TC-010** | E2E / Component | `npm --prefix apps/web test WhatIfBadge.test.tsx` |
| **FR-011** | Debounced BMI Slider (400ms) | `AC-UI-02` | **TC-011** | Unit / Hook | `npm --prefix apps/web test BmiSlider.test.tsx` |
| **FR-012** | Multi-Stage Cold-Start UX | `AC-UI-03` | **TC-012** | E2E / Recovery | `npm --prefix apps/web test ColdStart.test.tsx` |
| **FR-013** | Statutory Non-Binder Disclaimer | `AC-UI-01` | **TC-013** | Component / UI | `npm --prefix apps/web test LegalDisclaimer.test.tsx` |
| **NFR-001**| Perpetual $0 Cloud Hosting | N/A | **TC-014** | Architecture | Audit HF Spaces & Vercel Free-Tier Config |
| **NFR-002**| Model $R^2 \ge 0.85$ | `AC-ML-01` | **TC-015** | ML Benchmark | `python scripts/audit_model.py` |
| **NFR-003**| Model $\text{MAE} \le \$2,000$ | `AC-ML-01` | **TC-016** | ML Benchmark | `python scripts/audit_model.py` |
| **NFR-004**| Active Latency $\le 100\text{ms}$ | N/A | **TC-017** | Performance | `pytest apps/api/tests/test_performance.py` |
| **NFR-005**| Rate Limiting (60 req/min) | `AC-API-04` | **TC-018** | Security / API | `pytest apps/api/tests/test_rate_limit.py` |
| **NFR-006**| Strict CORS Origin Whitelist | N/A | **TC-019** | Security | `pytest apps/api/tests/test_cors.py` |
| **NFR-007**| Zero PII Retention (Stateless) | N/A | **TC-020** | Security / Audit | Inspect disk writes & STDOUT structured logs |

---

## 2. Test Execution Environment Matrix

| Tier | Host Platform | Runtime | Target Port | Automated Test Harness |
| :--- | :--- | :--- | :---: | :--- |
| **Local Dev** | Localhost (Windows/Linux) | Python 3.10 / Node 18+ | 8000 / 3000 | `pytest`, `npm test` |
| **CI Runner** | GitHub Actions (`ubuntu-latest`) | Python 3.10 / Node 18 | Headless | `.github/workflows/` |
| **Staging** | Preview Deployments | Vercel Edge / HF Space Dev | 443 / 7860 | Automated smoke checks via curl / Playwright |
| **Production** | Cloud Free Tiers | Vercel Global Edge / HF Spaces | 443 / 7860 | Passive health probes (`GET /health`) |

