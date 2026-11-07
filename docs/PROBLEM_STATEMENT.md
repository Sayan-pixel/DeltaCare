# Problem Statement: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Requirements Engineer & Product Manager  
**Status**: Baseline Reference  

---

## 1. Context & Industry Background

In the United States, healthcare insurance costs represent one of the single largest household financial commitments. Despite the immense financial impact on consumers, the process of determining an individual's expected premium is obscured behind closed corporate underwriting rules, opaque broker systems, and high-friction sales funnels.

---

## 2. The Core Problems

### 2.1 The Consumer Dimension: Opacity and Invasive Lead Harvesting
1. **Compulsory Identity Surrender**: Virtually every commercial quoting portal requires personal contact details (legal name, phone number, physical address, and personal email) before presenting an initial price estimate.
2. **Aggressive Sales Solicitation**: Submitting contact information instantly enters the consumer into high-pressure broker lead-generation funnels, triggering persistent phone calls, text messages, and spam emails.
3. **Black-Box Pricing**: Consumers are offered single take-it-or-leave-it rates without understanding which personal factors drove the price. They cannot readily determine how much of their premium is attributable to age versus modifiable factors such as smoking status or high BMI.
4. **False Precision & Deceptive Anchoring**: Portals often display arbitrary baseline numbers that jump significantly during underwriting, eroding consumer trust.

### 2.2 The Broker & Underwriter Dimension: Manual Quoting Inefficiency
1. **High Cost per Initial Ballpark**: Insurance brokers and agencies expend expensive professional hours conducting repetitive data intake for leads who are merely price-checking and have no immediate intent to buy.
2. **Top-of-Funnel Drop-Off**: Lengthy, complex multi-page questionnaires cause high-intent users to abandon the quoting workflow before receiving a preliminary estimate.
3. **Underwriting Bottlenecks**: In small to mid-sized agencies, lack of instant actuarial ballparking tools delays quoting turnarounds, reducing lead conversion rates.

---

## 3. Impact Analysis

| Stakeholder | Current Reality | Negative Consequence | Desired Future State |
| :--- | :--- | :--- | :--- |
| **Consumer** | Forced PII submission $\rightarrow$ High-pressure broker calls | Privacy violation, consumer anxiety, abandoned search | Instant, 100% anonymous, data-backed estimate in under 5 seconds |
| **Consumer** | Zero feedback on lifestyle costs | Missed opportunity for financial incentive to quit smoking / improve health | Clear What-If delta highlighting annual savings from health improvements |
| **Broker / Agency** | Manual data intake for unqualified leads | Wasted operational capacity, high customer acquisition cost | Automated, self-serve instant estimating engine filtering qualified leads |

---

## 4. Problem Boundary & Scope Constraints

- **DeltaCare is NOT an Underwriting Binder**: The system does not issue legally binding health insurance policies or execute definitive medical underwriting. It addresses the **pre-underwriting estimation gap**.
- **DeltaCare Solves for Transparency, Not Plan Selection**: In Phase 1, the product focuses on accurate actuarial cost estimation rather than recommending specific health maintenance organization (HMO) or preferred provider organization (PPO) carrier contracts.

