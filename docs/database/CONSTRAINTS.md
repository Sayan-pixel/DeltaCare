# Data Constraints & Business Rules: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Database Architect & Data Integrity Engineer  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. Domain Constraints Overview

Data integrity in DeltaCare is protected through multiple defensive layers:
1. **Pydantic Model Constraints** (Online In-Memory Gateway).
2. **PostgreSQL Check & Unique Constraints** (Planned Phase 2 Relational Store).
3. **Mathematical Invariant Floors** (Post-Prediction Business Logic).

---

## 2. Check Constraints & Validation Bounds Matrix

| Data Attribute | Check Constraint / Validation Rule | Violation Response | Layer of Enforcement |
| :--- | :--- | :--- | :--- |
| **`age`** | `CHECK (age >= 18 AND age <= 100)` | HTTP 422: *"Age must be between 18 and 100"* | Pydantic (Phase 1) + RDBMS Check (Phase 2) |
| **`bmi`** | `CHECK (bmi >= 10.0 AND bmi <= 60.0)` | HTTP 422: *"BMI must be between 10.0 and 60.0"* | Pydantic (Phase 1) + RDBMS Check (Phase 2) |
| **`children`** | `CHECK (children >= 0 AND children <= 10)` | HTTP 422: *"Children count must be between 0 and 10"* | Pydantic (Phase 1) + RDBMS Check (Phase 2) |
| **`sex`** | `CHECK (sex IN ('male', 'female'))` | HTTP 422: *"Sex must be 'male' or 'female'"* | Pydantic (Phase 1) + RDBMS Check (Phase 2) |
| **`smoker`** | `CHECK (smoker IN ('yes', 'no'))` | HTTP 422: *"Smoker must be 'yes' or 'no'"* | Pydantic (Phase 1) + RDBMS Check (Phase 2) |
| **`region`** | `CHECK (region IN ('northeast', 'southeast', 'southwest', 'northwest'))` | HTTP 422: *"Invalid US region"* | Pydantic (Phase 1) + RDBMS Check (Phase 2) |
| **`predicted_annual`**| `CHECK (predicted_annual >= 1000.00)` | Clamped to `$1,000.00` by guardrail | Guardrail Module (Phase 1 & 2) |

---

## 3. Unique Constraints (Planned Phase 2)

- **`brokers.email`**: `UNIQUE NOT NULL` — Enforces single account registration per email.
- **`brokers.auth_id`**: `UNIQUE NOT NULL` — Prevents duplicate identity provider mapping.
- **`brokers.license_number`**: `UNIQUE NOT NULL` — Guarantees legitimate state licensing identification.

---

## 4. Nullability & Immutability Rules

- **Zero Nulls on Actuarial Fields**: In both Phase 1 payloads and Phase 2 quote records, actuarial features (`age`, `sex`, `bmi`, `children`, `smoker`, `region`) **must never be null**. Missing values cause calculation failure.
- **Immutable Quote Snapshots**: In Phase 2, historical quotes in the `quotes` table are **strictly append-only and immutable**. Once generated, a quote record cannot be edited via `UPDATE`; changes require generating a new quote row.

