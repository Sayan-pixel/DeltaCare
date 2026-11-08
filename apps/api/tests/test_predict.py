"""
Prediction Endpoint Tests for DeltaCare API
Traceability: FR-005, FR-006, ADR-003, ADR-006, ADR-008
"""

import pytest

VALID_PAYLOAD = {
    "age": 35,
    "sex": "male",
    "bmi": 26.5,
    "children": 1,
    "smoker": "no",
    "region": "northwest",
}


def test_predict_success(test_client):
    response = test_client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()

    assert "predicted_annual" in data
    assert "predicted_monthly" in data
    assert "confidence_margin_annual" in data
    assert "confidence_margin_monthly" in data
    assert "range_annual" in data
    assert "range_monthly" in data
    assert data["currency"] == "USD"

    # Verify rounding and relationships
    assert data["predicted_annual"] >= 1000.00
    expected_monthly = round(data["predicted_annual"] / 12.0, 2)
    assert abs(data["predicted_monthly"] - expected_monthly) <= 0.05

    # Verify range bounds
    assert data["range_annual"][0] <= data["predicted_annual"]
    assert data["predicted_annual"] <= data["range_annual"][1]


def test_predict_mathematical_floor_clamping(test_client):
    young_healthy = {
        "age": 18,
        "sex": "female",
        "bmi": 15.0,
        "children": 0,
        "smoker": "no",
        "region": "southwest",
    }
    response = test_client.post("/predict", json=young_healthy)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_annual"] >= 1000.00
    assert data["range_annual"][0] >= 1000.00


def test_predict_smoker_cost_difference(test_client):
    non_smoker_payload = {
        "age": 45,
        "sex": "male",
        "bmi": 32.0,
        "children": 0,
        "smoker": "no",
        "region": "northeast",
    }
    smoker_payload = {**non_smoker_payload, "smoker": "yes"}

    res_non_smoker = test_client.post("/predict", json=non_smoker_payload)
    res_smoker = test_client.post("/predict", json=smoker_payload)

    assert res_non_smoker.status_code == 200
    assert res_smoker.status_code == 200

    non_smoker_annual = res_non_smoker.json()["predicted_annual"]
    smoker_annual = res_smoker.json()["predicted_annual"]

    # Smoker with BMI 32 must be substantially more expensive
    assert smoker_annual - non_smoker_annual >= 10000.00


@pytest.mark.parametrize(
    "invalid_field,invalid_value",
    [
        ("age", 17),        # Under 18
        ("age", 101),       # Over 100
        ("bmi", 9.9),       # Under 10.0
        ("bmi", 60.1),      # Over 60.0
        ("children", -1),   # Negative children
        ("children", 11),   # Over 10 children
        ("sex", "other"),   # Invalid enum
        ("smoker", "often"),# Invalid enum
        ("region", "midwest"), # Invalid US region
    ],
)
def test_predict_validation_errors(test_client, invalid_field, invalid_value):
    bad_payload = {**VALID_PAYLOAD, invalid_field: invalid_value}
    response = test_client.post("/predict", json=bad_payload)
    assert response.status_code == 422
