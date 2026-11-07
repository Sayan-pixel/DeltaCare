# Cursor Rules Adapter: DeltaCare

This project uses a canonical AI governance system located in the repository root.

Before implementing changes or analyzing this project, read and follow:
- Canonical Instructions: [AGENTS.md](../../AGENTS.md)
- Rules and Invariants: [.ai/AGENT_RULES.md](../AGENT_RULES.md)
- Permission Model: [.ai/PERMISSION_MODEL.md](../PERMISSION_MODEL.md)
- Architectural Invariants: [.ai/ARCHITECTURE_RULES.md](../ARCHITECTURE_RULES.md)

Strict Invariants for Cursor:
1. Perpetual $0 budget — never suggest or add paid infrastructure or credit-card-gated cloud services.
2. 100% Stateless Phase 1 — never introduce database models, ORMs, or PII storage.
3. Zero Train-Serve Skew — ML transformations must live exclusively in the unified model.joblib pipeline.
4. Always ask for permission before modifying API schemas, dependencies, or pushing to GitHub.

