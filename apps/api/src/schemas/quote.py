"""
Pydantic Schemas for DeltaCare Quote Service
Traceability: FR-004, FR-005, FR-006, ADR-008
"""

from enum import Enum
from typing import List
from pydantic import BaseModel, Field, field_validator


class SexEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"


class SmokerEnum(str, Enum):
    YES = "yes"
    NO = "no"


class RegionEnum(str, Enum):
    NORTHEAST = "northeast"
    SOUTHEAST = "southeast"
    SOUTHWEST = "southwest"
    NORTHWEST = "northwest"


class QuoteRequest(BaseModel):
    """
    Stateless actuarial profile input.
    Validates standard US medical underwriting factors.
    """
    age: int = Field(..., ge=18, le=100, description="Age in years (18-100)")
    sex: SexEnum = Field(..., description="Biological sex ('male' or 'female')")
    bmi: float = Field(..., ge=10.0, le=60.0, description="Body Mass Index (10.0-60.0)")
    children: int = Field(0, ge=0, le=10, description="Number of dependent children (0-10)")
    smoker: SmokerEnum = Field(..., description="Tobacco smoking status ('yes' or 'no')")
    region: RegionEnum = Field(..., description="US geographic region")

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 35,
                "sex": "male",
                "bmi": 26.5,
                "children": 1,
                "smoker": "no",
                "region": "northwest",
            }
        }
    }


class QuoteResponse(BaseModel):
    """
    Calculated premium estimate with dual-metric pricing and statistical bounds.
    """
    predicted_annual: float = Field(..., description="Estimated annual premium (clamped >= $1,000.00)")
    predicted_monthly: float = Field(..., description="Prioritized monthly premium estimate (predicted_annual / 12)")
    confidence_margin_annual: float = Field(..., description="Holdout validation empirical MAE margin")
    confidence_margin_monthly: float = Field(..., description="Monthly margin (annual margin / 12)")
    range_annual: List[float] = Field(..., description="Annual confidence range [lower, upper]")
    range_monthly: List[float] = Field(..., description="Monthly confidence range [lower, upper]")
    currency: str = Field("USD", description="Currency code")

    model_config = {
        "json_schema_extra": {
            "example": {
                "predicted_annual": 4350.00,
                "predicted_monthly": 362.50,
                "confidence_margin_annual": 1645.52,
                "confidence_margin_monthly": 137.13,
                "range_annual": [2704.48, 5995.52],
                "range_monthly": [225.37, 499.63],
                "currency": "USD",
            }
        }
    }


class HealthResponse(BaseModel):
    """
    Service health check response.
    Traceability: FR-004
    """
    status: str = Field("healthy", description="Service health state")
    version: str = Field("1.0.0", description="API version")
    model_loaded: bool = Field(..., description="Indicates if ML pipeline artifact is active in memory")

