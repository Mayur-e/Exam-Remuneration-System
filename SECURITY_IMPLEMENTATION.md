# Security Implementation Guide

## Executive Summary

This document describes production-grade security implementations for **three critical vulnerabilities** in the Exam Remuneration System:

1. **Missing Rate Limiting** → IP-based + User-based rate limiting with configurable limits
2. **Missing Authentication & Authorization** → Enhanced JWT middleware with role-based access control
3. **Invalid CORS Configuration** → Strict, environment-specific CORS policy

---

## 🔴 Vulnerability 1: Missing Rate Limiting

### The Problem

**Unprotected APIs allow:**
- Unlimited requests from any source
- Brute-force attacks on login endpoints
- DoS attacks on database-heavy endpoints
- Unexpected infrastructure costs

### The Solution

We implemented **multi-tiered rate limiting**:

#### Layer 1: Global IP-Based Limiting
- **100 requests per 15 minutes** per IP
- Applies to all `/api/*` routes
- Returns `429 Too Many Requests` with `Retry-After` header
- Automatically detects proxied IPs via `X-Forwarded-For`

**Headers Returned:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1714072500
Retry-After: 893
```

#### Layer 2: Login-Specific Strict Limiting
- **5 attempts per 15 minutes** per IP
- Prevents brute-force attacks on authentication
- Applied to `POST /api/auth/login`

**Code Example:**
```javascript
// In authRoutes.js
router.post("/login", loginLimiter, loginValidation, authController.login);
```

#### Layer 3: User-Aware Dynamic Limiting
- **Authenticated users:** 1000 requests/15 min (10x more)
- **Unauthenticated users:** 100 requests/15 min
- Allows legitimate API clients higher throughput

```javascript
max: (req) => {
  if (req.user) return 1000;  // Authenticated: higher limit
  return 100;                 // Default: lower limit
}
```

#### Layer 4: Sensitive Operations Limiting
- **10 attempts per hour** for:
  - File uploads
  - Password changes
  - Account modifications
- User-specific, not IP-based

**Configuration:**
```javascript
const { loginLimiter, sensitiveOperationLimiter } = require("./middleware/rateLimitingMiddleware");

// On sensitive routes
router.post("/change-password", authenticate, sensitiveOperationLimiter, ...);
router.post("/file-upload", authenticate, sensitiveOperationLimiter, ...);
```

### Distributed Rate Limiting (Redis)

For production with multiple servers, use **Redis** for distributed rate limiting:

```bash
# Set Redis URL in .env
REDIS_URL=redis://user:password@redis-server.example.com:6379/0
```

**Automatic Fallback:** If Redis is unavailable, the system gracefully falls back to in-memory rate limiting.

### Attack Prevention

| Attack Type | Mitigation |
|---|---|
| **Brute-force login** | 5 attempts/15 min (login limiter) |
| **Account enumeration** | 100 requests/15 min (global limiter) |
| **API abuse** | 1000 requests/15 min authenticated (user-aware limiter) |
| **DoS on uploads** | 10 uploads/hour (sensitive limiter) |

---

## 🔴 Vulnerability 2: Missing Authentication & Authorization

### The Problem

**APIs currently allow:**
- Access without any authentication token
- No verification of user status (active/inactive)
- No role-based access control enforcement
- Exposed private data and sensitive operations

### The Solution

#### Enhanced Authentication Middleware

**New File:** `src/middleware/enhancedAuthMiddleware.js`

Features:
- ✅ JWT token extraction (Authorization header + query params)
- ✅ Token signature verification
- ✅ Token expiration validation
- ✅ User existence verification
- ✅ User status validation (active/inactive)
- ✅ Audit logging
- ✅ Detailed error codes for debugging

**Implementation:**

```javascript
const { createAuthMiddleware, authorize } = require("./middleware/enhancedAuthMiddleware");

const authenticate = createAuthMiddleware({
  allowQueryToken: true,  // For file downloads
  auditLog: true
});

