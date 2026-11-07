# Workflow: Dependency Updates & Auditing

**Workflow ID**: WF-08  
**Category**: Supply Chain & Dependencies  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when upgrading existing Python/npm packages or adding a new third-party library to `requirements.txt` or `package.json`.

## 2. Inviolable Dependency Gates
Every proposed package must satisfy three non-negotiable gates:
1. **$0 Budget Gate**: Must be 100% open-source without requiring paid licenses, credit-card registration, or paid API backends.
2. **Memory Safety Gate**: Must not inflate Docker image memory beyond 2.0GB (protecting Hugging Face free CPU limits).
3. **Security Gate**: Must have zero Critical or High CVEs in PyPI / npm vulnerability databases.

## 3. Procedure
1. Create a dedicated branch: `chore/deps-<package-name>`.
2. Update package version in `requirements.txt` or `package.json` with an exact pinned version.
3. Run vulnerability audits: `pip-audit` or `npm audit`.
4. Run full test suites (`pytest`, `npm test`) to verify zero breaking API changes.
5. Submit PR with Dependabot or PR template checklist.

