"""
DeltaCare End-to-End Cross-Service Verification Suite
Simulates real consumer journeys across diverse demographic personas.
Traceability: FR-005, FR-006, FR-008, FR-009, FR-010, NFR-001, NFR-002, ADR-003, ADR-008
"""

import sys
import time
from pathlib import Path

# Add project root to path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))

from apps.api.src.ml.model import model_service
from apps.api.src.schemas.quote import QuoteRequest, RegionEnum, SexEnum, SmokerEnum


def run_e2e_verification():
    print("==================================================")
    print("   DELTACARE END-TO-END CONSUMER FLOW AUDIT       ")
    print("==================================================")

    # 1. Initialize and load model pipeline
    start_load = time.perf_counter()
    model_service.load_model()
    load_ms = (time.perf_counter() - start_load) * 1000.0
    print(f"[E2E] ML Pipeline Loaded: {load_ms:.2f} ms")
    assert model_service.is_loaded, "Model service failed to initialize."

    # -------------------------------------------------------------
    # PERSONA 1: Healthy Young Non-Smoker (Floor & Baseline Guardrail)
    # -------------------------------------------------------------
    print("\n--- Testing Persona 1: Healthy Young Adult (Non-Smoker) ---")
    p1_req = QuoteRequest(
        age=19,
        sex=SexEnum.FEMALE,
        bmi=20.2,
        children=0,
        smoker=SmokerEnum.NO,
        region=RegionEnum.SOUTHWEST,
    )
    t0 = time.perf_counter()
    p1_res = model_service.predict(p1_req)
    p1_ms = (time.perf_counter() - t0) * 1000.0

    print(f"     Annual Premium:   ${p1_res.predicted_annual:,.2f} (Latency: {p1_ms:.2f} ms)")
    print(f"     Monthly Hero:     ${p1_res.predicted_monthly:,.2f} / month")
    print(f"     Monthly Range:    ${p1_res.range_monthly[0]:,.2f} – ${p1_res.range_monthly[1]:,.2f}")
    
    assert p1_res.predicted_annual >= 1000.00, "Violated FR-006 minimum clamping floor ($1,000/yr)"
    assert abs(p1_res.predicted_monthly - round(p1_res.predicted_annual / 12.0, 2)) <= 0.05
    assert p1_res.range_annual[0] <= p1_res.predicted_annual <= p1_res.range_annual[1]
    print("[PASS] Persona 1 assertions validated.")

    # -------------------------------------------------------------
    # PERSONA 2: Working Parent Non-Smoker (Family Actuarial Scaling)
    # -------------------------------------------------------------
    print("\n--- Testing Persona 2: Working Parent with Dependents ---")
    p2_req = QuoteRequest(
        age=42,
        sex=SexEnum.MALE,
        bmi=27.5,
        children=2,
        smoker=SmokerEnum.NO,
        region=RegionEnum.NORTHWEST,
    )
    t0 = time.perf_counter()
    p2_res = model_service.predict(p2_req)
    p2_ms = (time.perf_counter() - t0) * 1000.0

    print(f"     Annual Premium:   ${p2_res.predicted_annual:,.2f} (Latency: {p2_ms:.2f} ms)")
    print(f"     Monthly Hero:     ${p2_res.predicted_monthly:,.2f} / month")
    print(f"     Confidence (MAE): ±${p2_res.confidence_margin_annual:,.2f}")

    assert p2_res.predicted_annual > p1_res.predicted_annual, "Age and dependents must scale cost logically"
    assert abs(p2_res.predicted_monthly - round(p2_res.predicted_annual / 12.0, 2)) <= 0.05
    print("[PASS] Persona 2 assertions validated.")

    # -------------------------------------------------------------
    # PERSONA 3: Obese Smoker & Dynamic What-If Lifestyle Engine (FR-010)
    # -------------------------------------------------------------
    print("\n--- Testing Persona 3: Obese Smoker & What-If Savings Delta ---")
    p3_smoker_req = QuoteRequest(
        age=54,
        sex=SexEnum.MALE,
        bmi=36.5,
        children=1,
        smoker=SmokerEnum.YES,
        region=RegionEnum.NORTHEAST,
    )
    p3_smoker_res = model_service.predict(p3_smoker_req)

    # Synthetic non-smoker comparison
    p3_nonsmoker_req = QuoteRequest(
        age=54,
        sex=SexEnum.MALE,
        bmi=36.5,
        children=1,
        smoker=SmokerEnum.NO,
        region=RegionEnum.NORTHEAST,
    )
    p3_nonsmoker_res = model_service.predict(p3_nonsmoker_req)

    annual_savings = p3_smoker_res.predicted_annual - p3_nonsmoker_res.predicted_annual
    monthly_savings = p3_smoker_res.predicted_monthly - p3_nonsmoker_res.predicted_monthly

    print(f"     Current Smoker Price:    ${p3_smoker_res.predicted_annual:,.2f} (${p3_smoker_res.predicted_monthly:,.2f}/mo)")
    print(f"     Non-Smoker Equivalent:   ${p3_nonsmoker_res.predicted_annual:,.2f} (${p3_nonsmoker_res.predicted_monthly:,.2f}/mo)")
    print(f"     WHAT-IF SAVINGS BADGE:   Quitting saves ~${annual_savings:,.2f}/yr (${monthly_savings:,.2f}/mo)")

    assert p3_smoker_res.predicted_annual >= 30000.00, "High-BMI smoker must reflect significant risk underwriting"
    assert annual_savings >= 15000.00, "FR-010 What-If delta must capture non-linear smoker savings surge"
    assert monthly_savings > 1000.00, "Monthly savings must exceed $1,000/mo for high-risk smoker profile"
    print("[PASS] Persona 3 and What-If Lifestyle Engine assertions validated.")

    print("\n==================================================")
    print("   END-TO-END VERIFICATION: 100% PASSED          ")
    print("==================================================")
    return True


if __name__ == "__main__":
    success = run_e2e_verification()
    sys.exit(0 if success else 1)

