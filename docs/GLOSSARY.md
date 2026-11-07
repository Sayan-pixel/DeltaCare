# Glossary & Taxonomy: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Technical Documentation Engineer  
**Status**: Baseline Reference  

---

## 1. Domain & Actuarial Terminology

- **Actuarial Risk**: The statistical assessment of the financial risk associated with insuring an individual based on empirical demographic and lifestyle variables.
- **BMI (Body Mass Index)**: A calculated metric ($\text{weight in kg} / (\text{height in meters})^2$) representing body fatness; standard categorization: $< 18.5$ (Underweight), $18.5–24.9$ (Normal), $25.0–29.9$ (Overweight), $\ge 30.0$ (Obese).
- **Charges (Medical Charges)**: The annualized total medical expenditure billed to health insurance for an individual beneficiary, representing the continuous target variable ($y$) in `insurance.csv`.
- **Underwriting**: The formalized process through which an insurance company evaluates the risk of insuring a client and determines the official, binding premium price.
- **Underwriting Binder**: A temporary legal agreement issued by an insurance company that formally binds coverage until a formal policy is executed. *DeltaCare does not issue binders.*
- **Premium**: The recurring dollar amount paid by an individual or business to maintain an active health insurance policy (typically billed monthly).
- **What-If Analysis**: In DeltaCare, an interactive comparison engine quantifying the financial premium delta between a user's current lifestyle metric (e.g., smoker) and an optimized counterfactual metric (e.g., non-smoker).

---

## 2. Machine Learning Terminology

- **ColumnTransformer**: A scikit-learn utility that allows different input columns or subsets of features to be independently transformed (e.g., numericals scaled, categoricals one-hot encoded) and concatenated into a single feature matrix.
- **Explainability (SHAP)**: *SHapley Additive exPlanations*, a game-theoretic approach to explain the output of any machine learning model by computing the marginal contribution of each feature to the individual prediction.
- **MAE (Mean Absolute Error)**: A continuous regression metric measuring the average magnitude of the errors in a set of predictions, without considering their direction: $\text{MAE} = \frac{1}{n}\sum |y_i - \hat{y}_i|$.
- **$R^2$ (Coefficient of Determination)**: The proportion of the variance in the dependent variable that is predictable from the independent variables, where $1.0$ represents perfect prediction.
- **RMSE (Root Mean Squared Error)**: A regression metric that penalizes larger errors more severely than MAE: $\text{RMSE} = \sqrt{\frac{1}{n}\sum (y_i - \hat{y}_i)^2}$.
- **Train-Serve Skew**: A dangerous software defect where data transformations applied during model training differ subtly from transformations applied during real-time online inference, causing erratic or degraded predictions.
- **Unified Pipeline**: A software pattern in scikit-learn (`sklearn.pipeline.Pipeline`) where preprocessing transformers and estimators are serialized into a single binary object (`model.joblib`), completely eliminating train-serve skew.
- **XGBoost**: *Extreme Gradient Boosting*, an optimized distributed gradient boosting library implementing machine learning algorithms under the Gradient Boosting framework.

---

## 3. Architecture & Infrastructure Terminology

- **Cold Start**: The latency delay experienced when a dormant, serverless container or instance spins up from a suspended state to an active running state upon receiving an incoming HTTP request.
- **CORS (Cross-Origin Resource Sharing)**: A browser security mechanism that restricts HTTP requests initiated from scripts running in one origin domain to resources hosted on a different origin domain.
- **Debounce**: A programming practice used to limit the rate at which a function is fired; in DeltaCare, delaying the execution of prediction API calls while a user is actively scrubbing the BMI slider until a 300–500ms pause occurs.
- **Hugging Face Spaces**: A cloud platform providing Git-backed hosting for machine learning applications, utilized in DeltaCare on its Free CPU Tier (2 vCPUs, 16GB RAM, Docker runtime).
- **In-Memory Token Bucket**: A rate-limiting algorithm (`slowapi`) where requests consume tokens from a virtual bucket refilled at a constant rate, stored purely in process RAM without requiring an external Redis database.
- **Optimistic Pre-Warming**: An architectural pattern where the web client dispatches a non-blocking `GET /health` request upon page load to awaken the sleeping backend container before the user submits a calculation.
- **PII (Personally Identifiable Information)**: Any representation of information that permits the identity of an individual to whom the information applies to be reasonably inferred. DeltaCare maintains a strict 0% PII retention policy.
- **Polyrepo**: A software development strategy where isolated services (API, frontend) reside in distinct repositories or segregated directory trees with separate CI/CD pipelines.
- **Pydantic**: A data validation and settings management library for Python utilizing Python type annotations to enforce strict request and response schema integrity.
- **Vercel**: A cloud platform for frontend developers providing automatic continuous deployment, global edge content delivery network (CDN), and zero-sleep hosting for modern web frameworks.

