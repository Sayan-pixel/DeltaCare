"""
DeltaCare Academic Report Chart Generator
Generates publication-quality, 300-DPI visual figures for the project report:
1. Fig 1: BMI vs Charges interaction faceted by Smoking status.
2. Fig 2: Comprehensive Model Benchmark Comparison (MAE & R^2).
3. Fig 3: Residual Analysis & Error Distribution.
4. Fig 4: Strict Monotonicity Audit Curves.
Author: Sayan Shit (2401179)
"""

from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, PolynomialFeatures, StandardScaler
from sklearn.tree import DecisionTreeRegressor

# Style configuration for IEEE/ACM academic aesthetic
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.family": "serif",
    "font.size": 11,
    "axes.labelsize": 12,
    "axes.titlesize": 13,
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "legend.fontsize": 10,
    "figure.titlesize": 14,
    "figure.dpi": 300,
})

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "apps" / "api" / "data" / "insurance.csv"
ASSETS_DIR = REPO_ROOT / "submission" / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)


def load_and_prep_data():
    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=["charges"])
    y = df["charges"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    return df, X_train, X_test, y_train, y_test


def generate_fig1_interaction_scatter(df):
    """Figure 1: Non-linear interaction between BMI and Smoker status."""
    fig, ax = plt.subplots(figsize=(8, 5))

    non_smokers = df[df["smoker"] == "no"]
    smokers = df[df["smoker"] == "yes"]

    ax.scatter(non_smokers["bmi"], non_smokers["charges"], color="#2563eb", alpha=0.6, s=35, label="Non-Smoker", edgecolors="none")
    ax.scatter(smokers["bmi"], smokers["charges"], color="#dc2626", alpha=0.7, s=40, label="Smoker", edgecolors="none")

    # Annotate the non-linear inflection at BMI >= 30
    ax.axvline(x=30.0, color="#475569", linestyle="--", linewidth=1.5, label="Obesity Threshold (BMI = 30)")
    ax.annotate(
        "Discontinuous Price Surge\n(+$34,473 for Obese Smokers)",
        xy=(32, 38000),
        xytext=(35, 24000),
        arrowprops=dict(facecolor="#b91c1c", shrink=0.08, width=1.5, headwidth=7),
        fontsize=10,
        fontweight="bold",
        color="#b91c1c",
        bbox=dict(boxstyle="round,pad=0.4", facecolor="#fef2f2", edgecolor="#f87171", alpha=0.9),
    )

    ax.set_title("Empirical Actuarial Risk: BMI vs. Medical Charges by Smoking Status", fontweight="bold", pad=12)
    ax.set_xlabel("Body Mass Index (BMI, kg/m²)")
    ax.set_ylabel("Annual Medical Charges (USD, $)")
    ax.yaxis.set_major_formatter(ticker.StrMethodFormatter("${x:,.0f}"))
    ax.legend(frameon=True, loc="upper left")
    plt.tight_layout()

    out_path = ASSETS_DIR / "fig1_interaction_scatter.png"
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")


def generate_fig2_model_performance(X_train, X_test, y_train, y_test):
    """Figure 2: Comprehensive benchmark comparison across models."""
    pre = ColumnTransformer([
        ("num", StandardScaler(), ["age", "bmi", "children"]),
        ("cat", OneHotEncoder(drop="first", sparse_output=False), ["sex", "smoker", "region"]),
    ])

    models = {
        "OLS Linear": Pipeline([("pre", pre), ("m", LinearRegression())]),
        "Ridge Reg": Pipeline([("pre", pre), ("m", Ridge(alpha=1.0))]),
        "Poly Deg-2": Pipeline([("pre", pre), ("p", PolynomialFeatures(2)), ("m", Ridge(alpha=10.0))]),
        "Unconstrained\nTree": Pipeline([("pre", pre), ("m", DecisionTreeRegressor(random_state=42))]),
        "DeltaCare\nTuned CART": Pipeline([("pre", pre), ("m", DecisionTreeRegressor(criterion="absolute_error", max_depth=6, min_samples_leaf=10, random_state=42))]),
    }

    names = ["OLS Linear", "Ridge Reg", "Poly Deg-2", "Unconstrained Tree", "DeltaCare (CART)"]
    maes = []
    r2s = []

    for pipe in models.values():
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        maes.append(mean_absolute_error(y_test, preds))
        r2s.append(r2_score(y_test, preds))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5))

    # Panel A: Holdout MAE
    colors_mae = ["#94a3b8", "#94a3b8", "#fbbf24", "#f87171", "#10b981"]
    bars1 = ax1.bar(names, maes, color=colors_mae, edgecolor="#334155", linewidth=1.2, width=0.55)
    ax1.axhline(y=2000.0, color="#dc2626", linestyle="--", linewidth=1.5, label="Quality Gate (MAE ≤ $2,000)")
    ax1.set_title("A) Holdout Test MAE (Lower is Better)", fontweight="bold")
    ax1.set_ylabel("Mean Absolute Error (USD, $)")
    ax1.yaxis.set_major_formatter(ticker.StrMethodFormatter("${x:,.0f}"))
    ax1.set_ylim(0, 5000)
    ax1.legend(loc="upper right")
    ax1.tick_params(axis="x", rotation=15)

    for bar, val in zip(bars1, maes):
        ax1.text(bar.get_x() + bar.get_width() / 2, val + 100, f"${val:,.0f}", ha="center", va="bottom", fontsize=9, fontweight="bold")

    # Panel B: Holdout R^2
    colors_r2 = ["#94a3b8", "#94a3b8", "#38bdf8", "#f87171", "#0284c7"]
    bars2 = ax2.bar(names, r2s, color=colors_r2, edgecolor="#334155", linewidth=1.2, width=0.55)
    ax2.axhline(y=0.85, color="#dc2626", linestyle="--", linewidth=1.5, label="Quality Gate (R² ≥ 0.85)")
    ax2.set_title("B) Holdout Test R² Score (Higher is Better)", fontweight="bold")
    ax2.set_ylabel("Coefficient of Determination (R²)")
    ax2.set_ylim(0.5, 1.0)
    ax2.legend(loc="upper left")
    ax2.tick_params(axis="x", rotation=15)

    for bar, val in zip(bars2, r2s):
        ax2.text(bar.get_x() + bar.get_width() / 2, val + 0.015, f"{val:.4f}", ha="center", va="bottom", fontsize=9, fontweight="bold")

    plt.tight_layout()
    out_path = ASSETS_DIR / "fig2_model_performance_comparison.png"
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")


