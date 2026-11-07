# Acceptance Criteria: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior QA Engineer & Requirements Analyst  
**Status**: Baseline Reference  

---

## 1. Quality Gate Framework

Every feature must satisfy strict, unambiguous Gherkin-formatted acceptance criteria before code is considered complete. Tests must execute automatically in CI/CD pipelines.

---

## 2. Machine Learning Pipeline Criteria

### AC-ML-01: Model Performance Benchmarks
```gherkin
Feature: Machine Learning Model Holdout Evaluation
  Scenario: The model must satisfy actuarial performance gates on unseen data
    Given the US insurance dataset (1,338 records)
    When the automated training script splits the data 80/20 into train and test sets
    And fits the XGBoost ensemble regressor via the unified Pipeline
    Then the calculated R-squared score on the test set must be >= 0.85
    And the calculated Mean Absolute Error (MAE) must be <= 2000.00 USD
```

### AC-ML-02: Pipeline Serialization & Parity
```gherkin
Feature: Unified Pipeline Serialization
  Scenario: The serialized artifact must execute end-to-end inference without external transformers
    Given a freshly serialized "model.joblib" file
    When loaded into a clean Python runtime without importing custom transformer modules
    And invoked with a raw Pandas DataFrame containing raw categoricals ("male", "yes", "southeast")
    Then it must successfully return an array of float predictions without raising KeyError or ValueError
```

---

## 3. Backend API Service Criteria (`FastAPI`)

### AC-API-01: Health Check Endpoint
```gherkin
Feature: Backend Health Check
  Scenario: Automated monitoring verifies service health
    Given an active FastAPI container
    When a GET request is sent to "/health"
    Then the response status code must be 200
    And the JSON body must match '{"status": "healthy", "version": "1.0.0"}'
    And the response time must be under 50ms
```

### AC-API-02: Stateless Prediction & Math Floor
```gherkin
Feature: Stateless Prediction Endpoint
  Scenario: Valid payload yields full pricing breakdown
    Given a JSON payload:
      """
      {
        "age": 30,
        "sex": "male",
        "bmi": 24.5,
        "children": 0,
        "smoker": "no",
        "region": "northeast"
      }
      """
    When a POST request is sent to "/predict"
    Then the response status code must be 200
    And the response must contain positive float fields: "predicted_annual" and "predicted_monthly"
    And "predicted_monthly" must equal "predicted_annual / 12" rounded to 2 decimal places
    And "predicted_annual" must be >= 1000.00 USD (floor guardrail)
```

### AC-API-03: Input Validation Rejection
```gherkin
Feature: Request Input Validation
  Scenario: Invalid actuarial data is rejected with 422 Unprocessable Entity
    Given a JSON payload with invalid data:
      """
      {
        "age": 12,
        "sex": "unknown",
        "bmi": 75.0,
        "children": -1,
        "smoker": "maybe",
        "region": "antarctica"
      }
      """
    When a POST request is sent to "/predict"
    Then the response status code must be 422
    And the response must detail the specific validation errors for each field
```

### AC-API-04: Rate Limiting Enforcement
```gherkin
Feature: Abuse Rate Limiting
  Scenario: Exceeding 60 requests per minute triggers HTTP 429
    Given a client IP making valid POST requests to "/predict"
    When the client dispatches 61 requests within a 60-second window
    Then the 61st request must return status code 429
    And the response body must indicate rate limit exceeded
```

---

## 4. Frontend Client Criteria (`Next.js` / React)

### AC-UI-01: Dual Metric & Range Presentation
```gherkin
Feature: Quote Display Hierarchy
  Scenario: Successful quote renders monthly hero metric and range
    Given the user has submitted valid inputs
    When the API returns a prediction of 3,600.00 USD annual with 1,200.00 USD margin
    Then the UI must display a primary hero metric of "$300.00 / mo"
    And a secondary subtitle of "Estimated Annual: $3,600.00"
    And a confidence interval badge showing "$200.00 – $400.00 / mo"
    And the legal disclaimer must be visible directly below the result card
```

### AC-UI-02: Dynamic Smoking What-If Delta
```gherkin
Feature: Smoking Cessation Savings Delta
  Scenario: Toggling smoker triggers dynamic savings calculation
    Given the user has entered their profile with smoker toggle set to "No"
    When the user changes the smoker toggle to "Yes"
    Then the UI must dispatch a background comparison query
    And display an animated savings callout: "Quitting smoking could save you ~$X,XXX / year"
    When the user toggles smoker back to "No"
    Then the savings callout must smoothly disappear
```

### AC-UI-03: Cold-Start UX Progressive Feedback
```gherkin
Feature: Cold-Start Progressive Feedback
  Scenario: Long server response times trigger staged UX transitions
    Given a dormant backend taking 12 seconds to respond
    When the user clicks "Get Instant Quote"
    Then from 0 to 2 seconds the button must display an inline spinner with "Calculating..."
    And from 3 to 10 seconds the UI must show a pulsating skeleton with "Waking up the pricing engine... (this takes a few seconds)"
    And upon receiving the response at 12 seconds the skeleton must transition into the quote card
```

