# Architecture Decision Records (ADRs): DeltaCare

**Repository**: `E:\DeltaCare`  
**Location**: `docs/decisions/`  
**Authority**: Software Architecture Governance Lead & Technical Lead  
**Status**: Authoritative Decision Log  

---

## 1. Purpose of the ADR System

Architecture Decision Records (ADRs) capture significant architectural and technical choices made during the DeltaCare lifecycle, along with their context, trade-offs, and consequences.

All architectural decisions are summarized and cross-referenced in the central [**Project Decision Register**](../PROJECT_DECISION_REGISTER.md).

The records in this directory serve as the **permanent historical memory** of the project:
1. **Immutable History**: Accepted ADRs are never silently modified or deleted.
2. **Superseding Discipline**: If a decision changes, a new ADR is authored that explicitly references and supersedes the predecessor.
3. **AI Agent Compliance**: All AI coding agents interacting with this repository must verify that proposed implementations adhere strictly to the Accepted decisions listed below.

---

## 2. Decision Status Definitions

- **Proposed**: Under review by the Technical Lead; not yet authoritative.
- **Accepted**: Formally approved by the Technical Lead; mandatory across all implementations.
- **Rejected**: Formally evaluated and dismissed with recorded technical justification.
- **Deprecated**: Previously accepted, but no longer recommended or enforced.
- **Superseded**: Replaced by a subsequent ADR (which must be linked).

---

## 3. Master ADR Index

| ADR ID | Decision Title | Status | Date | Primary Domain |
| :--- | :--- | :---: | :---: | :--- |
| [ADR-001](001-decoupled-monorepo.md) | Adoption of Decoupled Monorepo Structure | **Accepted** | 2026-11-08 | Repository Architecture |
| [ADR-002](002-zero-dollar-hosting-strategy.md) | Perpetual $0 Infrastructure & Hosting Strategy | **Accepted** | 2026-11-08 | Infrastructure & DevOps |
| [ADR-003](003-unified-sklearn-pipeline.md) | Unified Scikit-Learn Pipeline Serialization | **Accepted** | 2026-11-08 | Machine Learning Architecture |
| [ADR-004](004-stateless-b2c-mvp.md) | Stateless B2C Architecture for Phase 1 MVP | **Accepted** | 2026-11-08 | Data & Persistence Architecture |
| [ADR-005](005-in-memory-token-bucket-rate-limiting.md) | In-Memory Token Bucket Abuse Prevention via slowapi | **Accepted** | 2026-11-08 | Security & Resilience |
| [ADR-006](006-tree-ensemble-xgboost-regression.md) | Tree Ensemble Model Selection (XGBoost) | **Accepted** | 2026-11-08 | Machine Learning Architecture |
| [ADR-007](007-three-stage-cold-start-ux.md) | 3-Stage Cold-Start Progress UX Hierarchy | **Accepted** | 2026-11-08 | Frontend & UX Architecture |
| [ADR-008](008-static-holdout-mae-confidence-bounds.md) | Statistical Confidence Margins via Validation MAE | **Accepted** | 2026-11-08 | Actuarial & Data Modeling |
| [ADR-009](009-client-side-debounce-damping.md) | Client-Side 400ms Debounce Traffic Damping | **Accepted** | 2026-11-08 | Frontend & Network Optimization |
| [ADR-010](010-structured-stdout-log-sanitization.md) | Zero-PII Structured Logging to STDOUT | **Accepted** | 2026-11-08 | Observability & Privacy |

---

## 4. How to Propose a New Decision

1. Copy [`ADR_TEMPLATE.md`](ADR_TEMPLATE.md) to a new file: `docs/decisions/XXX-title.md`.
2. Assign the next sequential 3-digit identifier.
3. Fill in all sections thoroughly, ensuring alternatives considered and trade-offs are documented objectively.
4. Set status to `Proposed` and present to the Technical Lead for review.

