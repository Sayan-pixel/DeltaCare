# Gemini CLI / Agent Adapter: DeltaCare

Canonical Governance Root:
Refer to [AGENTS.md](../../AGENTS.md) and [.ai/AGENT_RULES.md](../AGENT_RULES.md).

Rules for Gemini CLI / Assistants:
- Follow the 5-phase execution loop defined in [.ai/TASK_EXECUTION_PROTOCOL.md](../TASK_EXECUTION_PROTOCOL.md).
- Adhere to the Permission Model: Normal work proceeds autonomously; Restricted work requires explicit confirmation; Protected work (e.g., git push) must never be executed without explicit user command.
- Maintain the strict $0 perpetual hosting constraint (Vercel and Hugging Face Spaces free tiers).

