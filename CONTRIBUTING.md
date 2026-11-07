# Contributing to DeltaCare

**Document Version**: 1.0.0  
**Status**: Baseline Reference  

---

## 1. Welcome to DeltaCare

Thank you for contributing to DeltaCare. DeltaCare is an open-source, data-driven health insurance premium estimation SaaS micro-product built with transparency, privacy, and performance as core tenets.

Both human software engineers and AI coding agents contribute to this repository under the same rigorous architectural, security, and documentation standards.

---

## 2. Core Principles for Contributors

1. **Repository as Source of Truth**:
   - Before implementing any change, consult the relevant documentation in [`docs/`](docs/).
   - All contributions must trace back to an approved requirement in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).
2. **Strict $0 Perpetual Budget**:
   - DeltaCare relies strictly on permanent free tiers (Vercel and Hugging Face Spaces).
   - Contributions that introduce paid infrastructure, paid API subscriptions, or credit card dependencies will be rejected.
3. **Stateless Privacy First**:
   - We do not collect, store, or log personally identifiable information (PII).
   - Do not introduce user databases, tracking pixels, or data collection forms.
4. **Zero Train-Serve Skew**:
   - Machine learning transformations must live exclusively inside the unified `sklearn.pipeline.Pipeline` serialized in `model.joblib`. Never recode feature transformations in API controllers.

---

## 3. Development Workflow

### 3.1 Branching Strategy
- `main`: Production-ready, deployable code. All tests passing.
- `feat/<feature-name>`: New capabilities or functional improvements.
- `fix/<bug-name>`: Bug fixes and performance patches.
- `docs/<doc-name>`: Documentation updates and architectural records.

### 3.2 Commit Conventions
We follow Conventional Commits:
- `feat(api)`: Add new endpoint or prediction guardrail.
- `feat(web)`: Add new UI component or client hook.
- `fix(ml)`: Correct feature encoding pipeline or holdout audit script.
- `docs(adr)`: Add Architecture Decision Record.
- `test(api)`: Add pytest case for rate limiting.

### 3.3 Pull Request Checklist
Before opening a pull request, ensure:
- [ ] Code passes all linting and type checks (`mypy`, `ruff`, `tsc`).
- [ ] Backend tests pass (`pytest`).
- [ ] Model quality gates pass ($R^2 \ge 0.85$, $\text{MAE} \le \$2,000$).
- [ ] Documentation in `docs/` is updated to reflect all functional changes.
- [ ] No secrets, credentials, or `.env` files are committed.

---

## 4. AI Coding Agent Contributions

AI agents working in this repository must operate under the canonical rules established in [`AGENTS.md`](AGENTS.md) and [`.ai/AGENT_RULES.md`](.ai/AGENT_RULES.md).

