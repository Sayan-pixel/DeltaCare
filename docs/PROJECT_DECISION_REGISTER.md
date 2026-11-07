# DeltaCare Project Decision Register

**File**: `docs/PROJECT_DECISION_REGISTER.md`  
**Status**: Living Master Governance Register  
**Maintained By**: Lead Software Architect, SRE Lead, AI Engineering Agents  
**Last Updated**: 2026-11-08  
**Scope**: All architectural, engineering, infrastructure, operational, and business decisions governing the DeltaCare SaaS platform.

---

## 1. Governance Rules & Lifecycle

This central register tracks every significant decision made across the preparation, foundation, implementation, and operational phases of DeltaCare.

1. **Sequential & Permanent IDs**: Decisions are assigned permanent identifiers (`DEC-001`, `DEC-002`, ...). Identifiers are never re-used or deleted.
2. **Status Progression**:
   - `Pending`: Under technical evaluation or open debate; awaiting stakeholder consensus.
   - `Proposed`: Formally documented with a corresponding RFC/ADR; submitted for approval.
   - `Approved`: Officially accepted and locked as authoritative project policy.
   - `Superseded`: Replaced by a newer decision (must reference replacement `DEC-xxx` ID).
   - `Rejected`: Formally rejected with rationale documented.
3. **Synchronization**: Every architectural decision in this register must link to either an Architecture Decision Record in [`docs/decisions/`](decisions/), a requirement in [`docs/REQUIREMENTS.md`](REQUIREMENTS.md), or a security/database governance document.
4. **AI Agent Mandate**: All AI coding agents working on DeltaCare must inspect this register before proposing or implementing changes that affect architecture, tech stack, data storage, or deployment.

---

## 2. Master Decision Register

| ID | Decision Title | Category | Status | Approval | Date | Authoritative Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEC-001** | Project Naming & Product Identity (`DeltaCare`) | Product | `Approved` | Project Lead | 2026-11-08 | [PROJECT_CHARTER.md](PROJECT_CHARTER.md) |
| **DEC-002** | Core Technology Stack (FastAPI + Next.js + XGBoost + Tailwind) | Architecture | `Approved` | Principal Architect | 2026-11-08 | [SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md) |
| **DEC-003** | Database Strategy (Phase 1 100% Stateless; Phase 2 PostgreSQL) | Data | `Approved` | Database Architect | 2026-11-08 | [ADR-004](decisions/004-stateless-b2c-mvp.md), [DATABASE_DESIGN.md](database/DATABASE_DESIGN.md) |
| **DEC-004** | Repository Topology (Decoupled Monorepo in `E:\DeltaCare`) | DevOps | `Approved` | DevOps Lead | 2026-11-08 | [ADR-001](decisions/001-decoupled-monorepo.md) |
| **DEC-005** | Hosting & Infrastructure ($0 Perpetual Budget: Vercel + HF Spaces) | Infrastructure | `Approved` | Platform Lead | 2026-11-08 | [ADR-002](decisions/002-zero-dollar-hosting-strategy.md) |
| **DEC-006** | Machine Learning Model Architecture (XGBoost Regressor) | Data Science | `Approved` | ML Engineer | 2026-11-08 | [ADR-006](decisions/006-tree-ensemble-xgboost-regression.md) |
| **DEC-007** | Model Pipeline Serialization (Unified Scikit-Learn `model.joblib`) | ML Ops | `Approved` | ML Engineer | 2026-11-08 | [ADR-003](decisions/003-unified-sklearn-pipeline.md) |
| **DEC-008** | Stateless Public B2C MVP Scope (Zero Auth/Sessions/PII in Phase 1) | Security | `Approved` | Security Architect | 2026-11-08 | [ADR-004](decisions/004-stateless-b2c-mvp.md), [DATA_PRIVACY.md](security/DATA_PRIVACY.md) |
| **DEC-009** | Rate Limiting & Abuse Prevention (`slowapi` 60 req/min Token Bucket) | Security | `Approved` | Security Architect | 2026-11-08 | [ADR-005](decisions/005-in-memory-token-bucket-rate-limiting.md) |
| **DEC-010** | Client-Side Input Debouncing (400ms Slider Damping) | Frontend | `Approved` | Frontend Lead | 2026-11-08 | [ADR-009](decisions/009-client-side-debounce-damping.md) |
| **DEC-011** | Cold-Start Mitigation UX (3-Stage Progressive Loader + Health Ping) | Frontend / UX | `Approved` | Product Lead | 2026-11-08 | [ADR-007](decisions/007-three-stage-cold-start-ux.md) |
| **DEC-012** | Prediction Uncertainty Display (Static Holdout Validation MAE Range) | ML / Product | `Approved` | Technical Lead | 2026-11-08 | [ADR-008](decisions/008-static-holdout-mae-confidence-bounds.md) |
| **DEC-013** | Telemetry & Observability (Zero-PII Structured JSON to STDOUT) | SRE / Privacy | `Approved` | SRE Lead | 2026-11-08 | [ADR-010](decisions/010-structured-stdout-log-sanitization.md) |
| **DEC-014** | Minimum Premium Floor Guardrail (Annual Premium Clamp $\ge \$1,000.00$) | Business Logic | `Approved` | Technical Lead | 2026-11-08 | [FUNCTIONAL_REQUIREMENTS.md](FUNCTIONAL_REQUIREMENTS.md) (FR-005) |
| **DEC-015** | What-If Counterfactual Engine (Instant Smoking Cessation Delta Badge) | Product / ML | `Approved` | Product Lead | 2026-11-08 | [FUNCTIONAL_REQUIREMENTS.md](FUNCTIONAL_REQUIREMENTS.md) (FR-006) |
| **DEC-016** | Pricing Metric Presentation (Monthly Hero Metric + Annual Subtitle) | Product / UX | `Approved` | Product Lead | 2026-11-08 | [FUNCTIONAL_REQUIREMENTS.md](FUNCTIONAL_REQUIREMENTS.md) (FR-007) |
| **DEC-017** | Statutory Non-Binder Legal Disclaimer (Mandatory UI Quote Footer) | Compliance | `Approved` | Compliance Lead | 2026-11-08 | [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) (AC-008) |
| **DEC-018** | CI/CD Quality Automation (GitHub Actions with Strict Lint/Type/Test Gates) | DevOps | `Approved` | Platform Lead | 2026-11-08 | [CI_CD_STRATEGY.md](devops/CI_CD_STRATEGY.md) |
| **DEC-019** | Model Evaluation Quality Gates (Holdout $R^2 \ge 0.85$, $\text{MAE} \le \$2,000$) | ML / QA | `Approved` | QA Lead | 2026-11-08 | [TEST_PLAN.md](testing/TEST_PLAN.md) (TC-011) |
| **DEC-020** | Container Isolation & Non-Root Execution (`deltacare:10001` User) | Security | `Approved` | Security Architect | 2026-11-08 | [SECURITY_ARCHITECTURE.md](security/SECURITY_ARCHITECTURE.md) |