// Protected route
router.get("/claims", authenticate, authorize(["ADMIN", "BILLING_INCHARGE"]), controller.getClaims);
```

**Error Handling:**
```json
{
  "success": false,
  "message": "Token has expired. Please login again.",
  "code": "TOKEN_EXPIRED",
  "expiredAt": "2024-04-24T10:30:00Z"
}
```

#### Role-Based Access Control (RBAC)

**Usage:**
```javascript
// Single role
router.get("/admin-panel", authenticate, authorize("ADMIN"), adminController.getPanel);

// Multiple roles
router.get("/claims", authenticate, authorize(["FACULTY", "ADMIN"]), claimController.getClaims);
```

**Current Roles:**
- `FACULTY` - Academic staff
- `BILLING_INCHARGE` - Finance department
- `ADMIN` - System administrator
- `COORDINATOR` - Exam coordinators

#### Protected Route Structure

```javascript
// app.js - Application routes

// Faculty routes (FACULTY role only)
app.use("/api/faculty", authenticate, authorize(["FACULTY"]), facultyRoutes);

// Accountant routes (BILLING_INCHARGE role only)
app.use("/api/accountant", authenticate, authorize(["BILLING_INCHARGE"]), accountantroutes);

// Admin routes (ADMIN role only)
app.use("/api/admin", authenticate, authorize(["ADMIN"]), adminRoutes);
```

#### JWT Secret Configuration

**CRITICAL:** JWT_SECRET must be configured before startup.

```javascript
// Automatic verification during app startup
try {
  verifyJwtSecretConfigured();
} catch (err) {
  console.error("❌ FATAL SECURITY ERROR:", err.message);
  process.exit(1);
}
```

**Secure Configuration:**
```bash
# .env - NEVER commit to git
JWT_SECRET=your_very_long_random_secret_key_min_32_characters_here

# Generate secure random secret:
# Unix/Mac:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

### Attack Prevention

| Attack Type | Mitigation |
|---|---|
| **Unauthorized access** | JWT authentication required |
| **Privilege escalation** | Role-based access control (RBAC) |
| **Inactive accounts** | User status validation |
| **Expired tokens** | Token expiration checking |
| **Token tampering** | JWT signature verification |

---

## 🔴 Vulnerability 3: Invalid/Missing CORS Configuration

### The Problem

**Current CORS Configuration Issues:**
1. ✗ Allows permissive wildcard domains (e.g., development tunnels)
2. ✗ Allows `*.script.google.com` (wildcard - any Google Apps Script)
3. ✗ Allows requests with no origin (breaks same-origin policy)
4. ✗ Not environment-specific (development != production)

**Real-World Attack:**
```
1. Attacker hosts malicious site: https://evil.com
2. Victim visits evil.com while logged into your app
3. evil.com makes API requests to your backend
4. Your loose CORS policy allows the request
5. Attacker steals user data or performs unauthorized actions
```

### The Solution

**New File:** `src/middleware/corsMiddleware.js`

#### Strict Whitelist-Based CORS

**Development Environment:**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Production Environment:**
```bash
CORS_ALLOWED_ORIGINS=https://app.yourinstitution.edu,https://admin.yourinstitution.edu
FRONTEND_URL=https://app.yourinstitution.edu
```

#### Implementation

```javascript
const { createCorsMiddleware } = require("./middleware/corsMiddleware");

// For public endpoints
app.use(createCorsMiddleware({ 
  requireAuth: false,
  allowCredentials: true
}));

// For authenticated endpoints (stricter)
app.use("/api/protected", createCorsMiddleware({ 
  requireAuth: true,
  allowCredentials: true
}));
```

#### Allowed Headers Configuration

```javascript
allowedHeaders: [
  "Content-Type",        // JSON requests
  "Authorization",       // JWT tokens
  "X-Requested-With",   // AJAX requests
  "Accept",             // Content negotiation
  "X-CSRF-Token"        // CSRF protection
]
```

#### Exposed Headers (for Pagination & Rate Limiting)

```javascript
exposedHeaders: [
  "X-Total-Count",      // For pagination
  "RateLimit-Limit",    // Rate limit info
  "RateLimit-Remaining",
  "RateLimit-Reset",
  "Retry-After"
]
```

