"""
DeltaCare: Machine Learning Course Project — Training Script
Topic: Supervised Regression with Classification and Regression Trees (CART)
Author: DeltaCare Project Team

Description:
This script performs end-to-end data preparation, pipeline construction,
hyperparameter-regularized CART training, and holdout performance evaluation.
It outputs the serialized pipeline ('model.joblib') and metadata ('model_metadata.json').
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
from sklearn.tree import DecisionTreeRegressor


def load_dataset(data_path: Path) -> pd.DataFrame:
    """Loads and validates the US Medical Cost Personal Dataset."""
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found at: {data_path}")
    df = pd.read_csv(data_path)
    print(f"[DATA] Successfully loaded {len(df)} records from {data_path.name}")
    print(f"[DATA] Features: {list(df.columns)}")
    return df


def build_pipeline() -> Pipeline:
    """
    Constructs a unified, atomic scikit-learn Pipeline encapsulating:
    1. Numerical Standardization: Z-score scaling on continuous features (age, bmi, children).
    2. Categorical Encoding: One-Hot Encoding with first level dropped on nominal features (sex, smoker, region).
    3. CART Regressor: DecisionTreeRegressor with L1 (absolute_error) criterion and regularized pruning bounds.
    """
    numerical_features = ["age", "bmi", "children"]
    categorical_features = ["sex", "smoker", "region"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(drop="first", sparse_output=False), categorical_features),
        ],
        remainder="drop",
    )

    # CART Hyperparameters:
    # - criterion="absolute_error": Optimizes median/L1 loss for outlier robustness
    # - max_depth=6: Prevents unconstrained tree memorization
    # - min_samples_leaf=10: Enforces statistical support floor and guarantees strict smoking price monotonicity
    regressor = DecisionTreeRegressor(
        criterion="absolute_error",
        max_depth=6,
        min_samples_leaf=10,
        random_state=42,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ]
    )


def train_and_evaluate(df: pd.DataFrame, output_dir: Path):
    """Executes training, holdout evaluation, artifact serialization, and metadata export."""
    X = df.drop(columns=["charges"])
    y = df["charges"]

    # 80/20 train/test holdout split with fixed seed for exact reproducibility
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"[SPLIT] Training Set: {len(X_train)} samples | Holdout Test Set: {len(X_test)} samples")

    pipeline = build_pipeline()
    print("[TRAIN] Fitting unified CART pipeline (StandardScaler + OneHotEncoder + DecisionTreeRegressor)...")
    pipeline.fit(X_train, y_train)

    # Evaluate on unseen holdout test set
    y_pred = pipeline.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    print("\n" + "=" * 50)
    print("      HOLDOUT TEST EVALUATION RESULTS")
    print("=" * 50)
    print(f" R^2 Determination Coefficient: {r2:.4f}  (Course Gate: >= 0.85)")
    print(f" Mean Absolute Error (MAE):     ${mae:,.2f}  (Course Gate: <= $2,000.00)")
    print(f" Root Mean Squared Error (RMSE): ${rmse:,.2f}")
    print("=" * 50 + "\n")

    if r2 < 0.85 or mae > 2000.0:
        raise ValueError(f"Model failed quality gate: R^2 ({r2:.4f} < 0.85) or MAE (${mae:.2f} > $2000)")

    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "model.joblib"
    metadata_path = output_dir / "model_metadata.json"

    # Serialize atomic model pipeline
    print(f"[EXPORT] Saving serialized pipeline to: {model_path}")
    joblib.dump(pipeline, model_path)

    # Export statistical metadata
    metadata = {
        "model_name": "DeltaCare Decision Tree Regressor (CART)",
        "algorithm": "CART (sklearn.tree.DecisionTreeRegressor)",
        "criterion": "absolute_error",
        "max_depth": 6,
        "min_samples_leaf": 10,
        "random_state": 42,
        "dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "metrics": {
            "r2_score": round(r2, 4),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
        },
        "confidence_margin_annual": round(mae, 2),
        "confidence_margin_monthly": round(mae / 12.0, 2),
        "clamping_floor_annual": 1000.00,
        "exported_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[EXPORT] Statistical metadata saved to: {metadata_path}")


def main():
    script_dir = Path(__file__).resolve().parent
    data_path = script_dir / "insurance.csv"
    train_and_evaluate(load_dataset(data_path), script_dir)


if __name__ == "__main__":
    main()
