# Workflow: Documentation Synchronization

**Workflow ID**: WF-10  
**Category**: Documentation Governance  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when documenting new specifications, refining requirements, updating README files, or correcting discrepancies between documentation and code.

## 2. Inviolable Rule: Single Source of Truth
The documentation in `docs/` is authoritative. When application code changes, documentation must be updated in the **identical pull request or turn**. Leaving documentation stale is treated as a critical defect.

## 3. Procedure
1. Locate the relevant document via [`docs/INDEX.md`](../../docs/INDEX.md).
2. Author clean GitHub-flavored Markdown using Mermaid diagrams where architectural flows or states are involved.
3. Ensure all internal markdown links use relative links or validated project file paths.
4. If a new document is added, add it immediately to `docs/INDEX.md`.

