# Performance Testing & Latency Benchmarks: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Principal QA Architect  
**Status**: Authoritative Testing Baseline  

---

## 1. Latency & Resource Benchmarks

Performance testing ensures that the in-memory machine learning pipeline and API gateway deliver responsive user interactions without degrading free-tier hardware:

| Performance Metric | Target Threshold | Hard Limit | Verification Tool |
| :--- | :---: | :---: | :--- |
| **Active Inference Latency** | $\mathbf{\le 50\text{ms}}$ | $\mathbf{\le 100\text{ms}}$ | `pytest-benchmark` |
| **Health Check Latency** | $\mathbf{\le 5\text{ms}}$ | $\mathbf{\le 15\text{ms}}$ | `autocannon` |
| **Container RAM Utilization** | $\mathbf{\le 600\text{MB}}$ | $\mathbf{\le 2.0\text{GB}}$ | `memory-profiler` |
| **Frontend First Contentful Paint**| $\mathbf{\le 1.2\text{s}}$ | $\mathbf{\le 2.0\text{s}}$ | Google Lighthouse |

---

## 2. Micro-Benchmark Test Specification (`apps/api/tests/`)

### TC-PERF-01: In-Memory Inference Latency
```python
def test_inference_microbenchmark(benchmark, model_predictor, valid_dataframe):
    """Verifies single-row XGBoost pipeline prediction executes in < 25ms."""
    result = benchmark(model_predictor.predict, valid_dataframe)
    assert benchmark.stats["mean"] < 0.025  # Sub-25ms mean inference
    assert result.predicted_annual >= 1000.00
```

### TC-PERF-02: Peak Memory Profile Test
- **Tool**: `memory-profiler`
- **Action**: Load `model.joblib` and execute 1,000 consecutive predictions in a tight loop.
- **Assertion**:
  - Process memory delta does not leak ($< 5\text{MB}$ total variance over 1,000 calls).
  - Peak resident set size (RSS) remains well below 1.0GB.

