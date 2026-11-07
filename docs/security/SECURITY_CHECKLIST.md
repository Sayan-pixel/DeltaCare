# Security Verification Checklist: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Application Security Architect  
**Status**: Authoritative Security Baseline  

---

## 1. Pre-Deployment Security Verification Gate

Before any branch is merged into `main` or deployed to production, it must satisfy every verification item below:

```mermaid
checklist
  title Automated Security Verification Gates
  "1. Secret Scan: Zero credentials in git history" : done
  "2. Dependency Scan: Zero Critical/High CVEs" : done
  "3. Static Analysis: Bandit & ESLint Security Green" : done
  "4. Rate Limit: slowapi token bucket verified by test" : done
  "5. CORS: Origin locked to Vercel production domain" : done
  "6. Zero PII: Logs verified free of request bodies" : done
  "7. Non-Root: Dockerfile runs as unprivileged user" : done
  "8. Math Floor: Clamping verified on negative inputs" : done
```

---

## 2. Granular Verification Matrix

| Area | Check Item | Verification Command / Method | Gate Threshold |
| :--- | :--- | :--- | :--- |
| **Secrets** | Scan repository for committed keys/tokens | `git secrets --scan` / GitHub Secret Scanning | 0 findings |
| **Dependencies** | Python vulnerability audit | `pip-audit` / `safety check` | 0 Critical or High CVEs |
| **Dependencies** | Node.js vulnerability audit | `npm audit --audit-level=high` | 0 High or Critical CVEs |
| **Static Analysis** | Python AST security linting | `bandit -r apps/api/src/` | 0 High severity issues |
| **Static Analysis** | TypeScript / React security linting | `npx eslint apps/web/src/ --plugin security` | 0 errors |
| **Rate Limiting** | Automated token bucket test | `pytest apps/api/tests/test_rate_limit.py` | 61st request returns HTTP 429 |
| **Validation** | Pydantic schema rejection | `pytest apps/api/tests/test_predict.py` | Bad inputs return HTTP 422 |
| **Guardrails** | Non-negative prediction floor | `pytest apps/api/tests/test_predict.py` | Output $\ge \$1,000.00$ |
| **Container** | Non-root user in Docker | `grep "USER appuser" apps/api/Dockerfile` | Must exist |
| **Logging** | Log payload sanitization | Code review of `apps/api/src/core/logger.py` | No raw bodies logged |

