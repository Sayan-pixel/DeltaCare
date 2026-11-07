# Workflow: Security & Privacy Policy Updates

**Workflow ID**: WF-06  
**Category**: Security & Compliance  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when patching security vulnerabilities (CVEs), modifying CORS allowed origins, tuning `slowapi` rate limits, or modifying logging sanitization filters.

## 2. Inviolable Security Invariants
- Security policies are **RESTRICTED** or **PROTECTED** tier actions.
- Never weaken a rate limit, widen a CORS policy to `*`, or disable Pydantic schema validation to work around an error.

## 3. Implementation Procedure
1. Create a dedicated branch: `fix/security-<cve-or-issue>`.
2. Formulate changes strictly complying with [`docs/security/`](../../docs/security/).
3. Execute security test suite:
   - `bandit -r apps/api/src/`
   - `pip-audit -r apps/api/requirements.txt`
   - `npm audit --audit-level=high`
4. Verify that logs remain 100% free of sensitive consumer demographics.
5. Present diff and obtain Technical Lead review.

