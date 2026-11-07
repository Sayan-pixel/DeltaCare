# ADR-002: Perpetual $0 Infrastructure & Hosting Strategy

**Document Version**: 1.0.0  
**Status**: Accepted  
**Date**: 2026-11-08  
**Deciders**: Senior DevOps Engineer, Principal Software Architect, Technical Lead  
**Technical Lead Approval**: Approved by Technical Lead on 2026-11-08  
**Related ADRs**: [ADR-001](001-decoupled-monorepo.md), [ADR-007](007-three-stage-cold-start-ux.md)

---

## 1. Context
The user has established a non-negotiable financial constraint: **strictly $0.00 total spend perpetually**. Commercial cloud providers (AWS, Google Cloud, Azure) require credit cards upon sign-up and terminate their introductory free tiers after 12 months. Free-tier container hosts like Render and Fly.io enforce tight 512MB RAM limits, which frequently trigger Out-Of-Memory (OOM) crashes when deserializing Pandas, Scikit-learn, and XGBoost models into memory.

---

## 2. Problem Statement
How can DeltaCare host a containerized machine learning API and a responsive web frontend with perpetual $0.00 cloud hosting spend, zero credit card requirement, zero risk of surprise billing, and zero Out-Of-Memory crashes?

---

## 3. Decision
1. **Frontend Hosting**: Deploy `apps/web` to **Vercel Hobby Free Tier** (global edge CDN, free automatic SSL, zero container sleep).
2. **Backend API Hosting**: Deploy `apps/api` to **Hugging Face Spaces Free CPU Tier** (Docker runtime, 2 vCPUs, **16GB RAM**, no credit card required, native Git LFS support).
3. **Cold-Start Management**: Mitigate container dormancy through client-side optimistic background `GET /health` pre-warming and a 3-tier progressive UX indicator.

---

## 4. Reasoning
- **Hugging Face Spaces 16GB RAM Advantage**: Loading Python runtime, FastAPI, Pandas, Scikit-learn, and `model.joblib` into memory consumes $\approx 500\text{MB}$. Deploying on Render or Fly.io (512MB limit) leaves zero safety buffer and results in random OOM process termination. Hugging Face Spaces' 16GB allocation provides an **$8\times$ memory safety margin**.
- **Zero Credit Card Guarantee**: Hugging Face Spaces public CPU tier and Vercel Hobby tier do not require a payment method on file, completely eliminating unexpected billing risks.
- **Vercel Edge Performance**: Vercel's global CDN delivers static React assets instantaneously without cold starts, ensuring the user experiences immediate page load regardless of backend state.

---

## 5. Alternatives Considered
- **Alternative 1: Render / Fly.io Free Web Services** $\rightarrow$ *Rejected*: 512MB RAM ceiling causes frequent OOM crashes during peak inference or model load.
- **Alternative 2: AWS EC2 (t2.micro / t3.micro)** $\rightarrow$ *Rejected*: Expires after 12 months; requires credit card; charges for EBS storage and elastic IP allocations.
- **Alternative 3: PythonAnywhere Free Tier** $\rightarrow$ *Rejected*: Restricts outbound network calls; lacks Docker container support; CPU limits restrict modern async FastAPI/Uvicorn runtimes.

---

## 6. Advantages (Positive Consequences)
- Perpetual $0.00 operating cost with zero billing liability.
- 16GB RAM prevents all OOM exceptions.
- Global edge caching for frontend assets via Vercel CDN.

---

## 7. Disadvantages (Negative Consequences & Trade-offs)
- Free Hugging Face Spaces sleep after ~48 hours of inactivity, resulting in a 12–15 second cold start upon first activation.

---

## 8. Technical Consequences
- Backend must be packaged as a Docker container binding to port `7860`.
- Frontend must implement background pre-warming logic and staged progress indicators.

---

## 9. Security Implications
- Automated SSL/TLS certificates provided natively by both Vercel and Hugging Face.
- Zero server credentials or cloud API keys need to be stored in the repository.

---

## 10. Operational & DevOps Implications
- No infrastructure-as-code (Terraform) to manage or maintain.
- Continuous deployment triggered directly by Git push webhooks.

---

## 11. Constraints for Future Development
- Never introduce services requiring paid plans or credit card verification.
- Backend container memory usage must stay under 2.0GB to maintain safe headroom.

---

## 12. Reversal Conditions
- If the project receives a dedicated infrastructure budget or if traffic consistently exceeds free-tier bandwidth caps, transition to dedicated container instances (e.g., AWS ECS or GCP Cloud Run).

