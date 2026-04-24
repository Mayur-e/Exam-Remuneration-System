# Security Deployment Checklist

## Pre-Deployment (Before Production)

### ✅ Environment Configuration

- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Generate strong `JWT_SECRET` (minimum 32 characters)
  ```bash
  # On Unix/Mac/Linux
  openssl rand -base64 32
  
  # On Windows PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
  ```
- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL` to production domain
- [ ] List all allowed `CORS_ALLOWED_ORIGINS` (comma-separated)
- [ ] Configure database credentials (strong passwords: 16+ chars)
- [ ] Add JWT_SECRET to `.gitignore` (NEVER commit secrets)

### ✅ Dependencies

- [ ] Run `npm install` to install all packages
- [ ] Run `npm audit` to check for vulnerabilities
- [ ] Fix any critical/high severity vulnerabilities
- [ ] Optional: Install Redis for distributed rate limiting
  ```bash
  npm install redis
  ```

### ✅ Testing

- [ ] Test rate limiting:
  ```bash
  # Make >5 requests to /api/auth/login - should get 429 on 6th
  for i in {1..10}; do curl -X POST http://localhost:5000/api/auth/login; done
  ```

- [ ] Test authentication:
  ```bash
  # Without token - should get 401
  curl http://localhost:5000/api/faculty/dashboard-stats
  
  # With valid token - should work
  curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/faculty/dashboard-stats
  ```

- [ ] Test CORS:
  ```bash
  # From disallowed origin - should get 403
  curl -H "Origin: https://evil.com" http://localhost:5000/api/faculty/exams
  
  # From allowed origin - should work
  curl -H "Origin: http://localhost:5173" http://localhost:5000/api/faculty/exams
  ```

- [ ] Test role-based access:
  ```bash
  # FACULTY token accessing ADMIN endpoint - should get 403
  curl -H "Authorization: Bearer FACULTY_TOKEN" http://localhost:5000/api/admin/dashboard
  ```

- [ ] Test expired token:
  ```bash
  # Should get 401 with TOKEN_EXPIRED code
  curl -H "Authorization: Bearer EXPIRED_TOKEN" http://localhost:5000/api/faculty/exams
  ```

### ✅ Documentation

- [ ] Review `SECURITY_IMPLEMENTATION.md` (overview of all changes)
- [ ] Share security guide with development team
- [ ] Document how to rotate JWT_SECRET
- [ ] Set up incident response plan

### ✅ Monitoring Setup

- [ ] Set up logging for security events
  ```javascript
  // Example: Log failed logins
  if (response.status === 401) {
    logSecurityEvent({
      type: "AUTH_FAILURE",
      endpoint: req.path,
      ip: req.ip,
      timestamp: new Date()
    });
  }
  ```

- [ ] Set up alerts for:
  - Multiple 429 responses (rate limit violations)
  - Multiple 401 responses (failed auth attempts)
  - Multiple 403 responses (unauthorized access attempts)

- [ ] Set up monitoring dashboard for:
  - API uptime
  - Error rate (4xx, 5xx)
  - Response time

---

## Deployment Steps

### 1. Stop Current Server

```bash
# If running with pm2
pm2 stop all

# If running in screen/tmux
Ctrl+C
```

### 2. Pull Latest Code

```bash
cd /path/to/exam-remuneration-system
git pull origin main
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit with your values
nano .env  # or use your editor
```

**Critical values to set:**
- `JWT_SECRET` - Generate fresh secret (minimum 32 chars)
- `NODE_ENV` - Set to 'production'
- `FRONTEND_URL` - Your production domain
- `CORS_ALLOWED_ORIGINS` - Your frontend and admin URLs
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` - Database credentials

### 5. Verify Configuration

```bash
# Check that JWT_SECRET is set
echo $JWT_SECRET  # Should show your secret

# Verify node version (should be 16+)
node --version

# Verify npm packages
npm list express helmet cors jsonwebtoken
```

### 6. Run Tests

```bash
# Optional: If you have test suite
npm test
```

### 7. Start Server

```bash
# Development
npm run dev

# Production with pm2
pm2 start server.js --name "exam-api" --max-memory-restart 500M

# Or with node directly
NODE_ENV=production node server.js
```

### 8. Verify Server is Running

```bash
# Check health endpoint
curl http://localhost:5000/

# Expected response:
# {
#   "status": "ok",
#   "service": "Exam Remuneration System API",
#   "timestamp": "2024-04-24T10:30:00Z"
# }
```

---

## Post-Deployment Verification

### ✅ Security Headers

```bash
# Verify Helmet security headers
curl -i http://localhost:5000/ | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options"

# Expected headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

### ✅ CORS Configuration

```bash
# Test CORS with your frontend origin
curl -H "Origin: https://app.yourinstitution.edu" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS http://localhost:5000/api/faculty/exams

# Expected: 200 OK with Access-Control headers
```

### ✅ Rate Limiting

```bash
# Test rate limits
for i in {1..6}; do 
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"test"}'
  echo ""
done

# After 5 requests, should get 429 Too Many Requests
```

### ✅ Authentication

```bash
# Test without token - should fail
curl http://localhost:5000/api/faculty/exams