#### CORS Preflight Caching

```javascript
maxAge: 86400  // Cache preflight for 24 hours (in seconds)
```

**Browser Behavior:**
- First request: `OPTIONS /api/endpoint` (preflight)
- Server caches response for 24 hours
- Subsequent requests: Use cached CORS policy (faster)

### Attack Prevention

| Attack Type | Mitigation |
|---|---|
| **Cross-site forgery** | Strict origin whitelist |
| **Unauthorized requests** | No wildcard origins |
| **Credential theft** | Explicit credentials policy |
| **Protocol downgrade** | HTTPS-only in production |

---

## Implementation Checklist

### ✅ Pre-Deployment

- [ ] Generate strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure `.env` with secure values (DO NOT commit)
- [ ] Set `NODE_ENV=production` for production deployment
- [ ] List all allowed CORS origins (development + staging + production)
- [ ] Set up Redis for distributed rate limiting (optional but recommended)
- [ ] Test rate limiting with curl/Postman
- [ ] Test authentication with expired tokens
- [ ] Test CORS with curl from different origins

### ✅ Post-Deployment

- [ ] Monitor rate limit rejections (429 responses)
- [ ] Monitor authentication failures (401 responses)
- [ ] Monitor CORS rejections (403 responses)
- [ ] Set up alerting for security anomalies
- [ ] Log all authentication events
- [ ] Review JWT_SECRET rotation policy (recommend annually)

---

## Configuration Reference

### .env Variables

```bash
# Security
NODE_ENV=production
JWT_SECRET=<generate-secure-random-32-char-minimum>
JWT_EXPIRES_IN=24

# CORS
FRONTEND_URL=https://app.yourinstitution.edu
CORS_ALLOWED_ORIGINS=https://app.yourinstitution.edu,https://admin.yourinstitution.edu
DEBUG_CORS=false

# Rate Limiting
REDIS_URL=redis://localhost:6379/0  # Optional: for distributed rate limiting
RATE_LIMIT_GLOBAL_REQUESTS=100
RATE_LIMIT_GLOBAL_WINDOW_MS=900000
RATE_LIMIT_LOGIN_REQUESTS=5
RATE_LIMIT_LOGIN_WINDOW_MS=900000

# Debugging
DEBUG_AUTH=false
VERBOSE_LOGGING=false
LOG_LEVEL=info
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|---|---|---|
| `200 OK` | Request successful | Login successful |
| `400 Bad Request` | Invalid input | Missing email field |
| `401 Unauthorized` | Not authenticated | No token provided |
| `403 Forbidden` | Authenticated but no permission | FACULTY trying ADMIN endpoint |
| `429 Too Many Requests` | Rate limit exceeded | >100 requests in 15 min |

---

## Response Headers

### Rate Limiting Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1714072500
Retry-After: 893
```

### Security Headers (Helmet)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Monitoring & Logging

### Key Metrics to Monitor

1. **Rate Limit Violations**
   ```
   [RATE_LIMIT] 429 response from 192.168.1.100 at /api/login
   ```

2. **Authentication Failures**
   ```
   [AUTH] Token expired for user@example.com at /api/faculty/exams
   [AUTH] Invalid token signature
   [AUTH] User not found (ID: 123)
   ```

3. **CORS Rejections**
   ```
   [CORS] Blocked request from unauthorized origin: https://evil.com
   ```

### Setting up Alerts

```javascript
// Example: Alert on multiple failed logins
if (failedLoginAttempts > 5) {
  // Send alert to security team
  notifySecurityTeam({
    type: "BRUTE_FORCE_ATTEMPT",
    ip: req.ip,
    timestamp: new Date()
  });
}
```

---

## Deployment on Different Environments

### Development (localhost)

```bash
NODE_ENV=development
JWT_SECRET=dev-secret-can-be-simple
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG_CORS=true
DEBUG_AUTH=true
```

### Staging

