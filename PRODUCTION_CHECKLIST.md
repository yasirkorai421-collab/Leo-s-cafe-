# 🚀 Production Deployment Checklist

## ✅ Security (All Implemented)

- [x] HTTPS/SSL enforced in production
- [x] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
- [x] Rate limiting (10 req/10s general, 5 req/15min auth)
- [x] SQL injection prevention (Prisma ORM + input sanitization)
- [x] XSS prevention (input sanitization + CSP headers)
- [x] CSRF protection implemented
- [x] Authentication via Supabase (secure session management)
- [x] Password strength validation
- [x] File upload validation
- [x] Origin validation (CORS)
- [x] URL manipulation protection (middleware validation)
- [x] Admin routes protected (404 for non-admin users)

## ✅ Performance & Scalability (All Optimized)

- [x] Next.js Image optimization (WebP, lazy loading)
- [x] Database connection pooling (pgBouncer + PrismaPg adapter)
- [x] Query caching implemented
- [x] Batch queries for reducing round trips
- [x] Pagination with max 100 items per page
- [x] Retry logic for failed queries
- [x] Graceful database connection shutdown

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
```bash
# Copy and configure production environment
cp .env.production.example .env.production

# Required variables:
- DATABASE_URL (with pgbouncer=true)
- DIRECT_URL (for migrations)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL (your production domain)
- UPSTASH_REDIS_REST_URL (for rate limiting)
- UPSTASH_REDIS_REST_TOKEN
```

### 2. Database Setup
```bash
# Run migrations
npm run db:push

# Or use Prisma migrate for production
npx prisma migrate deploy

# Verify database connection
npx prisma db pull
```

### 3. Build & Test
```bash
# Install dependencies
npm install --production

# Run build
npm run build

# Test production build locally
npm start

# Check for build errors
npm run lint
```

### 4. Security Configuration

#### Supabase Setup:
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google OAuth (add OAuth Client ID & Secret)
3. Enable Facebook OAuth (add App ID & Secret)
4. Add production URL to redirect URLs
5. Configure Row Level Security (RLS) policies

#### Rate Limiting Setup:
1. Create Upstash Redis account: https://upstash.com
2. Create Redis database
3. Copy REST URL and Token to .env.production

### 5. Domain & SSL
- Point domain DNS to your hosting provider
- SSL certificate will be auto-provisioned (Vercel/Netlify)
- Verify HTTPS redirect works

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod
```

### Option 3: Docker
```dockerfile
# Build Docker image
docker build -t leos-cafe .

# Run container
docker run -p 3000:3000 --env-file .env.production leos-cafe
```

## 🧪 Testing Checklist

### Security Tests

#### Test 1: HTTPS Redirect
```bash
# Should redirect to HTTPS
curl -I http://your-domain.com
# Expected: 301 Moved Permanently
```

#### Test 2: Security Headers
```bash
# Check security headers
curl -I https://your-domain.com
# Expected headers:
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - X-XSS-Protection: 1; mode=block
# - Content-Security-Policy: [long policy]
# - Strict-Transport-Security: max-age=31536000
```

#### Test 3: SQL Injection
```javascript
// Try these in login/search forms - should all be blocked:
// ' OR '1'='1
// admin'--
// 1' UNION SELECT * FROM users--
// All should fail with "Invalid input" or sanitization
```

#### Test 4: XSS Attack
```javascript
// Try these in text inputs - should be sanitized:
// <script>alert('XSS')</script>
// <img src=x onerror=alert('XSS')>
// javascript:alert('XSS')
// All should be stripped or escaped
```

#### Test 5: CSRF Protection
```bash
# Try POST request without valid origin
curl -X POST https://your-domain.com/api/orders \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json"
# Expected: 403 Forbidden or origin validation error
```

#### Test 6: Rate Limiting
```bash
# Make 15 rapid requests
for i in {1..15}; do
  curl https://your-domain.com/api/menu
