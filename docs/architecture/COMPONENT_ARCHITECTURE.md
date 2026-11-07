# Component Architecture: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Software Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-001](../decisions/001-decoupled-monorepo.md), [ADR-003](../decisions/003-unified-sklearn-pipeline.md)

---

## 1. System Component Decomposition

DeltaCare is decomposed into isolated, single-responsibility components with strict cohesion and zero circular dependencies.

```mermaid
graph TD
    subgraph apps_web [Frontend Web Application - apps/web]
        UI_Form[Form Component\nInput Capture & Validation]
        UI_Slider[BmiSlider Component\nDebounced Scrubbing]
        UI_Result[QuoteResult Component\nDual Metric & Range]
        UI_WhatIf[WhatIfBadge Component\nSmoking Savings Delta]
        UI_ColdStart[ColdStartSkeleton Component\nPulsating Progress States]
        UI_Disclaimer[LegalDisclaimer Component\nNon-Binder Copy]
        
        Hook_Calc[useQuoteCalculator Hook\nAsync Fetch Orchestrator]
        Hook_Warm[usePreWarm Hook\nSilent GET /health Dispatcher]
        Hook_Debounce[useDebounce Hook\nTimer-based event damper]
    end

    subgraph apps_api [Backend Quoting API - apps/api]
        API_Main[FastAPI Main Application\nLifespan & Middleware Mount]
        API_Limiter[slowapi Limiter\nIn-Memory Token Bucket]
        API_CORS[CORS Middleware\nOrigin Whitelisting]
        API_Router[Quote Router\nPOST /predict & GET /health]
        
        Schema_Req[QuoteRequest Schema\nPydantic Validation Rules]
        Schema_Res[QuoteResponse Schema\nPydantic Serializer]
        
        ML_Predictor[ModelPredictor Singleton\nIn-Memory Invocator]
        ML_Guardrail[Guardrail Module\nMathematical Floor Enforcement]
        ML_Artifact[(model.joblib\nStandardScaler + OneHot + XGBoost)]
    end

    UI_Form --> Hook_Calc
    UI_Slider --> Hook_Debounce
    UI_Form --> UI_Slider
    UI_Result --> UI_WhatIf
    UI_Result --> UI_Disclaimer
    
    Hook_Calc --> API_Router
    Hook_Warm --> API_Router
    
    API_Main --> API_CORS
    API_CORS --> API_Limiter
    API_Limiter --> API_Router
    API_Router --> Schema_Req
    API_Router --> ML_Predictor
    ML_Predictor --> ML_Artifact
    ML_Predictor --> ML_Guardrail
    ML_Predictor --> Schema_Res
```

---

## 2. Component Responsibility Matrix

| Component | Layer | Input | Output | Single Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| `BmiSlider` | Frontend UI | Raw mouse/touch events | Debounced numeric BMI | Smooth slider scrubbing without network thrashing. |
| `useQuoteCalculator` | Frontend Hook | Form field state | Primary & What-If quote states | Orchestrates parallel/counterfactual fetches and computes deltas. |
| `usePreWarm` | Frontend Hook | Page mount event | Silent health status | Awakens dormant Hugging Face Space without user interruption. |
| `slowapi Limiter` | Backend Core | Client IP address | Token bucket balance / 429 | Guards container from brute-force scraping and DDoS. |
| `QuoteRequest` | Backend Schema | Incoming JSON dictionary | Typed Python object | Enforces actuarial input bounds ($18 \le \text{age} \le 100$, enums). |
| `ModelPredictor` | Backend ML | Single-row Pandas DataFrame | Raw continuous prediction | In-memory evaluation through unified pipeline artifact. |
| `GuardrailModule` | Backend ML | Raw float prediction | Clamped float ($\ge \$1,000$) | Guarantees business validity of financial estimates. |

