# Security & Privacy Rules: DeltaCare

**Document Version**: 1.0.0  
**Authority**: Senior Security Architect  
**Status**: Authoritative Invariant Set  

---

## 1. Zero PII & Stateless Privacy Policy

DeltaCare's primary defense against data breaches and regulatory violations is **zero retention of Personally Identifiable Information (PII)**:

1. **No PII Fields Permitted**:
   - The application form and API schemas must **never** include fields for:
     - Full names or legal names
     - Email addresses
     - Phone numbers
     - Physical mailing addresses or ZIP+4 codes
     - Social Security Numbers or government IDs
2. **Log Sanitization Mandate**:
   - Standard logging configurations must omit incoming JSON request payloads.
   - Logs must record only metadata: timestamp, HTTP method, route, response status code, and latency in milliseconds.
3. **Stateless Operations**:
   - The API runtime must not write incoming requests to disk, temporary files, or SQLite databases.

---

## 2. API Abuse Prevention & Rate Limiting

1. **In-Memory Token Bucket Ceiling**:
   - Every client IP address is restricted to **60 requests per minute** on prediction endpoints using `slowapi`.
2. **Breach Behavior**:
   - When the ceiling is exceeded, the API must immediately return `HTTP 429 Too Many Requests` with a standard `Retry-After` header.
3. **Frontend Handling**:
   - The frontend must intercept HTTP 429 responses and render a polite cooldown notice: *"Calculation limit reached. Please wait a moment before recalculating."*

---

## 3. Cross-Origin Resource Sharing (CORS) Policy

1. **Production Origin Restriction**:
   - The API `CORSMiddleware` must restrict accepted origins in production strictly to the verified Vercel production frontend origin (e.g., `https://deltacare.vercel.app`).
2. **Development Origins**:
   - `http://localhost:3000` and `http://127.0.0.1:3000` are permitted only when `ENVIRONMENT=development`.
3. **Method & Header Whitelisting**:
   - Allowed methods: `GET`, `POST`, `OPTIONS`.
   - Allowed headers: `Content-Type`, `Accept`, `Authorization`.

---

## 4. Input Sanitization & Mathematical Guardrails

1. **Schema Validation Gates**:
   - Every field in `QuoteRequest` must have strict Pydantic range constraints ($18 \le \text{age} \le 100$, $10.0 \le \text{bmi} \le 60.0$, $0 \le \text{children} \le 10$, strict regex for enums).
2. **Mathematical Floor Clamping**:
   - Raw regression output must be clamped: $\text{prediction} = \max(\text{raw\_output}, \$1,000.00)$.
   - Prevents negative charge predictions or absurdly low outputs caused by adversarial feature inputs.

