"""
Generate publication-grade PNG diagrams for Diagram 1 and Diagram 2.
Ensures 100% visual rendering reliability in Markdown, HTML, and Chrome PDF.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

ASSETS_DIR = Path("submission/assets")
ASSETS_DIR.mkdir(parents=True, exist_ok=True)


def generate_diagram1_pte():
    """Diagram 1: Mitchell's Learning Formalization <P, T, E>."""
    fig, ax = plt.subplots(figsize=(11, 2.8), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 2.8)
    ax.axis("off")

    boxes = [
        {
            "xy": (0.3, 0.4), "w": 2.2, "h": 2.0, "color": "#eff6ff", "edge": "#3b82f6",
            "title": "Experience (E)", "subtitle": "1,338 Actuarial Records",
            "lines": ["Demographics + Lifestyle", "80% Train (1,070 records)", "20% Holdout Test (268)"]
        },
        {
            "xy": (3.0, 0.4), "w": 2.2, "h": 2.0, "color": "#fdf4ff", "edge": "#a855f7",
            "title": "Learning Alg (L)", "subtitle": "Regularized CART Tree",
            "lines": ["L1 Absolute Error Loss", "max_depth = 6", "min_samples_leaf = 10"]
        },
        {
            "xy": (5.7, 0.4), "w": 2.2, "h": 2.0, "color": "#f0fdf4", "edge": "#10b981",
            "title": "Task (T)", "subtitle": "Predict Charges y",
            "lines": ["Continuous Actuarial $", "Input vector x in R^6", "What-If Lifestyle Savings"]
        },
        {
            "xy": (8.4, 0.4), "w": 2.2, "h": 2.0, "color": "#fffbeb", "edge": "#f59e0b",
            "title": "Performance (P)", "subtitle": "Actuarial Benchmark Gates",
            "lines": ["R² ≥ 0.85  (Achieved: 0.8692)", "MAE ≤ $2,000 (Achieved: $1,750)", "Zero Monotonicity Defects"]
        },
    ]

    for b in boxes:
        rect = patches.FancyBboxPatch(
            b["xy"], b["w"], b["h"], boxstyle="Round,pad=0.08,rounding_size=0.15",
            facecolor=b["color"], edgecolor=b["edge"], linewidth=1.8,
        )
        ax.add_patch(rect)

        cx = b["xy"][0] + b["w"] / 2
        top_y = b["xy"][1] + b["h"]

        # Title
        ax.text(cx, top_y - 0.32, b["title"], ha="center", va="center", fontsize=11, fontweight="bold", color="#0f172a")
        # Horizontal line
        ax.plot([b["xy"][0] + 0.2, b["xy"][0] + b["w"] - 0.2], [top_y - 0.52, top_y - 0.52], color=b["edge"], linewidth=1, alpha=0.6)
        # Subtitle
        ax.text(cx, top_y - 0.78, b["subtitle"], ha="center", va="center", fontsize=9.5, fontweight="bold", color=b["edge"])
        # Bullets
        for idx, line in enumerate(b["lines"]):
            ax.text(cx, top_y - 1.15 - (idx * 0.30), line, ha="center", va="center", fontsize=8.5, color="#334155")

    # Connectors
    for start_x in [2.58, 5.28, 7.98]:
        ax.annotate(
            "", xy=(start_x + 0.35, 1.4), xytext=(start_x, 1.4),
            arrowprops=dict(arrowstyle="-|>", color="#0284c7", lw=2.2, mutation_scale=15),
        )

    plt.tight_layout()
    out_path = ASSETS_DIR / "diagram1_pte_formulation.png"
    plt.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"[OK] Generated: {out_path}")


