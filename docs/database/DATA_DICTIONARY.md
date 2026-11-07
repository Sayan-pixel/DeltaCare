# Data Dictionary: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal Database Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-004](../decisions/004-stateless-b2c-mvp.md)

---

## 1. Terminology & Standards

This dictionary defines every data element utilized across DeltaCare's machine learning pipeline, API request/response payloads, and planned relational persistence models.

---

## 2. Granular Data Element Definitions

### 2.1 Element: `age`
- **Definition**: The chronological age in completed years of the primary insurance beneficiary.
- **Data Type**: Integer (32-bit).
- **Domain Constraints**: Minimum: `18`, Maximum: `100`.
- **Nullable**: No.
- **Sensitivity Classification**: Low (Demographic).

### 2.2 Element: `sex`
- **Definition**: Biological sex of the insurance policy contractor.
- **Data Type**: String Enum (`VARCHAR(6)`).
- **Permitted Values**: `'male'`, `'female'`.
- **Nullable**: No.
- **Sensitivity Classification**: Low.

### 2.3 Element: `bmi`
- **Definition**: Body Mass Index, calculated as weight in kilograms divided by height in meters squared ($\text{kg}/\text{m}^2$).
- **Data Type**: Floating Point (`NUMERIC(4, 1)`).
- **Domain Constraints**: Minimum: `10.0`, Maximum: `60.0`. Standard categories: Normal ($18.5–24.9$), Overweight ($25.0–29.9$), Obese ($\ge 30.0$).
- **Nullable**: No.
- **Sensitivity Classification**: Moderate (Health metric).

### 2.4 Element: `children`
- **Definition**: Total number of minor dependents covered under the insurance policy contract.
- **Data Type**: Integer (32-bit).
- **Domain Constraints**: Minimum: `0`, Maximum: `10`.
- **Nullable**: No.
- **Sensitivity Classification**: Low (Family demographic).

### 2.5 Element: `smoker`
- **Definition**: Tobacco use status of the beneficiary. Represents the primary non-linear risk driver in underwriting variance.
- **Data Type**: String Enum (`VARCHAR(3)`).
- **Permitted Values**: `'yes'`, `'no'`.
- **Nullable**: No.
- **Sensitivity Classification**: Moderate (Lifestyle health metric).

### 2.6 Element: `region`
- **Definition**: US geographic residential territory of the beneficiary plan.
- **Data Type**: String Enum (`VARCHAR(9)`).
- **Permitted Values**: `'northeast'`, `'southeast'`, `'southwest'`, `'northwest'`.
- **Nullable**: No.
- **Sensitivity Classification**: Low.

### 2.7 Element: `predicted_annual`
- **Definition**: The calculated baseline estimated medical charges for a 12-month policy period in USD.
- **Data Type**: Monetary Float (`NUMERIC(10, 2)`).
- **Domain Constraints**: Floor guardrail enforced: $\ge \$1,000.00$.
- **Nullable**: No.
- **Sensitivity Classification**: Low (Algorithmic output).

### 2.8 Element: `predicted_monthly`
- **Definition**: The calculated monthly consumer budgeting equivalent ($\text{predicted\_annual} / 12$).
- **Data Type**: Monetary Float (`NUMERIC(10, 2)`).
- **Domain Constraints**: $\ge \$83.33$.
- **Nullable**: No.
- **Sensitivity Classification**: Low.

### 2.9 Element: `confidence_margin_annual`
- **Definition**: The symmetrical error bracket ($\pm \text{MAE}$) representing the empirical uncertainty of the prediction model.
- **Data Type**: Monetary Float (`NUMERIC(10, 2)`).
- **Domain Constraints**: Fixed validation metric $\le \$2,000.00$.
- **Nullable**: No.
- **Sensitivity Classification**: Low.