---

## 3. Decision Summaries & Context

### DEC-001: Project Naming & Product Identity
- **Context**: The product requires an authoritative, clean, and memorable identity representing transparent, data-driven insurance premium estimation.
- **Decision**: Officially named **DeltaCare** (tagline: *"Transparent Health Insurance Premium Intelligence"*).
- **Impact**: Establishes directory structure, repository name, branding assets, and package identifiers (`deltacare-api`, `deltacare-web`).

### DEC-002: Technology Stack Selection
- **Context**: Rapid development, type-safe execution, zero-cost operation, high statistical performance.
- **Decision**: 
  - Backend: Python 3.11, FastAPI, Pydantic v2, Scikit-Learn, XGBoost, Uvicorn.
  - Frontend: Next.js 14 (App Router), TypeScript 5.x, React 18, Tailwind CSS, Lucide Icons.
- **Alternatives Rejected**: Flask (lacks async/native OpenAPI), Django (monolithic overhead), pure Scikit-Learn Linear Regression (insufficient non-linear interaction modeling).

### DEC-003: Database Strategy (Phase 1 Stateless)
- **Context**: Phase 1 MVP is a public consumer quote tool with no persistent user profiles or transaction histories.
- **Decision**: Zero database, zero ORM, and zero persistent storage for Phase 1. In-memory ephemeral evaluation only. Phase 2 roadmap designates managed PostgreSQL (e.g. Supabase Free Tier) if lead capture or user accounts are prioritized.
- **Impact**: Eliminates stateful infrastructure, zero database hosting cost, zero PII retention liability.

### DEC-004: Repository Topology (Decoupled Monorepo)
- **Context**: Both frontend and backend share domain models, mathematical invariants, and deployment workflows.
- **Decision**: Single unified monorepo hosted locally at `E:\DeltaCare` with `apps/api`, `apps/web`, and root governance.
- **Impact**: Synchronized versioning, atomic commits, cross-service CI workflows, single issue tracker.

