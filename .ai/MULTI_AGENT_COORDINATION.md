# Multi-Agent Coordination Protocol: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior Software Architect & AI Governance Lead  
**Status**: Authoritative Invariant Set  

---

## 1. Domain Ownership Matrix

When multiple AI coding agents, subagents, or human developers collaborate on DeltaCare, conflicts are prevented by assigning explicit module ownership:

```mermaid
graph TD
    LeadAgent[Lead Orchestrator Agent]
    
    subgraph Agents
        ML_Agent[ML & Ingestion Agent]
        API_Agent[Backend API Agent]
        Web_Agent[Frontend UI Agent]
        QA_Agent[QA & Audit Agent]
    end
    
    LeadAgent --> ML_Agent
    LeadAgent --> API_Agent
    LeadAgent --> Web_Agent
    LeadAgent --> QA_Agent
    
    ML_Agent -->|Owns| F1[scripts/ & apps/api/src/ml/]
    API_Agent -->|Owns| F2[apps/api/src/ & apps/api/Dockerfile]
    Web_Agent -->|Owns| F3[apps/web/src/ & apps/web/public/]
    QA_Agent -->|Owns| F4[apps/api/tests/ & apps/web/tests/]
```

---

## 2. File Ownership Rules

| Domain / Subsystem | Primary Owner | Exclusive File Paths | Read-Only for Other Agents |
| :--- | :--- | :--- | :--- |
| **Machine Learning** | ML Specialist Agent | `scripts/ingest_data.py`<br>`scripts/train_model.py`<br>`apps/api/src/ml/` | `apps/api/models/model.joblib` |
| **Backend REST API** | Backend API Agent | `apps/api/src/main.py`<br>`apps/api/src/core/`<br>`apps/api/src/schemas/`<br>`apps/api/Dockerfile` | `docs/architecture/API_CONTRACT.md` |
| **Frontend Client** | Frontend UI Agent | `apps/web/src/`<br>`apps/web/package.json`<br>`apps/web/tailwind.config.js` | `apps/web/src/types/` |
| **QA & Verification** | QA Specialist Agent | `apps/api/tests/`<br>`apps/web/tests/`<br>`scripts/audit_model.py` | Full codebase |
| **Core Governance** | Technical Lead / Orchestrator | `AGENTS.md`<br>`.ai/`<br>`docs/` | All agents must treat as read-only rules |

---

## 3. Conflict Resolution & Contract Handshakes

1. **API Contracts are Shared Locks**:
   - If the Frontend Agent requires a new property from the backend (e.g., `confidence_margin_monthly`), it **cannot** edit the backend code directly.
   - It must request the Backend Agent to update `apps/api/src/schemas/quote.py` and obtain Technical Lead approval (Restricted Tier).
2. **Sequential Integration Testing**:
   - Backend API changes must pass `pytest` before the Frontend Agent writes UI components that consume them.
   - The ML Pipeline must output a verified `model.joblib` passing `scripts/audit_model.py` before the Backend Agent integrates it into `predictor.py`.