done
# Expected: After 10th request, get 429 Too Many Requests
```

#### Test 7: Authentication
```bash
# Try accessing protected route without login
curl -I https://your-domain.com/admin
# Expected: 302 Redirect to /auth/login

# Try accessing admin route as regular user
# Expected: 404 Not Found (security by obscurity)
```

#### Test 8: Password Strength
```javascript
// Test weak passwords - should be rejected:
// "12345678" - no uppercase, no special chars
// "Password" - no numbers, no special chars
// "Pass1!" - too short
// All should show validation errors
```

### Performance Tests

#### Test 9: Page Load Speed
```bash
# Use Lighthouse in Chrome DevTools
# Target scores:
# - Performance: > 90
# - Best Practices: > 95
# - SEO: > 95
# - Accessibility: > 90
```

#### Test 10: Image Optimization
```bash
# Check image formats
# All images should be served as WebP
# Check Network tab in DevTools
```

#### Test 11: Database Performance
```bash
# Check query execution time
# All queries should complete in < 100ms
# Use Prisma Studio or pgAdmin to analyze
```

#### Test 12: Mobile Performance
```bash
# Test on real mobile devices or:
# Chrome DevTools > Device Toolbar > Various devices
# Page should load in < 3 seconds on 3G
```

## 📊 Monitoring Setup

### 1. Error Tracking
- Set up Sentry: https://sentry.io
- Add DSN to environment variables

### 2. Performance Monitoring
- Use Vercel Analytics (built-in)
- Or Google Analytics

### 3. Uptime Monitoring
- Use UptimeRobot: https://uptimerobot.com
- Monitor main endpoints every 5 minutes

### 4. Database Monitoring
- Supabase has built-in monitoring
- Check Query Performance tab

## 🔒 Post-Deployment Security

### Immediate Actions:
1. Change all default passwords
2. Enable 2FA on Supabase account
3. Review and restrict Supabase API keys
4. Set up database backups (daily)
5. Enable Supabase email notifications for suspicious activity

### Weekly:
1. Review access logs
2. Check for failed login attempts
3. Monitor rate limit hits
4. Review database performance

### Monthly:
1. Update dependencies (`npm audit fix`)
2. Review and update security policies
3. Test disaster recovery process
4. Review and rotate API keys

## 🚨 Security Incident Response

### If Breach Detected:
1. **Immediately**: Rotate all API keys and secrets
2. **Within 1 hour**: Force logout all users
3. **Within 24 hours**: Notify affected users
4. **Within 1 week**: Conduct security audit and patch vulnerabilities

### Emergency Contacts:
- Supabase Support: support@supabase.io
- Hosting Provider Support: [Your provider]

## ✅ Final Verification

Before going live, verify all these work:
- [ ] Homepage loads correctly
- [ ] Login/Signup works with email
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] Menu loads all items with images
- [ ] Add to cart works
- [ ] Admin panel accessible to admin users only
- [ ] Non-admin users get 404 on admin routes
- [ ] Rate limiting kicks in after threshold
- [ ] HTTPS redirect works
- [ ] All security headers present
- [ ] Mobile view works correctly
- [ ] Forms validate input correctly
- [ ] Database queries are fast
- [ ] Images load quickly
- [ ] No console errors
- [ ] 404 page works
- [ ] 500 error page works

## 🎯 Success Metrics

### Target Performance:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Total Blocking Time: < 300ms
- Cumulative Layout Shift: < 0.1

### Target Security:
- Zero SQL injection vulnerabilities
- Zero XSS vulnerabilities
- All endpoints rate limited
- All inputs validated
- All sensitive data encrypted
- HTTPS everywhere

### Target Availability:
- Uptime: > 99.9%
- Response time: < 200ms (p95)
- Error rate: < 0.1%

---

## 🎉 Your site is production-ready!

All security measures, performance optimizations, and scalability improvements are in place. Follow this checklist to deploy safely and monitor effectively.

**Remember**: Security is an ongoing process, not a one-time setup. Keep dependencies updated and monitor your application regularly.
