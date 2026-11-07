# ADR-010: Zero-PII Structured Logging to STDOUT

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior Security Architect, DevOps Engineer, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-004](004-stateless-b2c-mvp.md)

---

## 1. Context
Application logging is necessary for operational monitoring, performance tracking, and debugging. However, in a health insurance estimation platform, unmanaged logging frequently captures user input payloads (age, BMI, smoking status) or IP addresses, creating unintentional persistent PII storage and violating our privacy invariants.

---

## 2. Problem Statement
How should DeltaCare implement application logging to ensure adequate operational visibility while guaranteeing zero retention of sensitive consumer data?

---

## 3. Decision
Enforce **structured JSON logging directed exclusively to `stdout`/`stderr`** with strict payload omission:
1. Logs record metadata only: timestamp, request ID, HTTP method, path, response status, and duration in milliseconds.
2. Incoming request bodies and individual feature values are **never logged**.
3. Log output is streamed directly to container `stdout`/`stderr` without writing to local log files or persistent disks.

---

## 4. Reasoning
- **Privacy Compliance**: Guarantees that sensitive health-related attributes are not captured in container logs or log aggregation tools.
- **Twelve-Factor App Standard**: Streaming to standard output complies with the Twelve-Factor App methodology for containerized microservices.
- **Zero Disk Growth**: Writing logs to container disk on free tiers can exhaust ephemeral storage, causing container crashes.

---

## 5. Alternatives Considered
- **Alternative 1: File-based logging (`/var/log/app.log`)** $\rightarrow$ *Rejected*: Fills ephemeral Docker disk; introduces disk write I/O latency.
- **Alternative 2: Third-party Cloud Log Aggregator (Datadog / Loggly)** $\rightarrow$ *Rejected*: Incurs paid subscription costs, violating the $0 perpetual budget.

---

## 6. Advantages (Positive Consequences)
- Strict compliance with Zero PII policy.
- Zero local disk consumption.
- Structured format enables effortless filtering via Docker/Hugging Face log viewers.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Historical log retention is limited to Hugging Face Spaces' built-in scrollback buffer.

---

## 8. Technical Consequences
- Custom logger module configured in `apps/api/src/core/logger.py`.

---

## 9. Security Implications
- Prevents data leakage through server logs.

---

## 10. Operational & DevOps Implications
- Lightweight logging with minimal CPU overhead.

---

## 11. Constraints for Future Development
- Never log raw request bodies or user demographics.

---

## 12. Reversal Conditions
- If Phase 2 introduces enterprise compliance requirements, integrate an encrypted, HIPAA-compliant external audit log service.

