"""
ML Inference Service for DeltaCare
Loads the serialized unified pipeline and executes clamped stateless predictions.
Traceability: FR-003, FR-005, FR-006, ADR-003, ADR-008
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd
from sklearn.pipeline import Pipeline

from ..core.config import settings
from ..core.logging import logger
from ..schemas.quote import QuoteRequest, QuoteResponse


class ModelService:
    """
    Manages lifecycle and inference for the unified scikit-learn + XGBoost pipeline.
    """
    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False

    def load_model(self, model_path: Optional[Path] = None, metadata_path: Optional[Path] = None):
        """Loads pipeline and holdout metadata into memory."""
        m_path = model_path or settings.MODEL_PATH
        meta_path = metadata_path or settings.METADATA_PATH

        if not m_path.exists():
            logger.error(f"Model artifact not found at: {m_path}")
            raise FileNotFoundError(f"Model artifact missing: {m_path}")

        logger.info(f"Loading unified ML pipeline from: {m_path}")
        self.pipeline = joblib.load(m_path)

        if meta_path.exists():
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
            logger.info(f"Loaded model metadata: MAE=${self.metadata.get('confidence_margin_annual', 0.0):,.2f}")
        else:
            logger.warning(f"Model metadata file missing at: {meta_path}; using fallback defaults.")
            self.metadata = {
                "confidence_margin_annual": 1645.52,
                "confidence_margin_monthly": 137.13,
            }

        self.is_loaded = True
        logger.info("Model pipeline loaded successfully and ready for inference.")

    def predict(self, request: QuoteRequest) -> QuoteResponse:
        """
        Executes end-to-end inference on stateless raw inputs.
        Zero train-serve skew: passes raw DataFrame directly into the unified pipeline.
        """
        if not self.is_loaded or self.pipeline is None:
            raise RuntimeError("Model pipeline has not been loaded.")

        # Convert Pydantic request directly into DataFrame matching training columns
        input_df = pd.DataFrame([
            {
                "age": request.age,
                "sex": request.sex.value,
                "bmi": request.bmi,
                "children": request.children,
                "smoker": request.smoker.value,
                "region": request.region.value,
            }
        ])

        # Execute unified pipeline (StandardScaler + OneHotEncoder + XGBRegressor)
        raw_annual = float(self.pipeline.predict(input_df)[0])

        # FR-006: Mathematical floor guardrail (>= $1,000.00/year)
        predicted_annual = round(max(raw_annual, settings.MINIMUM_PREMIUM_FLOOR), 2)
        predicted_monthly = round(predicted_annual / 12.0, 2)

        # ADR-008: Static empirical MAE confidence brackets
        margin_annual = float(self.metadata.get("confidence_margin_annual", 1645.52))
        margin_monthly = float(self.metadata.get("confidence_margin_monthly", round(margin_annual / 12.0, 2)))

        range_annual_lower = round(max(predicted_annual - margin_annual, settings.MINIMUM_PREMIUM_FLOOR), 2)
        range_annual_upper = round(predicted_annual + margin_annual, 2)

        range_monthly_lower = round(range_annual_lower / 12.0, 2)
        range_monthly_upper = round(range_annual_upper / 12.0, 2)

        return QuoteResponse(
            predicted_annual=predicted_annual,
            predicted_monthly=predicted_monthly,
            confidence_margin_annual=margin_annual,
            confidence_margin_monthly=margin_monthly,
            range_annual=[range_annual_lower, range_annual_upper],
            range_monthly=[range_monthly_lower, range_monthly_upper],
            currency="USD",
        )


model_service = ModelService()

