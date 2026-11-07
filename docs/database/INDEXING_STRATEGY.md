# Indexing Strategy: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Database Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. Phase 1 Policy: In-Memory Token Hash Maps

In Phase 1 (MVP), **there are no database B-Trees or secondary indexes**.

The only index structures that exist in Phase 1 are:
1. **Python In-Memory Hash Maps (`dict`)**:
   - `slowapi` utilizes Python dictionaries for $O(1)$ IP lookup and token bucket decrement.
   - FastAPI dependency graphs resolve routing in $O(1)$ constant time.
2. **ColumnTransformer Internal Mapping**:
   - Scikit-learn's `ColumnTransformer` maintains static integer array slices for matrix operations.

---

## 2. Phase 2 PostgreSQL Indexing Strategy (Planned B2B Expansion)

When PostgreSQL persistence is provisioned in Phase 2, queries will be optimized using targeted B-Tree indexes aligned with broker access patterns:

```mermaid
graph TD
    subgraph QueryPatterns [Phase 2 Query Access Patterns]
        Q1[Pattern 1: Broker logs in\nLookup by auth_id]
        Q2[Pattern 2: Broker views client list\nFilter by broker_id, sort by name]
        Q3[Pattern 3: Broker views client quote history\nFilter by client_id, sort by created_at DESC]
    end

    subgraph Indexes [Target PostgreSQL Indexes]
        IDX1[CREATE UNIQUE INDEX idx_brokers_auth_id ON brokers(auth_id)]
        IDX2[CREATE INDEX idx_clients_broker_name ON clients(broker_id, last_name, first_name)]
        IDX3[CREATE INDEX idx_quotes_client_date ON quotes(client_id, created_at DESC)]
    end

    Q1 --> IDX1
    Q2 --> IDX2
    Q3 --> IDX3
```

---

## 3. Planned Index Specifications (Phase 2)

| Table | Index Name | Columns Indexed | Type | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `brokers` | `idx_brokers_auth_id` | `auth_id` | `B-Tree (UNIQUE)` | Sub-millisecond JWT authentication lookup. |
| `brokers` | `idx_brokers_agency` | `agency_id` | `B-Tree` | Resolves agency tenant rosters. |
| `clients` | `idx_clients_broker_name` | `(broker_id, last_name, first_name)` | `B-Tree (Composite)` | Paginated client list sorted alphabetically. |
| `quotes` | `idx_quotes_client_created` | `(client_id, created_at DESC)` | `B-Tree (Composite)` | Chronological quote timeline for client profile. |
| `quotes` | `idx_quotes_broker_created` | `(broker_id, created_at DESC)` | `B-Tree (Composite)` | Agency quote volume dashboards and audits. |

---

## 4. Index Maintenance & Performance Governance

- **Index Bloat Prevention**: Phase 2 tables will have `autovacuum` enabled with tuned aggressive thresholds to prevent index bloat on high-insert `quotes` tables.
- **No Over-Indexing**: Indexes are created strictly to serve verified query paths; arbitrary indexing on low-cardinality boolean columns (e.g., `smoker`) is prohibited.