def generate_fig3_residual_analysis(X_train, X_test, y_train, y_test):
    """Figure 3: Residual analysis of the regularized CART model."""
    pre = ColumnTransformer([
        ("num", StandardScaler(), ["age", "bmi", "children"]),
        ("cat", OneHotEncoder(drop="first", sparse_output=False), ["sex", "smoker", "region"]),
    ])
    pipe = Pipeline([
        ("pre", pre),
        ("m", DecisionTreeRegressor(criterion="absolute_error", max_depth=6, min_samples_leaf=10, random_state=42))
    ])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    residuals = y_test - y_pred
    mae = mean_absolute_error(y_test, y_pred)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5))

    # Left: Residuals vs Predicted
    ax1.scatter(y_pred, residuals, color="#0284c7", alpha=0.6, s=35, edgecolors="#0369a1")
    ax1.axhline(y=0, color="#0f172a", linestyle="-", linewidth=1.2)
    ax1.axhline(y=mae, color="#16a34a", linestyle="--", linewidth=1.2, label=f"+MAE (+${mae:,.0f})")
    ax1.axhline(y=-mae, color="#16a34a", linestyle="--", linewidth=1.2, label=f"-MAE (-${mae:,.0f})")
    ax1.set_title("A) Residuals vs. Predicted Premium", fontweight="bold")
    ax1.set_xlabel("Predicted Medical Charges (USD, $)")
    ax1.set_ylabel("Residual Error (Actual - Predicted, $)")
    ax1.xaxis.set_major_formatter(ticker.StrMethodFormatter("${x:,.0f}"))
    ax1.yaxis.set_major_formatter(ticker.StrMethodFormatter("${x:,.0f}"))
    ax1.legend(loc="upper left")

    # Right: Error Distribution Histogram
    sns.histplot(residuals, kde=True, ax=ax2, color="#0284c7", bins=20, edgecolor="#0f172a")
    ax2.axvline(x=0, color="#0f172a", linestyle="-", linewidth=1.2)
    ax2.axvline(x=mae, color="#16a34a", linestyle="--", linewidth=1.2)
    ax2.axvline(x=-mae, color="#16a34a", linestyle="--", linewidth=1.2)
    ax2.set_title("B) Residual Error Distribution", fontweight="bold")
    ax2.set_xlabel("Residual Error (USD, $)")
    ax2.set_ylabel("Frequency")
    ax2.xaxis.set_major_formatter(ticker.StrMethodFormatter("${x:,.0f}"))

    plt.tight_layout()
    out_path = ASSETS_DIR / "fig3_residual_analysis.png"
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")


