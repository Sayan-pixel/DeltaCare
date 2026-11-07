# Workflow: Code Refactoring

**Workflow ID**: WF-03  
**Category**: Maintenance & Optimization  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when restructuring, simplifying, or optimizing existing code without altering its external behavior or public API contracts.

## 2. Inviolable Rule of Refactoring
**Behavior Invariance**: A refactor must never change what the code does; it only changes how the code achieves it. Public endpoint routes, schemas, and return formats must remain identical.

## 3. Initial Investigation & Baseline Green State
1. Run the entire test suite before touching any file.
2. Confirm that 100% of existing tests are **green**.
3. If tests are failing before you begin, halt and resolve them using the Bug Fix workflow first.

## 4. Implementation Procedure
1. Create a dedicated branch: `refactor/<refactor-name>`.
2. Apply localized simplifications: eliminate dead code, extract small helper functions ($\le 40$ lines), or improve type annotations.
3. Re-run tests frequently during refactoring.

## 5. Verification & Completion Criteria
- 100% of tests pass without loosening any assertion.
- Static typing (`mypy --strict`, `tsc --noEmit`) passes with zero errors.
- Performance and memory benchmarks remain within approved bounds.

