"""
Data Ingestion Script for DeltaCare
Fetches, validates, and caches the standard US Medical Cost Personal Dataset (insurance.csv).
Traceability: FR-001
"""

import sys
from pathlib import Path
import urllib.request
import pandas as pd

# Authoritative public raw dataset mirrors
PRIMARY_MIRROR_URL = (
    "https://raw.githubusercontent.com/stedy/Machine-Learning-with-R-datasets/master/insurance.csv"
)
FALLBACK_MIRROR_URL = (
    "https://gist.githubusercontent.com/meperezcuello/82a9f1c1c473d965e231682be82f1262/raw/9503073c4927e840a964811692ea6e7777ca43a2/insurance.csv"
)

EXPECTED_ROW_COUNT = 1338
EXPECTED_COLUMNS = ["age", "sex", "bmi", "children", "smoker", "region", "charges"]
EXPECTED_SEX = {"male", "female"}
EXPECTED_SMOKER = {"yes", "no"}
EXPECTED_REGIONS = {"northeast", "southeast", "southwest", "northwest"}


def download_dataset(destination_path: Path) -> Path:
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    
    if destination_path.exists():
        print(f"[INFO] Dataset already present locally at: {destination_path}")
        return destination_path

    print(f"[INFO] Fetching dataset from primary mirror: {PRIMARY_MIRROR_URL}")
    try:
        urllib.request.urlretrieve(PRIMARY_MIRROR_URL, destination_path)
    except Exception as primary_err:
        print(f"[WARN] Primary mirror download failed ({primary_err}). Trying fallback mirror...")
        urllib.request.urlretrieve(FALLBACK_MIRROR_URL, destination_path)

    print(f"[INFO] Ingestion complete. Saved to: {destination_path}")
    return destination_path


def validate_dataset(csv_path: Path) -> pd.DataFrame:
    print(f"[INFO] Validating schema and records for: {csv_path}")
    df = pd.read_csv(csv_path)

    # 1. Row count validation
    if len(df) != EXPECTED_ROW_COUNT:
        raise ValueError(
            f"Row count mismatch: expected {EXPECTED_ROW_COUNT}, got {len(df)}"
        )

    # 2. Column set validation
    if list(df.columns) != EXPECTED_COLUMNS:
        raise ValueError(
            f"Columns mismatch: expected {EXPECTED_COLUMNS}, got {list(df.columns)}"
        )

    # 3. Non-null check
    null_counts = df.isnull().sum()
    if null_counts.any():
        raise ValueError(f"Dataset contains null values:\n{null_counts}")

    # 4. Value domain integrity checks
    invalid_sex = set(df["sex"].unique()) - EXPECTED_SEX
    if invalid_sex:
        raise ValueError(f"Invalid sex categories detected: {invalid_sex}")

    invalid_smoker = set(df["smoker"].unique()) - EXPECTED_SMOKER
    if invalid_smoker:
        raise ValueError(f"Invalid smoker categories detected: {invalid_smoker}")

    invalid_region = set(df["region"].unique()) - EXPECTED_REGIONS
    if invalid_region:
        raise ValueError(f"Invalid region categories detected: {invalid_region}")

    if (df["age"] < 18).any() or (df["age"] > 100).any():
        raise ValueError("Age values out of valid range [18, 100]")

    if (df["bmi"] < 10.0).any() or (df["bmi"] > 60.0).any():
        raise ValueError("BMI values out of valid range [10.0, 60.0]")

    if (df["children"] < 0).any() or (df["children"] > 10).any():
        raise ValueError("Children count out of valid range [0, 10]")

    if (df["charges"] <= 0).any():
        raise ValueError("Charges must be strictly positive floats")

    print("[SUCCESS] Dataset validation passed: 1,338 records, 7 columns, zero nulls, all ranges valid.")
    return df


def main():
    repo_root = Path(__file__).resolve().parent.parent
    target_path = repo_root / "apps" / "api" / "data" / "insurance.csv"

    download_dataset(target_path)
    df = validate_dataset(target_path)

    print("\n--- Ingested Dataset Summary ---")
    print(f"Total Rows:    {len(df)}")
    print(f"Columns:       {', '.join(df.columns)}")
    print(f"Age Range:     {df['age'].min()} - {df['age'].max()} years")
    print(f"BMI Range:     {df['bmi'].min():.1f} - {df['bmi'].max():.1f}")
    print(f"Smoker Ratio:  {(df['smoker'] == 'yes').mean():.1%}")
    print(f"Charges Mean:  ${df['charges'].mean():,.2f}")
    print(f"Charges Range: ${df['charges'].min():,.2f} - ${df['charges'].max():,.2f}")


if __name__ == "__main__":
    main()