```bash
NODE_ENV=staging
JWT_SECRET=<use-strong-staging-secret>
FRONTEND_URL=https://staging.yourinstitution.edu
CORS_ALLOWED_ORIGINS=https://staging.yourinstitution.edu
DEBUG_CORS=false
DEBUG_AUTH=false
```

### Production

```bash
NODE_ENV=production
JWT_SECRET=<use-PRODUCTION-grade-secret-rotated-monthly>
FRONTEND_URL=https://app.yourinstitution.edu
CORS_ALLOWED_ORIGINS=https://app.yourinstitution.edu
REDIS_URL=redis://secure-redis-server:6379/0
DEBUG_CORS=false
DEBUG_AUTH=false
LOG_LEVEL=warn
```

---

## Troubleshooting

### Issue: CORS Error When Frontend Tries to Call API

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource...
```

**Solution:**
1. Add frontend URL to `CORS_ALLOWED_ORIGINS`
2. Verify exact protocol (http vs https) and port
3. Enable `DEBUG_CORS=true` to see blocked origins
4. Check that frontend is using `/api/*` paths (not full URLs)

### Issue: 429 Rate Limit Exceeded

```
Too many requests from this IP, please try again later.
```

**Solution:**
1. Wait for reset time specified in `Retry-After` header
2. Increase `RATE_LIMIT_*_REQUESTS` if legitimate traffic pattern
3. Use Redis for distributed rate limiting if multiple servers
4. Whitelist trusted IPs if needed

### Issue: 401 Unauthorized on Protected Routes

```
No token provided / Invalid token / Token expired
```

**Solution:**
1. Verify token is in `Authorization: Bearer <token>` header
2. Check token hasn't expired (use `/api/auth/me` to verify)
3. Re-login to get fresh token
4. Verify JWT_SECRET is same on all servers

---

## Security Best Practices

1. **Rotate Secrets Regularly**
   - JWT_SECRET every 3-6 months
   - Database passwords annually
   - API keys when compromised

2. **Monitor Failed Attempts**
   - Failed logins (> 5 in 15 min = alert)
   - 429 responses from same IP (possible DoS)
   - CORS rejections (possible attack)

3. **Use HTTPS in Production**
   - Enforce with `HSTS` header (already done)
   - Redirect HTTP to HTTPS
   - Use TLS 1.2+ only

4. **Keep Dependencies Updated**
   ```bash
   npm outdated
   npm audit
   npm update
   ```

5. **Log Security Events**
   - Failed logins
   - Privilege escalation attempts
   - Rate limit violations
   - CORS rejections

---

## Additional Hardening Recommendations

### 1. Input Validation

```javascript
// Already implemented via express-validator middleware
const { body, param } = require('express-validator');

router.post("/", 
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  ...
);
```

### 2. SQL Injection Prevention

```javascript
// ✅ Already using parameterized queries
const { rows } = await pool.query(
  "SELECT * FROM users WHERE id = $1",  // $1 is parameterized
  [userId]
);
```

### 3. XSS Protection

```javascript
// ✅ Helmet CSP header (can be enabled)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```

### 4. HTTPS/TLS

```javascript
// Enforce in production via reverse proxy or middleware
const forceHttps = (req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
};
app.use(forceHttps);
```

### 5. Dependency Scanning

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Update major versions safely
npm outdated
npx npm-check-updates -u
npm install
```

---

## Summary of Changes

| File | Changes |
|---|---|
| `src/middleware/rateLimitingMiddleware.js` | **NEW** - Advanced rate limiting |
| `src/middleware/corsMiddleware.js` | **NEW** - Secure CORS configuration |
| `src/middleware/enhancedAuthMiddleware.js` | **NEW** - Enhanced authentication |
| `.env.example` | **NEW** - Environment configuration template |
| `src/app.js` | **UPDATED** - Integrated new security middleware |
| `src/routes/auth/authRoutes.js` | **UPDATED** - Applied login rate limiting |

---

## Questions?

For implementation details, refer to inline code comments in:
- `src/middleware/rateLimitingMiddleware.js`
- `src/middleware/corsMiddleware.js`
- `src/middleware/enhancedAuthMiddleware.js`
