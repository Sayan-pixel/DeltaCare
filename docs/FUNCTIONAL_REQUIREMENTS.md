# Functional Requirements: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Requirements Engineer & Product Manager  
**Status**: Baseline Reference  

---

## 1. Data Pipeline & Machine Learning Specifications

### FR-001: Automated Data Ingestion
- **Description**: The system must provide a standalone, fully scripted ingestion mechanism to fetch the US `insurance.csv` dataset (1,338 rows) from an authoritative raw public mirror (or Kaggle API) directly into memory/local cache without manual file movement.
- **Priority**: High | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Running the ingestion script pulls 1,338 records with columns `age`, `sex`, `bmi`, `children`, `smoker`, `region`, and `charges` without human intervention.

### FR-002: Interaction-Aware Tree Ensemble Model
- **Description**: The ML training module must fit a tree ensemble regressor (XGBoost or LightGBM) to capture the known non-linear interaction effect between `bmi` and `smoker`.
- **Priority**: Critical | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Model achieves $R^2 \ge 0.85$ and $\text{MAE} \le \$2,000$ on an 80/20 train/test split. Explainability plots (SHAP) verify that smoker status combined with high BMI generates an exponential cost increase.

### FR-003: Unified Pipeline Serialization
- **Description**: The training process must encapsulate all data transformations (`StandardScaler` on numericals, `OneHotEncoder` on categoricals) and the fitted regressor within a single `sklearn.pipeline.Pipeline` object, serialized via `joblib.dump` to `model.joblib`.
- **Priority**: Critical | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Loading `model.joblib` into a clean Python environment requires zero secondary encoders or scalers; executing `pipeline.predict(raw_df)` returns valid continuous predictions.

---

## 2. Backend REST API Specifications (`FastAPI`)

### FR-004: Service Health Check Endpoint
- **Description**: The API must expose a lightweight `GET /health` route returning HTTP 200 with service health status.
- **Priority**: Medium | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Executing `GET /health` returns `{"status": "healthy", "version": "1.0.0"}` in $< 10\text{ms}$ on an active container.

### FR-005: Stateless Prediction Endpoint
- **Description**: The API must expose a transactional `POST /predict` route accepting a Pydantic-validated JSON payload and returning the calculated annual and monthly estimates along with confidence intervals.
- **Priority**: Critical | **Phase**: 1 | **Status**: Approved
- **Request Schema**:
  - `age`: integer, $18 \le \text{age} \le 100$
  - `sex`: string enum (`male`, `female`)
  - `bmi`: float, $10.0 \le \text{bmi} \le 60.0$
  - `children`: integer, $0 \le \text{children} \le 10$
  - `smoker`: string enum (`yes`, `no`)
  - `region`: string enum (`northeast`, `southeast`, `southwest`, `northwest`)
- **Response Schema**:
  - `predicted_annual`: float (rounded to 2 decimal places)
  - `predicted_monthly`: float (`predicted_annual / 12`)
  - `confidence_margin_annual`: float (model MAE)
  - `confidence_margin_monthly`: float (`MAE / 12`)
  - `range_annual`: array of two floats `[predicted - MAE, predicted + MAE]`
  - `range_monthly`: array of two floats `[(predicted - MAE)/12, (predicted + MAE)/12]`
  - `currency`: string (`USD`)

### FR-006: Mathematical Floor Guardrail
- **Description**: The backend prediction handler must clamp any raw regression output to a business-valid floor ($ \ge \$1,000/\text{year}$ or $\$83/\text{month}$) to ensure the model never predicts negative charges or implausibly cheap premiums.
- **Priority**: High | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: An extreme synthetic input cannot yield a predicted annual charge $< \$1,000$.

---

## 3. Frontend Client Specifications (`Next.js` / React + Tailwind CSS)

### FR-007: Single-Screen Actuarial Form
- **Description**: The UI must render a clean, accessible single-view form collecting all 6 required actuarial attributes without pagination or multi-step wizard delays.
- **Priority**: Critical | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Form displays inputs for Age, Gender, BMI, Dependents, Smoker toggle, and US Region, fully validating client-side before network dispatch.

### FR-008: Dual Metric Pricing Presentation
- **Description**: The results view must visually prioritize the estimated Monthly Premium as the primary bold hero metric ($362 / mo), accompanied by the Total Estimated Annual Charges as a secondary subtitle ($4,350 / yr).
- **Priority**: High | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Users immediately see the monthly figure in prominent typography, preventing annual sticker shock.

### FR-009: Statistical Confidence Range Rendering
- **Description**: The results view must render the calculated error margin as a transparent bracket (e.g., "$340 – $385 / mo") directly below the hero metric, explicitly communicating statistical confidence.
- **Priority**: High | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: The bracket dynamically reflects the backend `range_monthly` response.

### FR-010: Dynamic What-If Smoking Delta Badge
- **Description**: When a user selects `smoker: yes`, the client must automatically trigger an asynchronous calculation comparing their current quote against a synthetic `smoker: no` profile. The resulting savings difference must render as a prominent dynamic badge: *"Quitting smoking could save you ~$X,XXX / year"*.
- **Priority**: High | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Toggling smoker to "yes" triggers the delta badge; toggling back to "no" smoothly hides the badge.

### FR-011: Debounced Interactive BMI Slider
- **Description**: The BMI input must provide an interactive visual slider synchronized with a numeric input field, debounced at 300–500ms to allow smooth price updates during dragging without overwhelming the API rate limiter.
- **Priority**: Medium | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Dragging the slider continuously sends at most 1 API request every 400ms; quote updates smoothly in real time.

### FR-012: Multi-Stage Cold-Start UX States
- **Description**: The frontend must provide clear, progressive visual feedback during server wake-up:
  - **0–2s**: Inline button spinner with text "Calculating...".
  - **3–10s**: Transition to pulsating skeleton loader with message "Waking up the pricing engine... (this takes a few seconds)".
  - **20s**: Abort timeout triggering an actionable recovery notification: "Our servers are warming up. Please click calculate again."
- **Priority**: High | **Phase**: 1 | **Status**: Approved
- **Acceptance Criteria**: Simulating a 12-second delayed response displays the skeleton wake-up state without throwing unhandled exceptions.

### FR-013: Legal Underwriting Disclaimer
- **Description**: The application must display an unambiguous non-binder disclaimer directly below the quote result card in subdued text (`text-xs text-slate-400 mt-4 text-center`).
- **Priority**: Critical | **Phase**: 1 | **Status**: Approved
- **Mandatory Copy**: *"Estimates are generated by a machine learning model for informational purposes only. This does not constitute an official quote, offer, or insurance binder. Actual premiums are determined by underwriting."*