def generate_fig4_monotonicity_audit(X_train, y_train):
    """Figure 4: Monotonicity audit curves across BMIs and Age brackets."""
    pre = ColumnTransformer([
        ("num", StandardScaler(), ["age", "bmi", "children"]),
        ("cat", OneHotEncoder(drop="first", sparse_output=False), ["sex", "smoker", "region"]),
    ])
    pipe = Pipeline([
        ("pre", pre),
        ("m", DecisionTreeRegressor(criterion="absolute_error", max_depth=6, min_samples_leaf=10, random_state=42))
    ])
    pipe.fit(X_train, y_train)

    bmi_range = np.linspace(16.0, 50.0, 100)
    fig, ax = plt.subplots(figsize=(8.5, 4.8))

    colors = {"25yo": "#0284c7", "45yo": "#7c3aed", "60yo": "#d97706"}

    for age, col in [("25yo", "#0284c7"), ("45yo", "#7c3aed"), ("60yo", "#d97706")]:
        age_val = int(age.replace("yo", ""))
        df_yes = pd.DataFrame([{"age": age_val, "sex": "male", "bmi": b, "children": 1, "region": "northwest", "smoker": "yes"} for b in bmi_range])
        df_no = pd.DataFrame([{"age": age_val, "sex": "male", "bmi": b, "children": 1, "region": "northwest", "smoker": "no"} for b in bmi_range])

        p_yes = pipe.predict(df_yes)
        p_no = pipe.predict(df_no)

        ax.plot(bmi_range, p_yes, label=f"Smoker ({age})", color=col, linestyle="-", linewidth=2.0)
        ax.plot(bmi_range, p_no, label=f"Non-Smoker ({age})", color=col, linestyle=":", linewidth=1.8)

    ax.axvline(x=30.0, color="#475569", linestyle="--", linewidth=1.2, alpha=0.7)
    ax.text(30.5, 8000, "Obesity Threshold (BMI=30)", fontsize=9, color="#475569", rotation=90)

    ax.set_title("Monotonicity Verification: Smoker vs. Non-Smoker Quotes Across BMI & Age", fontweight="bold", pad=12)
    ax.set_xlabel("Body Mass Index (BMI, kg/m²)")
    ax.set_ylabel("Predicted Annual Charges (USD, $)")
    ax.yaxis.set_major_formatter(ticker.StrMethodFormatter("${x:,.0f}"))
    ax.legend(loc="upper left", ncol=3, frameon=True)
    plt.tight_layout()

    out_path = ASSETS_DIR / "fig4_monotonicity_audit.png"
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")


def main():
    print("[1/5] Loading data for figure generation...")
    df, X_train, X_test, y_train, y_test = load_and_prep_data()

    print("[2/5] Plotting Figure 1: Non-Linear Interaction Scatter...")
    generate_fig1_interaction_scatter(df)

    print("[3/5] Plotting Figure 2: Model Performance Benchmarks...")
    generate_fig2_model_performance(X_train, X_test, y_train, y_test)

    print("[4/5] Plotting Figure 3: Residual Analysis & Distribution...")
    generate_fig3_residual_analysis(X_train, X_test, y_train, y_test)

    print("[5/5] Plotting Figure 4: Monotonicity Audit Curves...")
    generate_fig4_monotonicity_audit(X_train, y_train)

    print("\nAll 4 publication figures generated successfully in: submission/assets/")


if __name__ == "__main__":
    main()
