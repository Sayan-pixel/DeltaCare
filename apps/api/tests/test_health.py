"""
Health Endpoint Tests for DeltaCare API
Traceability: FR-004
"""

def test_health_check_returns_200(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert data["model_loaded"] is True
