"""
Pytest Test Fixtures for DeltaCare API
Ensures ML pipeline is loaded and TestClient is cleanly managed.
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.src.main import app
from apps.api.src.ml.model import model_service


@pytest.fixture(scope="session", autouse=True)
def test_client():
    """Initializes model in memory and yields active TestClient."""
    model_service.load_model()
    with TestClient(app) as client:
        yield client
