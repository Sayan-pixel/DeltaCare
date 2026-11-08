"""
DeltaCare Model Training Script
Trains a tree-ensemble regressor (XGBoost) within a unified scikit-learn Pipeline.
Serializes the fitted pipeline to apps/api/models/model.joblib and exports holdout metrics.
Traceability: FR-002, FR-003, ADR-003, ADR-006, ADR-008
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBRegressor


def build_pipeline() -> Pipeline:
    """Constructs the unified preprocessing and regression pipeline."""
    numerical_features = ["age", "bmi", "children"]
    categorical_features = ["sex", "smoker", "region"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(drop="first", sparse_output=False), categorical_features),
        ],
        remainder="drop",
    )

    regressor = XGBRegressor(
        objective="reg:absoluteerror",
        n_estimators=200,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ]
    )


def train_and_evaluate(data_path: Path, output_dir: Path):
    print(f"[INFO] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)

    X = df.drop(columns=["charges"])
    y = df["charges"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"[INFO] Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    pipeline = build_pipeline()
    print("[INFO] Fitting unified pipeline (StandardScaler + OneHotEncoder + XGBRegressor)...")
    pipeline.fit(X_train, y_train)

    # Evaluate on holdout test set
    y_pred = pipeline.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    print(f"[RESULT] Holdout Evaluation Metrics:")
    print(f"         R^2 Score: {r2:.4f} (Benchmark: >= 0.85)")
    print(f"         MAE:       ${mae:,.2f} (Benchmark: <= $2,000)")
    print(f"         RMSE:      ${rmse:,.2f}")

    if r2 < 0.85 or mae > 2000.0:
        raise ValueError(
            f"Quality benchmark failed: R^2 ({r2:.4f} < 0.85) or MAE (${mae:.2f} > $2000)"
        )

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "model.joblib"
    metadata_path = output_dir / "model_metadata.json"

    # Serialize atomic pipeline
    print(f"[INFO] Serializing pipeline artifact to: {model_path}")
    joblib.dump(pipeline, model_path)

    # Export metadata and confidence bounds
    metadata = {
        "model_name": "DeltaCare XGBoost Regressor",
        "version": "1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "random_state": 42,
        "dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": list(X.columns),
        "numerical_features": ["age", "bmi", "children"],
        "categorical_features": ["sex", "smoker", "region"],
        "metrics": {
            "r2_score": round(r2, 4),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
        },
        "confidence_margin_annual": round(mae, 2),
        "confidence_margin_monthly": round(mae / 12.0, 2),
        "clamping_floor_annual": 1000.00,
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[INFO] Metadata and confidence bounds saved to: {metadata_path}")

    # Self-test: Deserialization and inference smoke test
    print("[INFO] Verifying artifact deserialization and smoke inference...")
    loaded_pipeline = joblib.load(model_path)
    sample_input = pd.DataFrame(
        [
            {
                "age": 35,
                "sex": "male",
                "bmi": 26.5,
                "children": 1,
                "smoker": "no",
                "region": "northwest",
            }
        ]
    )
    sample_prediction = loaded_pipeline.predict(sample_input)[0]
    print(f"[SUCCESS] Test prediction for sample input: ${sample_prediction:,.2f}")


def main():
    repo_root = Path(__file__).resolve().parent.parent
    data_path = repo_root / "apps" / "api" / "data" / "insurance.csv"
    output_dir = repo_root / "apps" / "api" / "models"

    train_and_evaluate(data_path, output_dir)


if __name__ == "__main__":
    main()
