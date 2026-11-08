---
title: DeltaCare API
emoji: 🩺
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# DeltaCare API

Transparent, data-driven health insurance premium prediction REST API.

- **Hosting**: Hugging Face Spaces (Free CPU tier: 2 vCPUs, 16GB RAM)
- **Framework**: FastAPI + Uvicorn + Docker
- **Inference**: Scikit-Learn + XGBoost unified pipeline (`model.joblib`)
- **Port**: 7860
- **Rate Limit**: 60 requests/minute per IP (`slowapi`)

## Endpoints

### 1. `GET /health`
Returns service operational status and ML pipeline readiness.

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "model_loaded": true
}
```

### 2. `POST /predict`
Stateless actuarial estimate calculation with statistical confidence brackets.

**Request Payload:**
```json
{
  "age": 35,
  "sex": "male",
  "bmi": 26.5,
  "children": 1,
  "smoker": "no",
  "region": "northwest"
}
```

**Response Payload:**
```json
{
  "predicted_annual": 4350.00,
  "predicted_monthly": 362.50,
  "confidence_margin_annual": 1645.52,
  "confidence_margin_monthly": 137.13,
  "range_annual": [2704.48, 5995.52],
  "range_monthly": [225.37, 499.63],
  "currency": "USD"
}
```

