# Bug Reporting & Defect Triage: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal QA Architect  
**Status**: Authoritative Testing Baseline  

---

## 1. Defect Severity & Priority Matrix

When a defect, test failure, or regression is discovered in DeltaCare, it must be triaged according to this standardized matrix:

```mermaid
quadrantChart
    title Defect Triage Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Frequency --> High Frequency
    quadrant-1 P1: Blocker (Drop Everything)
    quadrant-2 P2: Critical (Fix in Current Turn)
    quadrant-3 P4: Low (Backlog / Polish)
    quadrant-4 P3: Moderate (Next Scheduled PR)
```

| Severity Tier | Criteria | Response Time | Action Required |
| :--- | :--- | :---: | :--- |
| **P1 - Blocker** | ML model benchmark failure ($R^2 < 0.85$ or $\text{MAE} > \$2,000$); container crash on startup; security secret leak. | Immediate | Revert commit or halt release immediately. |
| **P2 - Critical** | Negative charge predicted; rate limiting failing to throttle; CORS allowing unauthorized origins. | $< 4\text{ hours}$ | Author failing test $\rightarrow$ Implement fix. |
| **P3 - Major** | Debounce slider misfiring; cold-start skeleton text missing; minor validation error formatting issue. | $< 24\text{ hours}$ | Normal sprint PR resolution. |
| **P4 - Minor** | Cosmetic spacing defect; documentation typo; non-critical log warning. | Backlog | Addressed during regular refactoring turns. |

---

## 2. Standardized Bug Report Template (GitHub Issues)

```markdown
### Defect Title: [Brief 1-line description of the bug]

**Defect ID**: BUG-[NUMBER]  
**Severity**: [P1 - Blocker | P2 - Critical | P3 - Major | P4 - Minor]  
**Component**: [apps/api | apps/web | scripts | docs]  
**Environment**: [Localhost | Vercel Preview | Hugging Face Space Production]  

#### 1. Description
A clear and concise description of what the unexpected behavior is.

#### 2. Steps to Reproduce
1. Navigate to '...'
2. Enter values: Age: 30, BMI: 25.0, Smoker: 'yes'
3. Click 'Get Instant Quote'
4. Observe error...

#### 3. Expected Behavior
A clear statement of what should happen according to `docs/REQUIREMENTS.md` or `docs/ACCEPTANCE_CRITERIA.md`.

#### 4. Actual Behavior & Logs
Output logs, HTTP status codes, or screenshot of the failure:
```json
// Paste exact error response or traceback here
```

#### 5. Proposed Fix or Root Cause Analysis (Optional)
Analysis of the underlying module failure (e.g., Pydantic regex missing an anchor, debounce window misconfigured).
```

---

## 3. Bug Resolution Protocol (Test-Driven Fix)

Every reported bug must be resolved following **Protocol B** from [`.ai/CHANGE_MANAGEMENT.md`](../.ai/CHANGE_MANAGEMENT.md):
1. **Reproduce via Automated Test**: Author an automated test case that explicitly fails due to the bug.
2. **Implement Minimal Fix**: Modify application logic until the test passes.
3. **Verify Zero Regressions**: Execute the full test suite to guarantee no collateral damage.

