# Documentation Rules & Maintenance: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Technical Documentation Engineer  
**Status**: Authoritative Invariant Set  

---

## 1. Documentation as Single Source of Truth

The documentation inside `docs/` is the authoritative single source of truth for DeltaCare.

1. **No Outdated Documentation**:
   - If a code change modifies an API payload, endpoint path, environment variable, or UX behavior, the corresponding documentation file in `docs/` must be updated in the **same turn**.
2. **No Orphaned Files**:
   - Every document created must be indexed in `docs/INDEX.md`.
3. **Markdown & Mermaid Standards**:
   - All documentation must be formatted in clean GitHub-flavored Markdown.
   - Architectural flows and state progressions must use Mermaid diagrams.

---

## 2. Architecture Decision Records (ADRs)

Any significant architectural modification must be captured as an ADR under `docs/architecture/adr/`.

### Required ADR Structure:
```markdown
# ADR-xxx: [Title]

**Status**: [Proposed | Approved | Superseded]  
**Date**: YYYY-MM-DD  
**Context**: What technical challenge or business constraint triggered this decision?  
**Decision**: What specific architecture, library, or pattern was chosen?  
**Consequences**:
- Positive impacts (e.g., performance, $0 cost, memory efficiency).
- Negative impacts / trade-offs (e.g., cold starts, lack of persistence).
```

---

## 3. Inline Code Documentation

- **Python**: Every module, class, and public function must include a concise PEP 257 docstring explaining arguments, return types, and potential exceptions.
- **TypeScript**: Exported interfaces, types, and component props must include concise TSDoc comments (`/** ... */`).
- **Do Not State the Obvious**: Comments should explain **why** a decision was made (e.g., mathematical floor clamp justification, debounce interval rationale), not merely restate what the code does.