def generate_diagram2_pipeline():
    """Diagram 2: DeltaCare End-to-End Scikit-Learn Pipeline Architecture."""
    fig, ax = plt.subplots(figsize=(11, 3.6), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 3.6)
    ax.axis("off")

    # Box 1: Raw Actuarial Input
    rect1 = patches.FancyBboxPatch((0.2, 0.3), 2.3, 3.0, boxstyle="Round,pad=0.08,rounding_size=0.15", facecolor="#f8fafc", edgecolor="#64748b", linewidth=1.6)
    ax.add_patch(rect1)
    ax.text(1.35, 3.0, "Raw Actuarial Input", ha="center", va="center", fontsize=10.5, fontweight="bold", color="#0f172a")
    ax.plot([0.4, 2.3], [2.75, 2.75], color="#94a3b8", lw=1)

    features = [
        ("age", "int [18–64]"),
        ("bmi", "float [15.0–54.0]"),
        ("children", "int [0–5]"),
        ("sex", "male / female"),
        ("smoker", "yes / no"),
        ("region", "4 US quadrants"),
    ]
    for idx, (f_name, f_desc) in enumerate(features):
        ax.text(0.4, 2.45 - idx * 0.35, f"• {f_name}:", fontsize=9, fontweight="bold", color="#0f172a")
        ax.text(1.2, 2.45 - idx * 0.35, f_desc, fontsize=8.5, color="#64748b")
    ax.text(1.35, 0.48, "Pandas DataFrame / Dict", ha="center", va="center", fontsize=8, color="#94a3b8", style="italic")

    # Arrow to preprocessing
    ax.annotate("", xy=(3.0, 2.3), xytext=(2.55, 2.3), arrowprops=dict(arrowstyle="-|>", color="#0284c7", lw=2, mutation_scale=14))
    ax.annotate("", xy=(3.0, 1.1), xytext=(2.55, 1.1), arrowprops=dict(arrowstyle="-|>", color="#0284c7", lw=2, mutation_scale=14))

    # Box 2: ColumnTransformer (Outer Box)
    rect2 = patches.FancyBboxPatch((3.0, 0.3), 3.8, 3.0, boxstyle="Round,pad=0.08,rounding_size=0.15", facecolor="#f0fdf4", edgecolor="#16a34a", linewidth=1.6, linestyle="--")
    ax.add_patch(rect2)
    ax.text(4.9, 3.0, "Atomic ColumnTransformer", ha="center", va="center", fontsize=10.5, fontweight="bold", color="#15803d")

    # Sub-box 1: StandardScaler
    rect2a = patches.FancyBboxPatch((3.2, 1.7), 3.4, 1.05, boxstyle="Round,pad=0.06,rounding_size=0.12", facecolor="#ffffff", edgecolor="#86efac", linewidth=1.2)
    ax.add_patch(rect2a)
    ax.text(4.9, 2.45, "StandardScaler (Numerical)", ha="center", va="center", fontsize=9.5, fontweight="bold", color="#166534")
    ax.text(4.9, 2.18, "z = (x - μ) / σ  for [age, bmi, children]", ha="center", va="center", fontsize=8.5, color="#15803d")
    ax.text(4.9, 1.90, "Zero Mean, Unit Variance", ha="center", va="center", fontsize=8, color="#64748b")

    # Sub-box 2: OneHotEncoder
    rect2b = patches.FancyBboxPatch((3.2, 0.5), 3.4, 1.05, boxstyle="Round,pad=0.06,rounding_size=0.12", facecolor="#ffffff", edgecolor="#86efac", linewidth=1.2)
    ax.add_patch(rect2b)
    ax.text(4.9, 1.25, "OneHotEncoder (Categorical)", ha="center", va="center", fontsize=9.5, fontweight="bold", color="#166534")
    ax.text(4.9, 0.98, "drop='first', sparse_output=False", ha="center", va="center", fontsize=8.5, color="#15803d")
    ax.text(4.9, 0.70, "sex_male, smoker_yes, 3 region dummies", ha="center", va="center", fontsize=8, color="#64748b")

    # Arrow to Model
    ax.annotate("", xy=(7.3, 1.8), xytext=(6.85, 1.8), arrowprops=dict(arrowstyle="-|>", color="#0284c7", lw=2.2, mutation_scale=15))

    # Box 3: Estimator + Inference
    rect3 = patches.FancyBboxPatch((7.3, 0.3), 3.5, 3.0, boxstyle="Round,pad=0.08,rounding_size=0.15", facecolor="#f8fafc", edgecolor="#0284c7", linewidth=1.8)
    ax.add_patch(rect3)
    ax.text(9.05, 3.0, "DecisionTreeRegressor (CART)", ha="center", va="center", fontsize=10.5, fontweight="bold", color="#0369a1")
    ax.plot([7.5, 10.6], [2.75, 2.75], color="#bae6fd", lw=1)

    # Sub-box CART hyperparams
    rect3a = patches.FancyBboxPatch((7.5, 1.6), 3.1, 1.05, boxstyle="Round,pad=0.06,rounding_size=0.12", facecolor="#f0f9ff", edgecolor="#bae6fd", linewidth=1.2)
    ax.add_patch(rect3a)
    ax.text(9.05, 2.42, "Regularized Hyperparameters", ha="center", va="center", fontsize=9, fontweight="bold", color="#0369a1")
    ax.text(7.7, 2.15, "• criterion = 'absolute_error' (L1)", fontsize=8.2, color="#0c4a6e")
    ax.text(7.7, 1.90, "• max_depth = 6  (Capacity control)", fontsize=8.2, color="#0c4a6e")
    ax.text(7.7, 1.68, "• min_samples_leaf = 10 (Support)", fontsize=8.2, color="#0c4a6e")

    # Sub-box Output & Guardrails
    rect3b = patches.FancyBboxPatch((7.5, 0.5), 3.1, 0.95, boxstyle="Round,pad=0.06,rounding_size=0.12", facecolor="#ecfdf5", edgecolor="#a7f3d0", linewidth=1.2)
    ax.add_patch(rect3b)
    ax.text(9.05, 1.25, "Output: Actuarial Quote y_hat", ha="center", va="center", fontsize=9, fontweight="bold", color="#065f46")
    ax.text(9.05, 0.98, "Statistical Bounds: [y_hat ± $1,750]", ha="center", va="center", fontsize=8.2, color="#047857")
    ax.text(9.05, 0.72, "Counterfactual 'What-If' Savings", ha="center", va="center", fontsize=8.2, fontweight="bold", color="#059669")

    plt.tight_layout()
    out_path = ASSETS_DIR / "diagram2_pipeline_architecture.png"
    plt.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"[OK] Generated: {out_path}")


def main():
    print("Generating Diagram 1 (PTE Formulation)...")
    generate_diagram1_pte()
    print("Generating Diagram 2 (Pipeline Architecture)...")
    generate_diagram2_pipeline()
    print("Both flowchart diagrams generated successfully!")


if __name__ == "__main__":
    main()
