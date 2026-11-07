# ADR-004: Stateless B2C Architecture for Phase 1 MVP

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Principal Software Architect, Senior Product Manager, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-002](002-zero-dollar-hosting-strategy.md), [ADR-005](005-in-memory-token-bucket-rate-limiting.md)

---

## 1. Context
Building a health insurance quoting platform presents an architectural fork: we can build a traditional stateful system (user accounts, authentication, relational database tables for saved quotes, session management) or a purely transactional, stateless calculation micro-product.

---

## 2. Problem Statement
Should DeltaCare's Phase 1 MVP introduce persistent user databases, user accounts, and session storage, or operate completely statelessly?

---

## 3. Decision
Architect Phase 1 (MVP) as a **100% Stateless B2C Public Consumer Tool**:
1. Zero database connections, ORMs, session tables, or persistent disk writes.
2. In-memory abuse prevention using `slowapi` token buckets (60 req/min per IP).
3. Client-side state handling for interactive What-If comparisons and debounced slider updates.
4. Architect the backend REST API to remain client-agnostic so that Phase 2 can inject Auth middleware and PostgreSQL without rewriting the core quoting logic.

---

## 4. Reasoning
- **Budget Compliance**: Eliminates all database hosting fees, connection pool overhead, and database provisioning requirements ($0 budget preserved).
- **Zero PII Liability**: The best way to protect consumer health data from data breaches or subpoena liabilities is to **never store it**. Stateless execution eliminates HIPAA and GDPR retention risks.
- **Maximum Execution Speed**: Processing transactions entirely in RAM results in sub-100ms inference times.
- **Rapid Validation**: Validates model accuracy and user experience in production before investing in heavy user-management infrastructure.

---

## 5. Alternatives Considered
- **Alternative 1: PostgreSQL + Prisma/SQLAlchemy in Phase 1** $\rightarrow$ *Rejected*: Adds database hosting overhead, connection pooling issues on free serverless platforms, and PII storage compliance liabilities for zero MVP user benefit.
- **Alternative 2: SQLite on Container Disk** $\rightarrow$ *Rejected*: Docker containers on free tiers are ephemeral; container restarts wipe the SQLite database, creating a false illusion of persistence.

---

## 6. Advantages (Positive Consequences)
- Zero database hosting costs.
- Zero PII compliance or breach liability.
- Ultra-low execution latency ($< 100\text{ms}$).
- Minimal architectural surface area for bugs and security vulnerabilities.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Consumers cannot bookmark, save, or retrieve historical quotes across browsing sessions in Phase 1.

---

## 8. Technical Consequences
- No ORMs (SQLAlchemy, Prisma) installed in `requirements.txt` or `package.json`.
- No database migration folders created in the repository.

---

## 9. Security Implications
- Vastly reduced attack surface: SQL injection is impossible because there is no SQL database.
- Zero credential storage eliminates credential-stuffing and session-hijacking vectors.

---

## 10. Operational & DevOps Implications
- No database backups, failover configurations, or migration scripts required.

---

## 11. Constraints for Future Development
- Do not introduce database models or persistent storage into Phase 1 application code.

---

## 12. Reversal Conditions
- Transition to stateful persistence in **Phase 2 (B2B Expansion)** when licensed insurance brokers require persistent client accounts, saved quotes, and agency management dashboards.

