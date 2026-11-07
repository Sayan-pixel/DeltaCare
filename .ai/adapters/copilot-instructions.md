# GitHub Copilot Instructions Adapter: DeltaCare

Canonical Governance Root:
Refer to [AGENTS.md](../../AGENTS.md) and [.ai/AGENT_RULES.md](../AGENT_RULES.md) for full project rules.

Copilot Code Completion Rules:
- Enforce strict typing in all generated code (Pydantic in Python, strict TypeScript with zero 'any' in React).
- Do not generate code that collects or logs user names, emails, phone numbers, or IP addresses (Zero PII).
- Never re-implement scaling or encoding logic in API routes — invoke pipeline.predict(df) directly.
- Maintain mathematical floor: all predictions must be clamped to >= $1,000.00/year.

