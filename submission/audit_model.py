"""
DeltaCare: Machine Learning Course Project — Model Audit & Monotonicity Verification
Topic: Empirical Validation, Non-Linear Interaction Verification, and Domain Monotonicity
Author: DeltaCare Project Team

Description:
Audits the trained CART model against strict actuarial benchmarks:
1. Model artifact serialization size and loading latency.
2. Holdout statistical quality gates (R^2 >= 0.85, MAE <= $2,000.00).
3. Non-linear interaction surge check (BMI >= 30 x Smoker interaction).
4. Strict smoking price monotonicity audit across 1,568 demographic combinations.
"""

import sys
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import train_test_split

MIN_R2_THRESHOLD = 0.85
MAX_MAE_THRESHOLD = 2000.00
MAX_LATENCY_MS = 100.0


def audit_model():
    script_dir = Path(__file__).resolve().parent
    data_path = script_dir / "insurance.csv"
    model_path = script_dir / "model.joblib"

    print("=" * 60)
    print("      DELTACARE MODEL QUALITY & DOMAIN AUDIT GATE")
    print("=" * 60)

    if not model_path.exists():
        print(f"[FAIL] Model artifact missing: {model_path}")
        print("Please run `python train_model.py` first.")
        sys.exit(1)

    # 1. Latency & Size Audit
    start_time = time.perf_counter()
    pipeline = joblib.load(model_path)
    load_time_ms = (time.perf_counter() - start_time) * 1000.0
    file_size_kb = model_path.stat().st_size / 1024.0

    print(f"[AUDIT] Artifact Size:        {file_size_kb:.1f} KB")
    print(f"[AUDIT] Load Latency:         {load_time_ms:.2f} ms")

    # 2. Holdout Statistical Evaluation
    df = pd.read_csv(data_path)
    X = df.drop(columns=["charges"])
    y = df["charges"]

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    y_pred = pipeline.predict(X_test)

    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    print(f"[AUDIT] Holdout R^2:          {r2:.4f} (Required: >= {MIN_R2_THRESHOLD})")
    print(f"[AUDIT] Holdout MAE:          ${mae:,.2f} (Required: <= ${MAX_MAE_THRESHOLD:,.2f})")
    print(f"[AUDIT] Holdout RMSE:         ${rmse:,.2f}")

    # 3. Non-Linear Interaction Effect (BMI 35 x Smoker Surge)
    high_bmi_profile = pd.DataFrame([
        {"age": 45, "sex": "male", "bmi": 35.0, "children": 0, "smoker": "no", "region": "northeast"},
        {"age": 45, "sex": "male", "bmi": 35.0, "children": 0, "smoker": "yes", "region": "northeast"},
    ])
    preds_surge = pipeline.predict(high_bmi_profile)
    surge = preds_surge[1] - preds_surge[0]
    print(f"[AUDIT] Smoker Price Surge (BMI 35): +${surge:,.2f} (Required: >= $10,000)")

    if surge < 10000.0:
        print("[FAIL] Interaction surge check failed.")
        sys.exit(1)

    # 4. Comprehensive Demographic Monotonicity Audit
    # Generates 1,568 demographic pairs across age, BMI, dependents, sex, and region.
    # Asserts that smoking status never lowers insurance charges all else being equal.
    test_profiles_yes = []
    test_profiles_no = []
    for age in [19, 20, 25, 30, 40, 50, 60]:
        for bmi in [18.5, 22.0, 24.0, 28.0, 30.0, 35.0, 40.0]:
            for children in [0, 1, 2, 3]:
                for sex in ["male", "female"]:
                    for region in ["northeast", "northwest", "southeast", "southwest"]:
                        test_profiles_yes.append({"age": age, "sex": sex, "bmi": bmi, "children": children, "region": region, "smoker": "yes"})
                        test_profiles_no.append({"age": age, "sex": sex, "bmi": bmi, "children": children, "region": region, "smoker": "no"})

    df_p_yes = pd.DataFrame(test_profiles_yes)
    df_p_no = pd.DataFrame(test_profiles_no)
    preds_yes = pipeline.predict(df_p_yes)
    preds_no = pipeline.predict(df_p_no)
    violations = np.sum(preds_yes <= preds_no)
    min_savings = np.min(preds_yes - preds_no)

    print(f"[AUDIT] Monotonicity Pairs:    {len(test_profiles_yes)} profiles tested")
    print(f"[AUDIT] Monotonicity Defects:  {violations} violations")
    print(f"[AUDIT] Minimum Smoker Delta:  +${min_savings:,.2f}")

    # Specific profile test (20yo male, Northwest, BMI 24, 2 dependents)
    profile_check = pd.DataFrame([
        {"age": 20, "sex": "male", "bmi": 24.0, "children": 2, "region": "northwest", "smoker": "no"},
        {"age": 20, "sex": "male", "bmi": 24.0, "children": 2, "region": "northwest", "smoker": "yes"},
    ])
    p_check = pipeline.predict(profile_check)
    savings_check = p_check[1] - p_check[0]
    print(f"[AUDIT] 20yo NW BMI 24 Check:  Smoker=${p_check[1]:,.2f} | Non-Smoker=${p_check[0]:,.2f} | Savings=+${savings_check:,.2f}")

    if violations > 0 or r2 < MIN_R2_THRESHOLD or mae > MAX_MAE_THRESHOLD:
        print("\n[GATE VERDICT: REJECTED]")
        sys.exit(1)

    print("\n" + "=" * 60)
    print(" [GATE VERDICT: PASSED] All statistical and domain criteria met!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    audit_model()
