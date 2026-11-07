# Network Architecture & Traffic Management: DeltaCare

**Document Version**: 1.0.0  
**Phase**: Pre-Development Foundation Phase  
**Author**: Senior Network & Security Architect  
**Status**: Authoritative Architectural Baseline  
**Approved References**: [ADR-002](../decisions/002-zero-dollar-hosting-strategy.md)

---

## 1. Network Topology & Traffic Flow

DeltaCare's network architecture isolates public consumer traffic across two distinct cloud networks without requiring private VPC peering or expensive NAT gateways.

```mermaid
flowchart TD
    Consumer[Internet Consumer Browser]
    
    subgraph Public_Internet [Public Internet Tier]
        DNS[Public DNS Resolution]
    end

    subgraph Vercel_Network [Vercel Global Edge Network]
        EdgeAnycast[Global Anycast IP]
        EdgeTLS[Automatic TLS 1.3 Termination]
        StaticCDN[Edge Asset Cache\nHTML/JS/CSS]
    end

    subgraph HuggingFace_Network [Hugging Face Spaces Cloud]
        HFRPS[Hugging Face Reverse Proxy / Load Balancer]
        HFPort7860[Container Internal Port :7860]
        UvicornWorker[Uvicorn Process]
    end

    Consumer -->|1. Resolves deltacare.vercel.app| DNS
    Consumer -->|2. HTTPS Port 443| EdgeAnycast
    EdgeAnycast --> EdgeTLS
    EdgeTLS --> StaticCDN
    StaticCDN -->> Consumer: 3. Delivers static React SPA
    
    Consumer -->|4. Direct REST HTTPS POST /predict| HFRPS
    HFRPS -->|5. Internal Proxy Forward| HFPort7860
    HFPort7860 --> UvicornWorker
```

---

## 2. Ports, Protocols & Transport Security

| Network Segment | Inbound Port | Protocol | Encryption Standard | Allowed Source |
| :--- | :--- | :--- | :--- | :--- |
| **Consumer $\rightarrow$ Vercel Edge** | 443 | HTTPS / HTTP/2 | TLS 1.3 (Automated Let's Encrypt Certificate) | Public Internet (`0.0.0.0/0`) |
| **Consumer $\rightarrow$ HF Space** | 443 | HTTPS / REST | TLS 1.3 (Managed by Hugging Face Proxy) | Public Internet (`0.0.0.0/0`) |
| **HF Proxy $\rightarrow$ Docker Container**| 7860 | HTTP / 1.1 | Plaintext (Internal Pod Network Boundary) | HF Internal Load Balancer Only |
| **Local Development** | 3000 / 8000 | HTTP | Plaintext | `127.0.0.1` (Localhost) |

---

## 3. Defense-in-Depth Network Policies

1. **Strict CORS Headers**:
   - `Access-Control-Allow-Origin: https://deltacare.vercel.app`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Accept`
2. **Denial of Service (DoS) Mitigation**:
   - **Vercel Edge**: Built-in Layer 3/4 DDoS protection and Anycast routing absorb volumetric network attacks before they reach application containers.
   - **FastAPI Layer 7**: In-memory token bucket (`slowapi`) drops excess application requests with HTTP 429 before they can consume CPU inference cycles.

