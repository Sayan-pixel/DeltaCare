# Workflow: Production Release Preparation

**Workflow ID**: WF-12  
**Category**: Release Governance  
**Standard Loop**: UNDERSTAND → INVESTIGATE → PLAN → APPROVE → IMPLEMENT → TEST → REVIEW → DOCUMENT → REPORT  

---

## 1. Purpose & When to Use
Use this workflow when preparing, auditing, tagging, and deploying a new production release version of DeltaCare.

## 2. Release Preparation Checklist
- [ ] Complete Definition of Done audit across all closed pull requests.
- [ ] Confirm all GitHub Actions workflows on `main` are green.
- [ ] Verify holdout regression benchmarks ($R^2 \ge 0.85$, $\text{MAE} \le \$2,000$).
- [ ] Confirm zero dependency security vulnerabilities (`pip-audit`, `npm audit`).
- [ ] Generate changelog summarizing features, fixes, and architectural decisions.
- [ ] Execute release tagging in compliance with SemVer 2.0.0 (`vMAJOR.MINOR.PATCH`).

## 3. Post-Deployment Smoke Test
1. Access production web portal: `https://deltacare.vercel.app`.
2. Verify page loads instantly without console errors.
3. Submit a nominal calculation and verify sub-second response on warm container.
4. Verify statutory non-binder disclaimer is rendered cleanly below quote card.

