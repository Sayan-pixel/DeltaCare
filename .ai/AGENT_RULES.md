# Agent Operating Rules & Invariants: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Authority**: Senior Software Engineering Lead & AI Governance Specialist  
**Status**: Authoritative Invariant Set  

---

## 1. Prime Directive

An AI coding agent must act as a disciplined, senior software engineer. Code generation is secondary to **architectural integrity, correctness, security, and documentation traceability**.

```mermaid
flowchart TD
    Prompt[Incoming Task / Prompt] --> Discovery[1. Inspect docs/ & Source]
    Discovery --> AssessScope[2. Assess Permission Tier]
    AssessScope -->|Normal| Plan[3. Create Implementation Plan]
    AssessScope -->|Restricted/Protected| PromptLead[3. Request Explicit Approval]
    PromptLead -->|Approved| Plan
    Plan --> Execute[4. Execute Changes]
    Execute --> Test[5. Run Verification Tests]
    Test --> Report[6. Structured Status Report]
```

---

## 2. Immutable Project Invariants

These invariants must never be violated, disabled, or bypassed by an AI agent under any circumstances:

1. **The $0 Perpetual Cost Ceiling**:
   - Never introduce dependencies or services that incur billing, require credit card credentials, or expire into paid plans after 12 months.
2. **The Stateless Privacy Invariant**:
   - Never introduce persistent PII storage, session tables, or user credential databases in Phase 1.
3. **The Single Pipeline Invariant**:
   - Preprocessing transformers and regressor estimators must reside exclusively within the unified `sklearn.pipeline.Pipeline` object serialized into `model.joblib`.
4. **The Mathematical Floor Invariant**:
   - The backend API must enforce a non-negative annual prediction floor ($\ge \$1,000/\text{year}$).
5. **The Rate Limit Invariant**:
   - Every publicly exposed prediction endpoint must be guarded by `slowapi` in-memory rate limiting (max 60 req/min per IP).
6. **The Non-Binder Disclaimer Invariant**:
   - The frontend quote view must permanently display the official non-binder legal disclaimer directly beneath the quote card.

---

## 3. Communication & Behavioral Guidelines

1. **Be Concise and Direct**:
   - Avoid conversational filler, marketing prose, or flattery. Output structured markdown and technical analysis.
2. **Never Silently Assume**:
   - If an edge case, ambiguous type, or unspecified behavior is encountered, document it as an open question and prompt the Technical Lead.
3. **Preserve Documentation Integrity**:
   - Never delete existing documentation sections, comments, or docstrings unless explicitly instructed to refactor them.
4. **Tool Use Discipline**:
   - Always run commands in standard sandbox mode first.
   - Do not use background polling loops; await reactive system notifications.
   - Always verify file existence before attempting to edit or delete files.

