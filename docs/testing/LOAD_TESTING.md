# Load Testing & Capacity Analysis: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal QA Architect  
**Status**: Authoritative Testing Baseline  

---

## 1. Load Testing Objectives

Load testing evaluates the behavior of the FastAPI application under simulated multi-user traffic, validating that the container sustains peak concurrent usage without process crashes or connection timeouts.

```mermaid
flowchart TD
    LocustRunner[Locust Load Generator] --> Scenario1[Scenario 1: Normal Load\n10 concurrent users, 2 req/sec]
    LocustRunner --> Scenario2[Scenario 2: Peak Burst\n30 concurrent users, 15 req/sec]
    LocustRunner --> Scenario3[Scenario 3: Stress Spike\n100 concurrent users - Rate Limit Gate]
    
    Scenario1 --> PassNormal[Assert p95 latency <= 100ms\n0% Error Rate]
    Scenario2 --> PassBurst[Assert p95 latency <= 250ms\n0% Unhandled 500s]
    Scenario3 --> PassStress[Assert slowapi drops excess with 429\nContainer RAM <= 1.5GB]
```

---

## 2. Load Testing Scenarios (Locust Specification)

### TC-LOAD-01: Baseline User Load
- **Virtual Users**: 10 concurrent simulated consumers.
- **Duration**: 5 minutes continuous.
- **Pacing**: 1 request every 5 seconds per user (simulating normal form completion).
- **Success Criteria**:
  - $p95$ response time $\le 100\text{ms}$.
  - $p99$ response time $\le 200\text{ms}$.
  - HTTP error rate: `0.0%`.

### TC-LOAD-02: Peak Interactive Scrubbing Burst
- **Virtual Users**: 25 concurrent users scrubbing the BMI slider.
- **Pacing**: 1 request every 400ms per user (mimicking debounced slider events).
- **Target Throughput**: $\approx 60\text{ requests/second}$ total load.
- **Success Criteria**:
  - Zero unhandled HTTP 500 errors.
  - Container CPU remains below 85%.
  - Zero OOM container restarts.

