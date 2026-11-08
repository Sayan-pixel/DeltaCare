"""
Rate Limit Tests for DeltaCare API
Traceability: ADR-005
"""

PAYLOAD = {
    "age": 30,
    "sex": "female",
    "bmi": 24.0,
    "children": 0,
    "smoker": "no",
    "region": "southeast",
}


def test_rate_limit_exceeded(test_client):
    # Make multiple requests rapidly until rate limit is triggered
    status_codes = []
    # Setting in dev is 120/min, so we loop up to 130 times
    for _ in range(130):
        res = test_client.post("/predict", json=PAYLOAD)
        status_codes.append(res.status_code)
        if res.status_code == 429:
            break

    assert 429 in status_codes, "Rate limiter did not trigger 429 Too Many Requests"
