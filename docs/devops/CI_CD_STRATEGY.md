# CI/CD Automation Strategy: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior DevOps Engineer & Platform Architect  
**Status**: Authoritative DevOps Baseline  
**Approved References**: [ADR-001](../decisions/001-decoupled-monorepo.md), [ADR-002](../decisions/002-zero-dollar-hosting-strategy.md)

---

## 1. Automated Pipeline Architecture

DeltaCare's continuous integration and continuous deployment pipelines are powered by **GitHub Actions**, with decoupled deployment targets on **Vercel** and **Hugging Face Spaces**.

```mermaid
flowchart TD
    PR[Pull Request Submitted to main] --> Matrix{Decoupled Path Filters}
    
    subgraph CI_Gates [Automated GitHub Actions CI Quality Gates]
        Matrix -->|apps/api/** or scripts/**| APICI[api-ci.yml\nruff + mypy + pytest]
        Matrix -->|apps/web/**| WebCI[web-ci.yml\neslint + tsc + vitest]
        Matrix -->|model artifact or scripts/**| MLAudit[model-audit.yml\nassert R2 >= 0.85, MAE <= $2000]
        Matrix --> SecurityScan[security-scan.yml\nbandit + pip-audit + npm audit]
    end

    CI_Gates --> Merge[PR Approved & Merged to main]
    
    subgraph CD_Deployment [Continuous Deployment - Cloud Free Tiers]
        Merge --> VercelDeploy[Vercel Deploy Webhook\nEdge CDN Production Release]
        Merge --> HFDeploy[Hugging Face Spaces Git Sync\nDocker Image Build & Container Spin-up]
    end
```

---

## 2. GitHub Actions Workflow Specifications

### 2.1 Backend CI Workflow (`.github/workflows/api-ci.yml`)
- **Triggers**: Pull requests modifying `apps/api/**`, `scripts/**`, or `.github/workflows/api-ci.yml`.
- **Jobs**:
  1. **Lint & Style**: `ruff check apps/api/src apps/api/tests scripts`.
  2. **Static Typing**: `mypy --strict apps/api/src`.
  3. **Unit & API Tests**: `pytest apps/api/tests/ --cov=apps/api/src --cov-fail-under=85`.

### 2.2 Frontend CI Workflow (`.github/workflows/web-ci.yml`)
- **Triggers**: Pull requests modifying `apps/web/**` or `.github/workflows/web-ci.yml`.
- **Jobs**:
  1. **Linting**: `npm --prefix apps/web run lint`.
  2. **Type Checking**: `npm --prefix apps/web run typecheck` (`tsc --noEmit`).
  3. **Component Tests**: `npm --prefix apps/web test`.
  4. **Build Verification**: `npm --prefix apps/web run build` (Ensures zero bundle/compilation breaks).

### 2.3 Machine Learning Quality Audit (`.github/workflows/model-audit.yml`)
- **Triggers**: Pull requests modifying `apps/api/models/**` or `scripts/**`.
- **Job**:
  - Executes `python scripts/audit_model.py`.
  - Asserts holdout evaluation satisfies:
    $$\mathbf{R^2 \ge 0.85} \quad \text{and} \quad \mathbf{\text{MAE} \le \$2,000.00}$$
  - Fails the build immediately if predictive quality degrades.

