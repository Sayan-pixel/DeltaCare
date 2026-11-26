"""
DeltaCare: Machine Learning Course Project — Interactive Prediction Demo
Topic: Model Inference, Actuarial Guardrails, Uncertainty Intervals, and Counterfactual What-If
Author: DeltaCare Project Team

Description:
Loads 'model.joblib' and demonstrates real-time inference on arbitrary or sample inputs.
Computes:
1. Annualized and Monthly predicted premiums.
2. Statistical confidence bounds (+/- MAE).
3. Counterfactual 'What-If' smoking cessation savings.
"""

import argparse
from pathlib import Path
import joblib
import pandas as pd


def predict_profile(pipeline, age: int, sex: str, bmi: float, children: int, smoker: str, region: str):
    profile = pd.DataFrame([{
        "age": age,
        "sex": sex.lower(),
        "bmi": float(bmi),
        "children": int(children),
        "smoker": smoker.lower(),
        "region": region.lower(),
    }])

    # 1. Primary Prediction
    raw_annual = float(pipeline.predict(profile)[0])
    # Mathematical floor guardrail ($1,000/yr minimum premium)
    final_annual = max(1000.0, raw_annual)
    final_monthly = final_annual / 12.0

    # 2. Confidence Bounds based on holdout MAE ($1,749.60)
    mae = 1749.60
    range_annual = (max(1000.0, final_annual - mae), final_annual + mae)
    range_monthly = (range_annual[0] / 12.0, range_annual[1] / 12.0)

    # 3. Counterfactual What-If Analysis (if smoker)
    what_if_savings = None
    if smoker.lower() == "yes":
        cf_profile = profile.copy()
        cf_profile["smoker"] = "no"
        cf_annual = max(1000.0, float(pipeline.predict(cf_profile)[0]))
        what_if_savings = max(0.0, final_annual - cf_annual)

    print("-" * 55)
    print("           DELTACARE ACTUARIAL QUOTE ESTIMATE")
    print("-" * 55)
    print(f" Profile: Age {age}, {sex.capitalize()}, BMI {bmi:.1f}, {children} Dep, Smoker: {smoker.capitalize()}, Region: {region.capitalize()}")
    print("-" * 55)
    print(f" Estimated Monthly Premium:  ${final_monthly:,.2f} / month")
    print(f" Estimated Annual Charges:  ${final_annual:,.2f} / year")
    print(f" Statistical Confidence:    ${range_monthly[0]:,.2f} - ${range_monthly[1]:,.2f} / mo")
    print(f" (Holdout Uncertainty: +/-${mae:,.2f}/yr, +/-${mae/12.0:,.2f}/mo)")

    if what_if_savings is not None:
        print("." * 55)
        print(f" [WHAT-IF] Smoking Cessation Impact:")
        print(f" Quitting smoking could save: ${what_if_savings:,.2f} / year (${what_if_savings/12.0:,.2f} / mo)")
    print("-" * 55 + "\n")


def main():
    parser = argparse.ArgumentParser(description="DeltaCare ML Premium Predictor CLI")
    parser.add_argument("--age", type=int, default=35, help="Age (18-100)")
    parser.add_argument("--sex", choices=["male", "female"], default="male", help="Sex")
    parser.add_argument("--bmi", type=float, default=26.5, help="Body Mass Index")
    parser.add_argument("--children", type=int, default=1, help="Number of dependent children")
    parser.add_argument("--smoker", choices=["yes", "no"], default="yes", help="Smoking status")
    parser.add_argument("--region", choices=["northeast", "northwest", "southeast", "southwest"], default="northwest", help="US Region")

    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    model_path = script_dir / "model.joblib"

    if not model_path.exists():
        print(f"[ERROR] Serialized model not found at: {model_path}")
        print("Please execute `python train_model.py` first.")
        return

    pipeline = joblib.load(model_path)
    predict_profile(pipeline, args.age, args.sex, args.bmi, args.children, args.smoker, args.region)


if __name__ == "__main__":
    main()
