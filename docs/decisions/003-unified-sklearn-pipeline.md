# ADR-003: Unified Scikit-Learn Pipeline Serialization

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior ML Engineer, Principal Software Architect, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-006](006-tree-ensemble-xgboost-regression.md)

---

## 1. Context
Machine learning systems frequently fail in production due to **train-serve skew**, where data transformations (numerical scaling, one-hot encoding, missing value imputation) executed during offline training are manually recoded inside online web API controllers. Subtle differences in library versions, column ordering, or floating-point arithmetic lead to corrupted feature matrices and silent, catastrophic prediction degradation.

---

## 2. Problem Statement
How should DeltaCare package, serialize, and serve its data preprocessing transformations and trained machine learning regressor to guarantee 100% mathematical parity between training and inference?

---

## 3. Decision
Enforce a single, atomic serialization pattern:
1. Combine `ColumnTransformer` (`StandardScaler` for numericals, `OneHotEncoder` for categoricals) and `XGBRegressor` into a single `sklearn.pipeline.Pipeline` object.
2. Export the entire fitted pipeline into a single binary artifact: `apps/api/models/model.joblib`.
3. In FastAPI, deserialization loads this single pipeline object: `pipeline = joblib.load(MODEL_PATH)`.
4. Inference passes the raw, un-transformed DataFrame directly to `pipeline.predict(df)`.

---

## 4. Reasoning
- **Elimination of Skew**: Because the exact same transformer objects fitted during training are executed during inference, feature encoding and scaling parity is mathematically guaranteed.
- **Zero API Preprocessing Code**: The API route does not contain a single line of scaling math or categorical string-to-integer mapping dictionaries.
- **Atomic Rollbacks**: Upgrading or rolling back the model is as simple as replacing the single `model.joblib` file.

---

## 5. Alternatives Considered
- **Alternative 1: Separate `scaler.pkl`, `encoder.pkl`, and `model.pkl` files** $\rightarrow$ *Rejected*: High risk of train-serve skew; requires multi-step loading and manual orchestration in API routes.
- **Alternative 2: ONNX Runtime Export** $\rightarrow$ *Rejected*: Adds compilation complexity; packaging complex scikit-learn categorical transformers with XGBoost into ONNX introduces unnecessary abstraction for a simple tabular model.
- **Alternative 3: Hardcoding Preprocessing in Python API Code** $\rightarrow$ *Rejected*: Terrible practice; guarantees train-serve drift whenever training data is refreshed.

---

## 6. Advantages (Positive Consequences)
- 100% elimination of train-serve feature drift.
- Simple, readable API controller code (`pipeline.predict(df)`).
- Single binary artifact simplifies Docker packaging.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Binary file size is larger than raw tree weights alone (~5–15MB).
- Requires Git LFS (Large File Storage) tracking in Git.

---

## 8. Technical Consequences
- `joblib` is a mandatory dependency in `apps/api/requirements.txt`.
- `.gitattributes` must track `*.joblib` via Git LFS.

---

## 9. Security Implications
- Deserializing arbitrary joblib/pickle files can execute arbitrary code. The API must only load `model.joblib` built internally by our verified repository scripts.

---

## 10. Operational & DevOps Implications
- Automated holdout benchmarks (`scripts/audit_model.py`) verify the serialized artifact before any deployment.

---

## 11. Constraints for Future Development
- Never extract transformers into separate files.
- Never write manual feature scaling or encoding logic in FastAPI routes.

---

## 12. Reversal Conditions
- If inference throughput requires microsecond-level latency at $> 10,000\text{ req/sec}$, consider compiling the tree ensemble to C/C++ or ONNX runtime.

