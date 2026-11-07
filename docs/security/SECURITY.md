# Security Policy & Governance: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Application Security Architect  
**Status**: Authoritative Security Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md), [ADR-005](../decisions/005-in-memory-token-bucket-rate-limiting.md), [ADR-010](../decisions/010-structured-stdout-log-sanitization.md)

---

## 1. Security Philosophy & Principles

DeltaCare follows the **Principle of Secure by Design** and **Defense-in-Depth**.

Our greatest security advantage in Phase 1 is **Architectural Attack Surface Minimization**:
1. **Stateless Privacy (Zero PII)**: We do not store what attackers wish to steal. By eliminating databases, user accounts, and session tokens, DeltaCare eliminates $> 80\%$ of classic web vulnerability classes (SQL Injection, Credential Stuffing, Session Hijacking, Mass Data Leaks).
2. **Strict Invariant Enforcement**: Every boundary enforces schema validation, mathematical clamping, and rate limiting.
3. **Automated Verification**: Security is enforced through static analysis (`bandit`, `eslint-plugin-security`), automated dependency scanning, and strict CI/CD quality gates.

---

## 2. Master Security Documentation Map

All dedicated security documentation is organized in `docs/security/`:

| Document | Primary Focus | Key Security Standard |
| :--- | :--- | :--- |
| [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) | Trust boundaries, defense layers, container isolation | OWASP Top 10 & ASVS Level 2 |
| [THREAT_MODEL.md](THREAT_MODEL.md) | STRIDE threat model, asset register, attack vectors | STRIDE Threat Matrix |
| [ATTACK_SURFACE.md](ATTACK_SURFACE.md) | Exposed entrypoints, protocols, and surface dampening | Port/Route Whitelisting |
| [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md)| Phase 1 Zero-Auth model & Phase 2 OAuth2/OIDC standards | OWASP ASVS v4 Auth Guidelines |
| [AUTHORIZATION_POLICY.md](AUTHORIZATION_POLICY.md) | Origin validation, rate quotas, and future RBAC | Least Privilege Model |
| [ACCESS_CONTROL.md](ACCESS_CONTROL.md) | Network access control, CORS headers, Docker non-root | POSIX & HTTP Access Bounds |
| [ENCRYPTION_POLICY.md](ENCRYPTION_POLICY.md) | TLS 1.3 in-transit, Git LFS integrity, SHA-256 digests | NIST SP 800-52r2 Standards |
| [SECRET_MANAGEMENT.md](SECRET_MANAGEMENT.md) | Zero secrets policy, environment templates, git-guard | 12-Factor App & Secret Scanning |
| [INPUT_VALIDATION.md](INPUT_VALIDATION.md) | Pydantic boundaries, enum whitelists, payload rejection | OWASP Input Validation Cheat Sheet |
| [OUTPUT_ENCODING.md](OUTPUT_ENCODING.md) | React automatic escaping, JSON serialization security | Contextual Output Encoding |
| [SESSION_SECURITY.md](SESSION_SECURITY.md) | Stateless execution, zero cookies, zero tokens | Stateless Invariant |
| [RATE_LIMITING.md](RATE_LIMITING.md) | slowapi token bucket, DoS mitigation, 60 req/min limit | RFC 6585 (HTTP 429) |
| [AUDIT_LOGGING.md](AUDIT_LOGGING.md) | Zero-PII structured STDOUT logging, log sanitization | OWASP Logging Cheat Sheet |
| [DATA_PRIVACY.md](DATA_PRIVACY.md) | Ephemeral RAM processing, GDPR/CCPA immunity | Data Minimization by Design |
| [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) | 5-phase triage, containment, and notification playbooks | NIST SP 800-61 Rev. 2 |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Pre-deployment security verification gates | Automated CI Verification |
| [VULNERABILITY_MANAGEMENT.md](VULNERABILITY_MANAGEMENT.md)| Dependabot, Trivy container scans, CVE triage | SLA Remediation Schedule |

---

## 3. Mandatory AI Agent Security Invariants

All AI coding agents contributing to DeltaCare must strictly abide by these invariants:
- **NEVER** hardcode API keys, tokens, or credentials in any file.
- **NEVER** weaken or bypass Pydantic input validation to make a test pass.
- **NEVER** remove or disable CORS origin whitelisting or `slowapi` rate limiting.
- **NEVER** introduce code that logs incoming request bodies or IP addresses.
- **NEVER** install dependencies with known critical or high severity CVEs.

