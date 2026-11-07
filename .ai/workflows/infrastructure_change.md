# Workflow: Infrastructure & Deployment Changes

**Workflow ID**: WF-09  
**Category**: Infrastructure & DevOps  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when modifying `apps/api/Dockerfile`, environment variable templates, or GitHub Actions CI/CD workflows.

## 2. Protected Tier Restrictions
- Infrastructure changes that could trigger cloud billing or provision external paid services are **PROTECTED** and **strictly prohibited for autonomous execution by AI agents**.
- All infrastructure work must operate within verified free tiers (Vercel Hobby & Hugging Face Spaces free CPU).

## 3. Procedure
1. Create a dedicated branch: `chore/infra-<description>`.
2. Test Docker build locally: `docker build -t test-api apps/api/`.
3. Verify container runs as non-root user (`USER appuser`) and listens on port `7860`.
4. Validate GitHub Actions YAML syntax using a linter (e.g., `actionlint`).
5. Obtain explicit Technical Lead sign-off before merging.