### DEC-005: Perpetual $0 Hosting Strategy
- **Context**: Strict business requirement: $0 upfront and ongoing operational expenditure without relying on expiring credits.
- **Decision**: 
  - Frontend: Vercel Hobby Free Tier (global Edge CDN, unlimited static bandwidth within fair use).
  - Backend: Hugging Face Spaces Docker / FastAPI Free CPU Tier (2 vCPUs, 16 GB RAM, persistent container endpoint).
- **Alternatives Rejected**: AWS EC2/ECS (incurs perpetual cost), Heroku (no free tier), Render Free (512MB RAM causes OOM under ML load).

### DEC-006: ML Model Architecture (XGBoost)
- **Context**: Need accurate estimation of health insurance premiums conditioned on demographic and behavioral risk factors with complex non-linear interactions (e.g. `smoker` $\times$ `bmi`).
- **Decision**: Extreme Gradient Boosting (`XGBRegressor`) with early stopping, tuned via cross-validated RandomizedSearchCV.
- **Impact**: High fidelity ($R^2 \ge 0.85$, $\text{MAE} \le \$2,000$), rapid inference ($< 15\text{ms}$ execution latency), modest memory footprint ($< 120\text{MB}$).

### DEC-007: Unified Scikit-Learn Pipeline Serialization
- **Context**: Preventing train-serve skew between raw incoming JSON requests and feature tensors fed to XGBoost.
- **Decision**: Encapsulate preprocessing (`StandardScaler`, `OneHotEncoder`) and `XGBRegressor` inside a single Scikit-Learn `Pipeline`, serialized to a single `model.joblib` artifact.
- **Impact**: Backend performs `pipeline.predict(df_raw)` directly; eliminates manual feature engineering drift.

### DEC-008: Stateless Public B2C Architecture
- **Context**: Minimizing privacy compliance surface area (GDPR/HIPAA/CCPA) for consumer utility tool.
- **Decision**: No user registration, no cookies, no authentication sessions, zero personal data stored on disk or database.
- **Impact**: Full compliance by architecture; zero data breach liability for consumer queries.

### DEC-009: API Rate Limiting & Abuse Prevention
- **Context**: Hugging Face Spaces Free Tier backend must be protected from denial-of-service and automated web scraping.
- **Decision**: Deploy `slowapi` in-memory token bucket rate limiting enforcing a hard ceiling of 60 requests per minute per client IP (`X-Forwarded-For`).
- **Impact**: Prevents resource exhaustion without requiring external Redis infrastructure.

### DEC-010: Client-Side Input Debounce Damping
- **Context**: Continuous slider adjustments (e.g., BMI from 18 to 35) fire dozens of DOM events per second, which could overwhelm the API and trigger rate-limits.
- **Decision**: Apply custom 400ms debounce hook on all reactive slider and numeric form controls before initiating `POST /api/predict`.
- **Impact**: Reduces outbound network calls during slider manipulation by $> 90\%$.

### DEC-011: 3-Stage Cold-Start Progress UX
- **Context**: Free-tier serverless containers on Hugging Face Spaces spin down after periods of inactivity, causing a 15–45 second wake-up cold start.
- **Decision**: 3-stage progressive UX hierarchy (0–2s inline spinner $\rightarrow$ 3–10s informative wake-up progress bar $\rightarrow$ 20s abort timeout with friendly retry CTA) + optimistic background `GET /health` pre-warming on initial frontend page load.
- **Impact**: Prevents user abandonment during cold starts; provides immediate transparent feedback.

### DEC-012: Static Holdout Validation MAE Range Display
- **Context**: Machine learning predictions are point estimates; consumers need realistic uncertainty bounds without complex Monte Carlo or quantile re-training.
- **Decision**: Bundle static holdout test set Mean Absolute Error (MAE, e.g. $\pm \$1,850$) into the serialized model metadata and render an explicit confidence interval band (`[$X - \text{MAE}, X + \text{MAE}]`).
- **Impact**: Communicates estimation uncertainty transparently and honestly.

### DEC-013: Zero-PII Structured Logging to STDOUT
- **Context**: Backend monitoring without cloud logging bills or privacy leakage.
- **Decision**: Emit structured JSON logs to `STDOUT` only; automatically redact or omit IP addresses, exact DOBs, and user identifiers.
- **Impact**: Native container log collection via Hugging Face Spaces logs; zero privacy risk.

