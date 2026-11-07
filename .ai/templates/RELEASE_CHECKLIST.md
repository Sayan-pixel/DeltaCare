# Production Release Checklist: DeltaCare

**Target Release Version**: v[MAJOR.MINOR.PATCH]  
**Release Manager**: [Name / AI Agent]  
**Target Release Date**: YYYY-MM-DD  

---

## 1. Pre-Release Quality Gates
- [ ] 1. All open PRs for this milestone are merged into `main`.
- [ ] 2. All GitHub Actions workflows on `main` are green (`api-ci`, `web-ci`, `model-audit`).
- [ ] 3. Model regression quality gate verified: $R^2 \ge 0.85$ and $\text{MAE} \le \$2,000.00$.
- [ ] 4. Vulnerability scans report 0 High or Critical CVEs (`pip-audit`, `npm audit`).
- [ ] 5. Secret scans report 0 credentials in Git history.
- [ ] 6. Zero PII storage or un-sanitized logging verified.

## 2. Release Execution
- [ ] 1. Draft release notes and changelog from commit logs.
- [ ] 2. Create annotated Git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
- [ ] 3. Verify Vercel production edge deployment health (`https://deltacare.vercel.app`).
- [ ] 4. Verify Hugging Face Spaces production container health (`GET /health`).

## 3. Post-Release Verification
- [ ] 1. Execute live smoke calculation on production UI.
- [ ] 2. Verify statutory non-binder disclaimer is visible.
- [ ] 3. Confirm rate limiting functions properly.

