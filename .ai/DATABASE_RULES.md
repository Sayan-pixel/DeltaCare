# Database & Persistence Rules: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior Software Architect & Database Engineer  
**Status**: Authoritative Invariant Set  

---

## 1. Phase 1 Policy: Strict Statelessness

In Phase 1 (MVP), **DeltaCare has NO DATABASE**.

### 1.1 Prohibited Actions in Phase 1
- **Do NOT** install ORM libraries (SQLAlchemy, Prisma, Tortoise, TypeORM).
- **Do NOT** initialize relational databases (PostgreSQL, MySQL, SQLite).
- **Do NOT** initialize document or key-value stores (MongoDB, DynamoDB, Redis).
- **Do NOT** create migration folders (`alembic/`, `prisma/migrations/`).
- **Do NOT** persist user quotes or session state to disk.

### 1.2 Rationale
- Complies strictly with the **$0 perpetual budget** requirement.
- Eliminates database hosting costs, maintenance overhead, and connection pooling issues on free serverless platforms.
- Eliminates all PII retention liability and compliance overhead.
- Maximizes API throughput by executing transactions purely in-memory.

---

## 2. Phase 2 Policy: Planned Relational Extension (B2B Expansion)

When transitioning to Phase 2 (B2B Broker Portal), persistence will be introduced under strict architectural guidelines:

1. **Approved Database**: PostgreSQL (via Supabase or Neon free-tier pools).
2. **Migration Discipline**:
   - All schema changes must be versioned via Alembic migrations.
   - Zero raw manual SQL execution on production instances.
3. **Strict Separation of Concerns**:
   - The core quoting calculation logic must remain stateless.
   - Persistence must wrap around quotes as an independent service layer (Broker accounts, Saved Quotes, Client profiles).
4. **Encryption**: All stored client demographic records must be encrypted at rest.

