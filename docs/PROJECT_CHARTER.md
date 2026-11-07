# Project Charter: DeltaCare

**Project Title**: DeltaCare  
**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Product Manager & Software Requirements Engineer  
**Status**: Approved Baseline  

---

## 1. Project Identity & Purpose

**DeltaCare** is a transparent, data-driven health insurance premium prediction SaaS micro-product designed to eliminate opacity, predatory lead harvesting, and underwriting friction from the health insurance exploration process.

The fundamental purpose of DeltaCare is to empower health plan shoppers with instantaneous, anonymous, and statistically reliable premium estimates, while illuminating the exact financial impact of controllable lifestyle choices (e.g., smoking cessation and BMI optimization).

---

## 2. Problem Statement Summary

The current health insurance quoting landscape presents severe friction for consumers and businesses alike:
- **Consumers**: Face aggressive sales tactics, forced disclosure of personally identifiable information (PII) before seeing quotes, and zero visibility into how personal health metrics dictate plan pricing.
- **Brokers/Providers**: Burn expensive human underwriting hours providing manual preliminary ballpark estimates to top-of-funnel leads that frequently abandon complex multi-page questionnaires.

---

## 3. Proposed Solution

A modern, decoupled, three-tier cloud micro-product operating on a strict **$0 perpetual hosting budget**:
1. **The Brain (ML Pipeline)**: An automated machine learning pipeline training a tree-based ensemble regressor (XGBoost/LightGBM) on the standard US Medical Cost Personal Dataset (`insurance.csv`), serialized as a unified transformer-regressor pipeline artifact.
2. **The Engine (Backend REST API)**: A lightweight, stateless Python FastAPI service exposing transactional `GET /health` and `POST /predict` endpoints, protected by in-memory rate limiting (`slowapi`) and strict CORS policies.
3. **The Face (Frontend Web UI)**: A responsive, high-performance Next.js/React and Tailwind CSS single-page interface deployed to edge CDN, featuring debounced dynamic inputs, interactive What-If calculation deltas, statistical confidence ranges, and cold-start UX guardrails.

---

## 4. Target Audience

- **Phase 1 Primary Target**: Self-directed US health insurance consumers who require instant, anonymous price discovery without sales pressure.
- **Phase 2 Expansion Target**: Independent health insurance brokers and agencies seeking an automated pre-underwriting and quote calculation engine.

---

## 5. Core Value Proposition

1. **Frictionless Anonymity**: 100% anonymous; zero personal identity capture (no names, phone numbers, emails, or accounts required).
2. **Instant Latency**: Sub-second execution for active sessions.
3. **Actionable Financial Transparency**: Direct quantification of lifestyle factor costs (e.g., *"Quitting smoking could save you ~$3,200/yr"*).
4. **Statistical Honesty**: Transparent display of prediction confidence intervals ($RMSE/MAE$-based) rather than deceptive, rigid point estimates.

---

## 6. Main Project Objectives & Success Criteria

| Objective | Metric Target | Verification Method |
| :--- | :--- | :--- |
| **Model Predictive Quality** | $R^2 \ge 0.85$, $\text{MAE} \le \$2,000$ | Automated holdout validation script |
| **Zero Operating Cost** | Perpetual **$0.00** total hosting spend | Vercel & Hugging Face Free Tier compliance |
| **API Throughput & Resilience** | $\le 100\text{ms}$ active inference; zero OOM crashes | Load testing & memory profiling on HF Space |
| **Abuse Protection** | Cap at 60 requests/min per IP | Automated rate-limit integration test suite |
| **Cold-Start Resilience** | 100% graceful handling of 15–20s wakeups | Frontend automated timer & state transitions |

---

## 7. Scope Summary

- **In Scope (Phase 1)**: Stateless actuarial input ingestion (6 features), model training and serialization, FastAPI prediction service, Next.js frontend with What-If delta badge, debounced BMI slider, cold-start optimistic pre-warming, and underwriting disclaimers.
- **Out of Scope (Phase 1)**: User accounts, authentication (JWT/OAuth), relational databases, payment processing, PDF quote generation, and binding policy issuance.

---

## 8. Constraints

- **Financial**: Exactly $0.00 budget. Zero reliance on paid services or credit-card-gated cloud services.
- **Architecture**: Decoupled Polyrepo structure; stateless execution for the backend.
- **Compute Limits**: Backend must fit within Hugging Face Spaces Free CPU tier (2 vCPUs, 16GB RAM). Frontend must comply with Vercel Hobby Free Tier limits.

---

## 9. Stakeholders & Governance

- **Product Owner / Lead Engineer**: Final authority on functional requirements, design decisions, and Git repository operations.
- **AI Coding Agents**: Responsible for strictly implementing verified requirements according to this documentation system without inventing features or deviating from standards.
- **End Consumers**: Evaluators of interface responsiveness, pricing clarity, and transparency.

