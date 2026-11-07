# AI Agent Governance Rules: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior Software Architect & Lead Engineer  
**Target Audience**: All AI Coding Agents, Pair Programmers, and LLM Engines  
**Mandate**: **STRICTLY ENFORCED** across all development turns  

---

## 1. Foundational Operating Principles

1. **The Repository is the Sole Source of Truth**:
   - Model memory, external conversation context, and assumptions are not authoritative.
   - All architectural decisions, feature specifications, and constraints must be read from and referenced back to the `docs/` hierarchy.
   - Never invent missing requirements or make silent assumptions. If a requirement is ambiguous, check `docs/OPEN_QUESTIONS.md` or prompt the Technical Lead.

2. **Phase Boundary Discipline**:
   - We are currently in the **Pre-Development Foundation Phase**.
   - Do **NOT** write application source code (e.g., implementing endpoints, training models, creating React pages) until the foundational stage has been formally signed off by the Technical Lead.
   - Do not install dependencies or initialize npm/pip frameworks without explicit approval.

3. **Strict $0 Perpetual Budget Enforcement**:
   - Any proposed package, dependency, or service that requires an active credit card, paid API credits, or cloud billing is strictly forbidden.
   - All architectural solutions must run permanently within Vercel's Hobby Free Tier and Hugging Face Spaces' Free CPU Docker Tier (16GB RAM / 2 vCPUs).

---

## 2. Code Quality & Architectural Integrity Rules

1. **Zero Train-Serve Skew Mandate**:
   - Preprocessing logic (`StandardScaler`, `OneHotEncoder`) must never be manually recoded inside the API handlers or frontend.
   - All transformations must be bundled into a single `sklearn.pipeline.Pipeline` object serialized into `model.joblib`.
   - The FastAPI inference endpoint must invoke `pipeline.predict(df)` directly on raw input values.

2. **Type Safety & Schema Integrity**:
   - **Backend**: Every endpoint must strictly enforce request and response validation using Pydantic models. No unvalidated dictionaries or generic `Request` bodies.
   - **Frontend**: Strict TypeScript typing. No `any` types. Synchronize TypeScript interfaces with Pydantic schemas.

3. **Stateless Privacy Standard**:
   - Never introduce code that captures, persists, or logs user PII (names, emails, phones, IP addresses).
   - Server logs must output structured operational metrics and omit input feature payloads.

4. **Security & Abuse Protection**:
   - All API endpoints must be protected by `slowapi` in-memory rate limiting (max 60 req/min per IP).
   - CORS middleware must strictly whitelist the Vercel production origin and `localhost:3000`.

---

## 3. Testing & Benchmark Quality Gates

1. **Automated Holdout Benchmarks**:
   - Automated tests must enforce the performance gates:
     - $R^2 \ge 0.85$
     - $\text{MAE} \le \$2,000$ (representing $\le \$166.67/\text{month}$)
   - Any pull request or commit that causes the model to fail these thresholds must be rejected.

2. **Mathematical Floor Guardrail**:
   - Backend logic must guarantee that no predicted annual charge falls below $\$1,000.00$.

3. **Cold-Start UX Guardrails**:
   - The frontend must never present an infinite hanging spinner or generic broken connection error.
   - Transitions must follow: 0–2s spinner $\rightarrow$ 3–10s skeleton wake-up message $\rightarrow$ 20s abort recovery reset.

