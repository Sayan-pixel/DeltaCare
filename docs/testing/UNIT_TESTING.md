# Unit Testing Guidelines & Specifications: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal QA Architect  
**Status**: Authoritative Testing Baseline  

---

## 1. Unit Testing Philosophy

Unit tests verify the correctness of individual functions, mathematical calculations, schema validators, and isolated React hooks without network calls or process dependencies.

- **Coverage Goal**: Minimum **85% statement coverage** across all business logic modules.
- **Execution Speed**: Full unit test suites must execute in $< 5\text{ seconds}$ locally.

---

## 2. Backend Unit Test Specifications (`apps/api/tests/`)

### TC-U-01: Mathematical Floor Guardrail Clamping
- **Target Function**: `src.ml.guardrails.apply_prediction_guardrail(raw_val: float)`
- **Test Scenarios**:
  1. Negative input (`-500.00`) $\rightarrow$ Clamped to `$1,000.00`.
  2. Implausibly low input (`$450.00`) $\rightarrow$ Clamped to `$1,000.00`.
  3. Exact floor input (`$1,000.00`) $\rightarrow$ Returns `$1,000.00`.
  4. Normal input (`$4,520.456`) $\rightarrow$ Rounded to `$4,520.46`.

### TC-U-02: Pydantic Demographic Bounds Validation
- **Target Model**: `src.schemas.quote.QuoteRequest`
- **Test Scenarios**:
  1. `age = 17` (Below minimum) $\rightarrow$ Raises `ValidationError`.
  2. `age = 101` (Above maximum) $\rightarrow$ Raises `ValidationError`.
  3. `bmi = 9.9` (Below minimum) $\rightarrow$ Raises `ValidationError`.
  4. `bmi = 60.1` (Above maximum) $\rightarrow$ Raises `ValidationError`.
  5. `children = -1` (Negative dependents) $\rightarrow$ Raises `ValidationError`.
  6. `sex = "other"` (Non-binary enum in actuarial data) $\rightarrow$ Raises `ValidationError`.
  7. `smoker = "occasionally"` (Invalid enum) $\rightarrow$ Raises `ValidationError`.
  8. `region = "midwest"` (Invalid region enum) $\rightarrow$ Raises `ValidationError`.
  9. Extra unexpected field (`"hacked": true`) $\rightarrow$ Raises `ValidationError` (`extra = "forbid"`).

---

## 3. Frontend Unit Test Specifications (`apps/web/tests/`)

### TC-U-03: `useDebounce` Timing Verification
- **Target Hook**: `src.hooks.useDebounce(value, delay)`
- **Test Scenario**:
  1. Initialize hook with initial value `"25.0"` and delay `400ms`.
  2. Rapidly update value to `"26.0"`, `"27.0"`, `"28.0"` over 100ms using Jest fake timers.
  3. At $t = 200\text{ms}$, assert debounced value is still `"25.0"`.
  4. Advance timers by $400\text{ms}$ ($t = 500\text{ms}$).
  5. Assert debounced value updates cleanly to `"28.0"`.

### TC-U-04: Currency & Monthly Pricing Formatter
- **Target Utility**: Currency formatting helper.
- **Test Scenarios**:
  1. Number `362.5` $\rightarrow$ Formats to `"$362.50"`.
  2. Number `12000` $\rightarrow$ Formats to `"$12,000.00"`.

