# Workflow: Database & Schema Evolution

**Workflow ID**: WF-04  
**Category**: Data Architecture  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Phase 1 Policy: Prohibited Database Actions
In Phase 1 (MVP), DeltaCare is **100% Stateless**. Any attempt by an AI agent to introduce relational databases, ORMs, session tables, or persistent disk stores without transitioning to Phase 2 is **strictly blocked** by the Permission Model.

---

## 2. Phase 2 Relational Migration Procedure (Planned B2B Expansion)

When Phase 2 is formally authorized by the Technical Lead, all schema changes must follow this workflow:

### Step 1: Investigation & Proposal (RESTRICTED)
- Author a formal proposal documenting the proposed tables, columns, indexes, and nullability.
- Verify zero impact on the core stateless quoting calculation engine.
- Obtain explicit written Technical Lead approval.

### Step 2: Migration Generation (Alembic)
- Generate a versioned Alembic migration script containing both `upgrade()` and `downgrade()`.
- Prohibit raw manual DDL statements in production.

### Step 3: Backward Compatibility & Non-Destructive Invariant
- New columns must be nullable or provide explicit defaults to prevent deployment race conditions.
- Renaming or dropping columns requires a multi-step deprecation cycle.

### Step 4: Staging Validation & Rollback Drill
- Execute migration against an isolated staging replica.
- Test rollback (`downgrade()`) and verify zero data corruption.
- Update [`docs/database/`](../../docs/database/) schema references and data dictionaries.

