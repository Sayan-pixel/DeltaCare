# ADR-001: Adoption of Decoupled Monorepo Structure

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior Software Architect, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: None  

---

## 1. Context
DeltaCare consists of two isolated runtime applications: a Python FastAPI machine learning prediction API and a TypeScript Next.js/React frontend web client. We require a repository architecture that supports independent, zero-downtime platform deployments (Vercel for frontend, Hugging Face Spaces for backend) while maintaining centralized documentation, automated CI/CD test gates, and AI agent governance in a single repository.

---

## 2. Problem Statement
Should DeltaCare be developed across multiple disparate Git repositories (Polyrepo) or unified within a single repository structure (Monorepo), given that cloud deployment targets are heterogeneous (Vercel vs. Hugging Face Spaces) and total operating budget is strictly $0.00?

---

## 3. Decision
Adopt a **Modular Decoupled Monorepo** umbrella located at `E:\DeltaCare`:
- `apps/api/`: Python FastAPI backend + Dockerfile (deployed directly to Hugging Face Spaces).
- `apps/web/`: Next.js frontend client + Tailwind CSS (deployed directly to Vercel).
- Root-level `docs/`, `scripts/`, `.ai/`, and `.github/` directories governing the whole system.

---

## 4. Reasoning
A decoupled monorepo gives us the best of both worlds:
1. **Single Source of Truth**: Centralized documentation in `docs/` and AI agent governance in `.ai/` prevent context drift between frontend and backend.
2. **Platform Webhook Compatibility**: Both Vercel and Hugging Face natively support repository root directory filtering (e.g., setting root directory to `apps/web` on Vercel), allowing isolated continuous deployment.
3. **Synchronized End-to-End Testing**: Enables unified GitHub Actions workflows to test frontend components against API schemas in a single PR check.

---

## 5. Alternatives Considered
- **Alternative 1: Separate Polyrepos (`deltacare-api` and `deltacare-frontend`)** $\rightarrow$ *Rejected*: Fractures architectural documentation; forces cross-repository commits for API schema synchronization; makes multi-agent governance significantly harder.
- **Alternative 2: Tightly Coupled Full-Stack Monolith (Django/FastAPI serving Jinja/React SSR)** $\rightarrow$ *Rejected*: Violates edge CDN caching advantages on Vercel; severely inflates backend Docker memory usage beyond Hugging Face free-tier limits.

---

## 6. Advantages (Positive Consequences)
- Unified documentation, governance, and issue tracking.
- Isolated dependency manifests (`requirements.txt` vs. `package.json`) prevent dependency pollution.
- Atomic schema updates across backend Pydantic models and frontend TypeScript interfaces.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Requires path-filtering configurations in GitHub Actions to avoid triggering redundant backend builds when frontend code changes.

---

## 8. Technical Consequences
- **Codebase Impact**: Code is partitioned into `apps/api` and `apps/web`.
- **Dependency Impact**: Zero shared runtime dependencies between Python and Node.js.
- **Interface Impact**: Boundary communication strictly over standard HTTPS/JSON.

---

## 9. Security Implications
- Root-level `.gitignore` and `.gitattributes` protect the entire tree from committing credentials, virtual environments, or un-ignored datasets.

---

## 10. Operational & DevOps Implications
- Vercel project configuration sets root directory to `apps/web`.
- Hugging Face Spaces Docker build points to `apps/api`.

---

## 11. Constraints for Future Development
- Never import code across the `apps/api` and `apps/web` boundary directly via local relative paths. All communication must occur over HTTP/JSON interfaces.

---

## 12. Reversal Conditions
- If the repository size exceeds GitHub free storage limits or if distinct development teams require segregated Git access controls, split into independent Git repositories.