### DEC-014: Minimum Premium Floor Guardrail ($1,000/year)
- **Context**: Actuarial minimum floor for catastrophic ACA health insurance plans; prevents regression artifacts from outputting unrealistically low or negative premiums.
- **Decision**: Enforce mathematical floor `final_premium = max(1000.0, raw_predicted_premium)` in API layer.
- **Impact**: Prevents absurd outputs for edge cases; satisfies actuarial realism.

### DEC-015: What-If Counterfactual Smoking Cessation Engine
- **Context**: Smoking status is the highest-weight coefficient in health insurance pricing; users want actionable insights.
- **Decision**: For smoking users, compute a secondary counterfactual prediction with `smoker = 'no'` and display an instant annual savings badge (`"Quitting could save you $X,XXX/year"`).
- **Impact**: High user engagement; transforms passive quote calculation into a motivational wellness tool.

### DEC-016: Primary Monthly Metric Presentation
- **Context**: Consumers budget healthcare and insurance on a monthly cash-flow basis, while actuarial models predict annual charges.
- **Decision**: Render monthly premium ($\text{Annual} / 12$) as the large hero metric; display total annual premium as secondary subtitle.
- **Impact**: Matches consumer mental model and reduces cognitive friction.

### DEC-017: Statutory Non-Binder Legal Disclaimer
- **Context**: DeltaCare is an educational estimation tool, not a licensed insurance broker, underwriter, or health plan.
- **Decision**: Permanently display a visible disclaimer below the prediction card stating quotes are non-binding estimates.
- **Impact**: Mitigates legal exposure and regulatory liability.

### DEC-018: CI/CD Quality Automation Gates
- **Context**: Maintaining high engineering standards without dedicated QA staff.
- **Decision**: GitHub Actions pipeline enforcing `ruff check`, `ruff format`, `mypy --strict`, `pytest --cov=90`, `eslint`, and `npm run build` on every pull request.
- **Impact**: Zero syntax, type, or regression defects merge into `main`.

### DEC-019: Automated Model Quality Gates
- **Context**: New model training runs must strictly match or exceed historical baseline performance.
- **Decision**: Model training script asserts $R^2 \ge 0.85$ and $\text{MAE} \le \$2,000.00$ on holdout test set before saving `model.joblib`.
- **Impact**: Prevents deployment of degraded ML pipelines.

### DEC-020: Rootless Docker Security Baseline
- **Context**: Securing backend container against container breakout and unauthorized privilege escalation.
- **Decision**: Hugging Face Spaces `Dockerfile` explicitly creates and runs under non-root UID 10001 (`deltacare`).
- **Impact**: Complies with least-privilege security benchmarks.

---

## 4. Pending & Proposed Decisions (Future Roadmaps)

| ID | Title | Status | Target Phase | Dependencies | Rationale / Trade-offs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEC-P01** | Lead Capture Persistence Layer | `Pending` | Phase 2 | User demand for email quotes | Evaluate Supabase PostgreSQL vs. Cloudflare D1 ($0 tier). |
| **DEC-P02** | User Authentication Provider | `Pending` | Phase 2 | Phase 2 lead capture | Evaluate Clerk vs. Supabase Auth for zero-cost tier. |
| **DEC-P03** | B2B Broker API Billing Gateway | `Pending` | Phase 3 | B2B API monetization | Evaluate Stripe Billing vs. LemonSqueezy for webhook checkout. |
| **DEC-P04** | Distributed Model Cache (Redis) | `Pending` | Phase 2 | $> 100\text{k}$ monthly visits | Evaluate Upstash Serverless Redis Free Tier if in-memory rate limiting becomes bottlenecked. |

---

## 5. Maintenance Instructions for AI Agents & Engineers

When adding or updating decisions:
1. Locate the next sequential ID (`DEC-021`, etc.).
2. Add a summary row to the **Master Decision Register** table (Section 2).
3. Add a corresponding detailed subsection in **Decision Summaries & Context** (Section 3).
4. If a decision supersedes an older one:
   - Change the old decision's status to `Superseded`.
   - Update its title/notes to link to the new decision ID.
   - Never delete the original decision record.
5. If changing an architectural or infrastructure decision, cross-reference and update the affected documents in `docs/decisions/`, `docs/architecture/`, and `docs/INDEX.md`.

