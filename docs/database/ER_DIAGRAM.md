# Entity-Relationship (ER) Diagram: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Database Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. Phase 1 Conceptual Entity Diagram (Stateless Transaction)

In Phase 1, data exists exclusively as a **transient transactional entity** during the HTTP request/response lifecycle:

```mermaid
erDiagram
    TRANSIENT_PREDICTION_REQUEST ||--|| MODEL_INFERENCE : processed_by
    MODEL_INFERENCE ||--|| PREDICTION_RESPONSE : generates

    TRANSIENT_PREDICTION_REQUEST {
        int age
        string sex
        float bmi
        int children
        string smoker
        string region
    }

    MODEL_INFERENCE {
        string model_version
        float inference_latency_ms
        float validation_mae
    }

    PREDICTION_RESPONSE {
        float predicted_annual
        float predicted_monthly
        float confidence_margin_annual
        float confidence_margin_monthly
        float range_annual_low
        float range_annual_high
        float range_monthly_low
        float range_monthly_high
        string currency
    }
```

---

## 2. Phase 2 Relational ER Diagram (Planned B2B Expansion)

The relational data model planned for Phase 2 links broker agencies, licensed agents, clients, and saved quote histories:

```mermaid
erDiagram
    AGENCIES ||--o{ BROKERS : employs
    BROKERS ||--o{ CLIENTS : manages
    BROKERS ||--o{ QUOTES : generates
    CLIENTS ||--o{ QUOTES : receives

    AGENCIES {
        uuid id PK
        string name
        string tier
        timestamp created_at
    }

    BROKERS {
        uuid id PK
        uuid agency_id FK
        string auth_id UK
        string email UK
        string full_name
        string license_number
        timestamp created_at
    }

    CLIENTS {
        uuid id PK
        uuid broker_id FK
        string first_name
        string last_name
        string email
        string phone
        timestamp created_at
    }

    QUOTES {
        uuid id PK
        uuid broker_id FK
        uuid client_id FK
        int age
        string sex
        float bmi
        int children
        string smoker
        string region
        float predicted_annual
        float predicted_monthly
        float margin_annual
        timestamp created_at
    }
```

### Explanation of Relationships
- An **Agency** employs one or more **Brokers** (`1:N`).
- A **Broker** manages multiple prospective **Clients** (`1:N`).
- A **Client** can receive multiple historical **Quotes** over time (`1:N`).
- A **Quote** belongs to exactly one **Broker** and one **Client** (`N:1`), capturing an immutable financial estimate at a specific point in time.