# Expected: 401 Unauthorized
```

### ✅ Check Logs

```bash
# Verify security events are logged
# Look for entries like:
# [AUTH] Authenticated user: user@example.com (123) for GET /api/faculty/exams
# [RATE_LIMIT] 429 response from 192.168.1.100 at /api/login

tail -f /var/log/exam-api/app.log  # or wherever logs are stored
```

---

## Monitoring & Maintenance

### Daily

- [ ] Check error logs for unexpected 4xx/5xx errors
- [ ] Monitor API response times
- [ ] Check for any security alerts

### Weekly

- [ ] Review authentication failures (401 errors)
- [ ] Review rate limit violations (429 errors)
- [ ] Review CORS rejections (403 errors)
- [ ] Check for unusual traffic patterns

### Monthly

- [ ] Run `npm audit` and update dependencies
- [ ] Review security logs
- [ ] Test disaster recovery procedures
- [ ] Plan for JWT_SECRET rotation (next rotation in 3 months)

### Quarterly

- [ ] Full security audit
- [ ] Penetration testing (if possible)
- [ ] Review and update security policies

### Annually

- [ ] Rotate JWT_SECRET
- [ ] Audit all user accounts and permissions
- [ ] Update security documentation
- [ ] Review third-party dependencies

---

## Rollback Procedure

If deployment causes issues:

### 1. Stop Current Service

```bash
pm2 stop exam-api
```

### 2. Revert Code

```bash
git revert HEAD
git reset --hard origin/main  # Or previous commit
```

### 3. Reinstall Dependencies

```bash
npm install
```

### 4. Restart with Previous Configuration

```bash
# Use previous .env backup
cp .env.backup .env
pm2 start server.js --name "exam-api"
```

### 5. Verify Service

```bash
curl http://localhost:5000/
```

---

## Common Issues & Solutions

### Issue: JWT_SECRET not configured

**Error:**
```
❌ FATAL SECURITY ERROR: JWT_SECRET environment variable is not configured
```

**Solution:**
```bash
# Set JWT_SECRET in .env
JWT_SECRET=your_very_long_random_secret_key_min_32_characters_here

# Restart server
pm2 restart exam-api
```

### Issue: CORS blocked requests

**Error:**
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource...
```

**Solution:**
1. Check frontend origin in browser console
2. Add origin to `CORS_ALLOWED_ORIGINS` in .env
3. Verify exact protocol (http vs https) and port
4. Restart server: `pm2 restart exam-api`

### Issue: Rate limit too strict

**Problem:** Legitimate requests getting 429 errors

**Solution:**
1. Increase limits in `.env`:
   ```bash
   RATE_LIMIT_GLOBAL_REQUESTS=200  # Increase from 100
   ```
2. Restart server: `pm2 restart exam-api`
3. Monitor and adjust as needed

### Issue: Authentication failing for all users

**Error:**
```
401 Unauthorized: Invalid token
```

**Solution:**
1. Check JWT_SECRET matches between:
   - Current server
   - When tokens were issued
   - All load-balanced servers (must be identical)
2. Check token expiration
3. Check user account status (active/inactive)

---

## Performance Tuning

### Rate Limiting Optimization

For high-traffic deployments, use Redis:

```bash
# 1. Install Redis
sudo apt-get install redis-server  # Linux
brew install redis  # macOS

# 2. Start Redis
redis-server

# 3. Update .env
REDIS_URL=redis://localhost:6379/0

# 4. Restart server
pm2 restart exam-api
```

### Load Balancing

If using multiple servers:

```bash
# All servers MUST have:
1. Identical JWT_SECRET
2. Redis connection configured
3. Same CORS_ALLOWED_ORIGINS
4. Synchronized system clocks (NTP)
```

### Database Connection Pooling

Ensure adequate database connections in `.env`:

```bash
DB_POOL_MIN=2
DB_POOL_MAX=10
```

---

## Security Compliance

### PCI-DSS (if handling payment data)

- [ ] All passwords must be hashed (using bcrypt)
- [ ] All data in transit must be encrypted (HTTPS)
- [ ] API endpoints must require authentication
- [ ] Rate limiting must prevent brute-force attacks
- [ ] Audit logs must track all access

### GDPR (if serving EU users)

- [ ] Personal data must not be logged unnecessarily
- [ ] Users must be able to request data deletion
- [ ] Data retention policies must be documented
- [ ] Data processing agreements must be in place

### ISO 27001 (Information Security)

- [ ] Access control properly implemented (JWT + RBAC)
- [ ] Audit trails for sensitive operations
- [ ] Encryption for sensitive data
- [ ] Regular security assessments

---

## Emergency Contacts

- [ ] Security Team Lead: _______________
- [ ] System Administrator: _______________
- [ ] Database Administrator: _______________
- [ ] Incident Response Team: _______________

---

## Sign-Off

- [ ] Deployment completed by: ________________
- [ ] Verified by: ________________
- [ ] Date: ________________
- [ ] Time: ________________

---

**Note:** Keep this checklist updated as you discover new best practices or encounter new issues.
