# DeltaCare — Machine Learning Course Submission Package

**Course**: Machine Learning  
**Project**: DeltaCare — Transparent Health Insurance Premium Estimation using CART  
**Algorithm**: Classification and Regression Trees (CART — `sklearn.tree.DecisionTreeRegressor`)  

---

## 1. Quick Start / How to Run

### Step 1: Install Dependencies
Create a virtual environment (optional) and install the standard ML packages:
```bash
pip install -r requirements.txt
```

### Step 2: Train the Model
Trains the unified pipeline on `insurance.csv` (80/20 train/test split, random seed 42) and generates `model.joblib` and `model_metadata.json`:
```bash
python train_model.py
```
*Expected Output*: $R^2 \approx 0.8692$, $\text{MAE} \approx \$1,749.60$, $\text{RMSE} \approx \$4,507.11$.

### Step 3: Run the Audit & Verification Gate
Audits model latency, non-linear interaction surge ($+\$34,473.18$), and tests 1,568 demographic combinations for strict smoking price monotonicity:
```bash
python audit_model.py
```
*Expected Output*: `[GATE VERDICT: PASSED]` with 0 monotonicity violations.

### Step 4: Run Real-Time Prediction & What-If Analysis
Run the interactive CLI predictor with sample or custom arguments:
```bash
# Default smoker profile
python predict.py

# Custom parameters
python predict.py --age 20 --sex male --bmi 24.0 --children 2 --smoker yes --region northwest
```

---

## 2. Directory Contents

| File | Purpose |
| :--- | :--- |
| `train_model.py` | Complete data preprocessing, atomic pipeline construction, CART training, and serialization. |
| `audit_model.py` | Benchmark evaluation, non-linear interaction verification, and 1,568-profile monotonicity audit. |
| `predict.py` | Stateless inference CLI with confidence intervals and counterfactual What-If savings analysis. |
| `insurance.csv` | The standard US Medical Cost Personal Dataset ($N = 1,338$ records). |
| `requirements.txt` | Minimal Python dependencies (`numpy`, `pandas`, `scikit-learn`, `joblib`). |
| `PROJECT_REPORT.md` | Full academic project report detailing theoretical formulation, math, and experiments. |
