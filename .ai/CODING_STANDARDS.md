# Coding Standards: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior Software Engineering Lead  
**Scope**: Python (FastAPI/ML) & TypeScript (Next.js/React)  
**Status**: Authoritative Invariant Set  

---

## 1. General Principles

- **Readability Over Cleverness**: Code must be immediately comprehensible to any human engineer or AI model.
- **Strict Typing**: No untyped parameters, returns, or variables.
- **Fail Fast & Loudly**: Validate inputs at boundary entrypoints (Pydantic / TypeScript schemas) before passing data to internal routines.
- **Small, Composable Functions**: Functions must perform a single task and fit within a single screen view ($\le 40$ lines).

---

## 2. Python Standards (`apps/api/` & `scripts/`)

### 2.1 Language & Tooling
- **Python Version**: Python 3.10+ (standardized for Hugging Face Spaces compatibility).
- **Style Guide**: PEP 8 compliance enforced via `ruff` or `flake8`.
- **Type Annotations**: Enforced via `mypy --strict`. All functions must have explicit argument types and return type annotations.

### 2.2 FastAPI & Pydantic Conventions
```python
# GOOD: Explicit Pydantic schema with validation boundaries
from pydantic import BaseModel, Field

class QuoteRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age of primary beneficiary")
    sex: str = Field(..., regex="^(male|female)$", description="Biological sex")
    bmi: float = Field(..., ge=10.0, le=60.0, description="Body Mass Index")
    children: int = Field(..., ge=0, le=10, description="Dependent count")
    smoker: str = Field(..., regex="^(yes|no)$", description="Tobacco use status")
    region: str = Field(..., regex="^(northeast|southeast|southwest|northwest)$")

# BAD: Untyped or raw request dictionaries
@app.post("/predict")
async def predict(data: dict):
    ...
```

### 2.3 Exception Handling & Logging
- Always catch specific exceptions (e.g., `ValueError`, `FileNotFoundError`), never bare `except:`.
- Use structured logging via Python's standard `logging` module. Never use `print()` in production API routes.
- Sanitize logs: Never output raw user input bodies to logs.

---

## 3. TypeScript & React Standards (`apps/web/`)

### 3.1 Language & Tooling
- **TypeScript**: Strict mode enabled (`"strict": true` in `tsconfig.json`).
- **No `any`**: The use of `any` is strictly prohibited. Use `unknown`, generics, or explicit union types.
- **Styling**: Utility-first CSS using Tailwind CSS. Avoid arbitrary inline styles.

### 3.2 React Components & Hooks
```tsx
// GOOD: Explicit functional component with typed props interface
interface QuoteResultProps {
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly marginMonthly: number;
}

export const QuoteResult: React.FC<QuoteResultProps> = ({
  monthlyPrice,
  annualPrice,
  marginMonthly,
}) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <span className="text-sm font-semibold text-slate-500 uppercase">Estimated Monthly</span>
      <h2 className="text-4xl font-extrabold text-slate-900 mt-1">${monthlyPrice.toFixed(2)} / mo</h2>
      <p className="text-sm text-slate-400 mt-1">Annual Total: ${annualPrice.toFixed(2)}</p>
    </div>
  );
};
```

### 3.3 State Management & Hooks
- Use native React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) for component-local state.
- Keep network requests isolated in custom hooks (e.g., `useQuoteCalculator`, `usePreWarm`).
- Wrap rapid input events in debounce wrappers (300–500ms) before making API calls.

