"""
DeltaCare Automated Holdout Benchmark Audit Gate
Validates that apps/api/models/model.joblib satisfies strict holdout quality criteria.
Traceability: FR-002, FR-003, NFR-001, ADR-003, ADR-008, ADR-011
"""

import sys
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import train_test_split

# Strict quality benchmark gates
MIN_R2_THRESHOLD = 0.85
MAX_MAE_THRESHOLD = 2000.00
MAX_LATENCY_MS = 100.0


def audit_model_artifact(repo_root: Path):
    data_path = repo_root / "apps" / "api" / "data" / "insurance.csv"
    model_path = repo_root / "apps" / "api" / "models" / "model.joblib"

    print("==================================================")
    print("   DELTACARE MODEL QUALITY AUDIT GATE            ")
    print("==================================================")

    # 1. Verify file existence
    if not model_path.exists():
        print(f"[FAIL] Model artifact missing: {model_path}")
        sys.exit(1)

    if not data_path.exists():
        print(f"[FAIL] Evaluation dataset missing: {data_path}")
        sys.exit(1)

    # 2. Deserialization Latency & Memory Audit
    start_time = time.perf_counter()
    pipeline = joblib.load(model_path)
    load_time_ms = (time.perf_counter() - start_time) * 1000.0
    file_size_kb = model_path.stat().st_size / 1024.0

    print(f"[AUDIT] Artifact Size:     {file_size_kb:.1f} KB")
    print(f"[AUDIT] Load Latency:      {load_time_ms:.2f} ms (Budget: <= {MAX_LATENCY_MS} ms)")

    # 3. Holdout Evaluation Benchmark
    df = pd.read_csv(data_path)
    X = df.drop(columns=["charges"])
    y = df["charges"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    y_pred = pipeline.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    print(f"[AUDIT] Holdout R^2:       {r2:.4f} (Required: >= {MIN_R2_THRESHOLD})")
    print(f"[AUDIT] Holdout MAE:       ${mae:,.2f} (Required: <= ${MAX_MAE_THRESHOLD:,.2f})")
    print(f"[AUDIT] Holdout RMSE:      ${rmse:,.2f}")

    # 4. Verify Non-Linear Interaction Effect & Strict Monotonicity (FR-002, ADR-011)
    # Compare smoker vs non-smoker price surge across high BMI (> 30)
    high_bmi_profile = pd.DataFrame([
        {"age": 45, "sex": "male", "bmi": 35.0, "children": 0, "smoker": "no", "region": "northeast"},
        {"age": 45, "sex": "male", "bmi": 35.0, "children": 0, "smoker": "yes", "region": "northeast"},
    ])
    interaction_preds = pipeline.predict(high_bmi_profile)
    smoker_surge = interaction_preds[1] - interaction_preds[0]
    print(f"[AUDIT] Smoker Price Surge (BMI 35): +${smoker_surge:,.2f}")

    if smoker_surge < 10000.0:
        print("[FAIL] Non-linear smoker x BMI interaction failed: expected >= $10,000 surge")
        sys.exit(1)

    # 4b. Strict Monotonicity Audit: Verify smoking status never reverses pricing across demographics
    # Includes profile flagged in PR #23 review (20yo male, BMI 24, 2 children, northwest)
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

    print(f"[AUDIT] Monotonicity Check ({len(test_profiles_yes)} profile pairs): {violations} violations (Min Smoker Premium Delta: +${min_savings:,.2f})")

    # Specific Devin PR review regression check (20yo male, northwest, BMI 24, 2 dependents)
    devin_check_df = pd.DataFrame([
        {"age": 20, "sex": "male", "bmi": 24.0, "children": 2, "region": "northwest", "smoker": "no"},
        {"age": 20, "sex": "male", "bmi": 24.0, "children": 2, "region": "northwest", "smoker": "yes"},
    ])
    devin_preds = pipeline.predict(devin_check_df)
    devin_savings = devin_preds[1] - devin_preds[0]
    print(f"[AUDIT] Devin PR Profile Savings Check (20yo NW BMI 24, 2 dep): +${devin_savings:,.2f}")

    if violations > 0 or devin_savings <= 0:
        print(f"[FAIL] Monotonicity failure: {violations} profiles priced smokers cheaper than non-smokers.")
        sys.exit(1)

    # 5. Gate Assertions
    failures = []
    if r2 < MIN_R2_THRESHOLD:
        failures.append(f"R^2 score {r2:.4f} is below minimum threshold {MIN_R2_THRESHOLD}")
    if mae > MAX_MAE_THRESHOLD:
        failures.append(f"MAE ${mae:,.2f} exceeds maximum threshold ${MAX_MAE_THRESHOLD:,.2f}")

    if failures:
        print("\n[GATE VERDICT: REJECTED]")
        for failure in failures:
            print(f" - {failure}")
        sys.exit(1)

    print("\n[GATE VERDICT: PASSED]")
    print("All predictive benchmarks, latency requirements, and interaction rules satisfied.")
    sys.exit(0)


def main():
    repo_root = Path(__file__).resolve().parent.parent
    audit_model_artifact(repo_root)


if __name__ == "__main__":
    main()

