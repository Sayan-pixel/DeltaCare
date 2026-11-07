# Schema Reference: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Database Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. Phase 1 In-Memory & File Schemas

In Phase 1, schemas are expressed as **Pydantic Data Models** and tabular CSV columns.

### 1.1 Ingestion Dataset Schema (`apps/api/data/insurance.csv`)
```sql
-- DDL Representation of the raw training dataset
CREATE TABLE insurance_dataset (
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    sex VARCHAR(6) NOT NULL CHECK (sex IN ('male', 'female')),
    bmi NUMERIC(4, 1) NOT NULL CHECK (bmi >= 10.0 AND bmi <= 60.0),
    children INTEGER NOT NULL CHECK (children >= 0 AND children <= 10),
    smoker VARCHAR(3) NOT NULL CHECK (smoker IN ('yes', 'no')),
    region VARCHAR(9) NOT NULL CHECK (region IN ('northeast', 'southeast', 'southwest', 'northwest')),
    charges NUMERIC(10, 2) NOT NULL CHECK (charges > 0.0)
);
```

### 1.2 Request Payload Schema (`QuoteRequest`)
```python
# Pydantic Schema representation
class QuoteRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    sex: Literal["male", "female"]
    bmi: float = Field(..., ge=10.0, le=60.0)
    children: int = Field(..., ge=0, le=10)
    smoker: Literal["yes", "no"]
    region: Literal["northeast", "southeast", "southwest", "northwest"]
```

---

## 2. Phase 2 Target Relational Table Schemas (PostgreSQL)

### 2.1 Table: `brokers`
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique broker identifier. |
| `agency_id` | `UUID` | `FOREIGN KEY REFERENCES agencies(id)` | `NULL` | Organization association. |
| `auth_id` | `VARCHAR(128)`| `UNIQUE NOT NULL` | None | External identity provider ID (Clerk/Cognito). |
| `email` | `VARCHAR(255)`| `UNIQUE NOT NULL` | None | Work email address. |
| `full_name` | `VARCHAR(100)`| `NOT NULL` | None | Legal name of licensed agent. |
| `license_no`| `VARCHAR(50)` | `NOT NULL` | None | State insurance license number. |
| `created_at`| `TIMESTAMPTZ` | `NOT NULL` | `NOW()` | Registration timestamp. |

### 2.2 Table: `clients`
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique client identifier. |
| `broker_id` | `UUID` | `FOREIGN KEY REFERENCES brokers(id) ON DELETE CASCADE` | None | Owning broker. |
| `first_name`| `VARCHAR(50)` | `NOT NULL` | None | Client given name. |
| `last_name` | `VARCHAR(50)` | `NOT NULL` | None | Client surname. |
| `email` | `VARCHAR(255)`| `NULL` | `NULL` | Optional contact email. |
| `phone` | `VARCHAR(20)` | `NULL` | `NULL` | Optional phone number. |
| `created_at`| `TIMESTAMPTZ` | `NOT NULL` | `NOW()` | Profile creation timestamp. |

### 2.3 Table: `quotes`
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique quote identifier. |
| `broker_id` | `UUID` | `FOREIGN KEY REFERENCES brokers(id) ON DELETE CASCADE` | None | Generating broker. |
| `client_id` | `UUID` | `FOREIGN KEY REFERENCES clients(id) ON DELETE CASCADE` | None | Target client. |
| `age` | `INTEGER` | `NOT NULL CHECK (age >= 18 AND age <= 100)` | None | Beneficiary age. |
| `sex` | `VARCHAR(6)` | `NOT NULL CHECK (sex IN ('male', 'female'))` | None | Gender. |
| `bmi` | `NUMERIC(4,1)`| `NOT NULL CHECK (bmi >= 10.0 AND bmi <= 60.0)` | None | BMI value. |
| `children` | `INTEGER` | `NOT NULL CHECK (children >= 0 AND children <= 10)` | None | Dependents count. |
| `smoker` | `VARCHAR(3)` | `NOT NULL CHECK (smoker IN ('yes', 'no'))` | None | Smoker status. |
| `region` | `VARCHAR(9)` | `NOT NULL CHECK (region IN ('northeast','southeast','southwest','northwest'))` | None | Residential region. |
| `predicted_annual` | `NUMERIC(10,2)` | `NOT NULL CHECK (predicted_annual >= 1000.00)` | None | Annual estimate. |
| `predicted_monthly`| `NUMERIC(10,2)` | `NOT NULL` | None | Monthly estimate. |
| `margin_annual` | `NUMERIC(10,2)` | `NOT NULL` | None | Error bound. |
| `created_at`| `TIMESTAMPTZ` | `NOT NULL` | `NOW()` | Quote generation timestamp. |

