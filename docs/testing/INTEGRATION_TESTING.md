# Integration Testing: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal QA Architect  
**Status**: Authoritative Testing Baseline  

---

## 1. Integration Scope

Integration testing verifies that decoupled modules function together seamlessly across process and interface boundaries:
1. **FastAPI Routing $\leftrightarrow$ Pydantic Schemas $\leftrightarrow$ Serialized ML Pipeline (`model.joblib`)**.
2. **FastAPI Lifespan Startup $\leftrightarrow$ In-Memory Artifact Deserialization**.
3. **slowapi Middleware $\leftrightarrow$ Routing Handlers**.

---

## 2. Key Integration Test Specifications (`apps/api/tests/`)

### TC-INT-01: End-to-End Predict Route Pipeline Execution
- **Setup**: Launch FastAPI `TestClient(app)` with lifespan events triggered.
- **Action**: Dispatch `POST /predict` with standard actuarial JSON:
  ```json
  {
    "age": 30,
    "sex": "male",
    "bmi": 24.5,
    "children": 0,
    "smoker": "no",
    "region": "northeast"
  }
  ```
- **Assertions**:
  - Response status code is `200 OK`.
  - JSON response matches `QuoteResponse` schema.
  - `predicted_monthly` equals `round(predicted_annual / 12, 2)`.
  - `predicted_annual` is a positive float $\ge \$1,000.00$.
  - `confidence_margin_annual` is populated with the model's empirical holdout MAE.

### TC-INT-02: Pipeline Deserialization & Categorical String Handling
- **Action**: Pass raw string categories (`"female"`, `"yes"`, `"southwest"`) through `ModelPredictor.predict()`.
- **Assertions**:
  - The underlying `ColumnTransformer` inside `model.joblib` handles string one-hot encoding internally without raising `KeyError` or `TypeError`.
  - Inference returns a valid floating-point continuous charge prediction in $< 20\text{ms}$.

### TC-INT-03: Lifespan Singleton Memory Verification
- **Action**: Verify that `ModelPredictor._pipeline` is loaded into process RAM exactly once during server startup and remains in memory across multiple sequential requests.
- **Assertions**: Subsequent requests do not trigger disk I/O reads against `model.joblib`.

