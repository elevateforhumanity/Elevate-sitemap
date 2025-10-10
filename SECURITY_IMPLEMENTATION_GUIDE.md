# Security Implementation Guide

## Overview

This guide documents all security enhancements added to the Elevate for Humanity platform to meet enterprise SaaS standards.

## ✅ Completed Security Implementations

### 1. Row Level Security (RLS) - CRITICAL ✅

**Location:** `prisma/migrations/enable_rls.sql`

**What was added:**
- RLS policies on all tenant-scoped tables
- Tenant isolation using `current_setting('app.current_org_id')`
- User-level access control
- Helper function `set_user_context()` for session management

**How to apply:**
```bash
cd backend
psql $DATABASE_URL -f ../prisma/migrations/enable_rls.sql
```

**Middleware:** `backend/src/middleware/rls-context.ts`
- Automatically sets RLS context on each request
- Extracts user info from JWT
- Enforces tenant isolation at database level

**Usage in code:**
```typescript
import { setRLSContext } from './middleware/rls-context';

// Add after auth middleware
app.use(setRLSContext(prisma));
```

---

### 2. Stripe Webhook Handler with Idempotency ✅

**Location:** `backend/src/routes/stripe-webhook.ts`

**What was added:**
- Webhook signature verification
- Idempotency using event IDs
- Event tracking table to prevent duplicate processing
- Handlers for all payment events

**Database migration:** `prisma/migrations/add_stripe_events.sql`

**How to integrate:**
```typescript
import stripeWebhookRouter from './routes/stripe-webhook';

// IMPORTANT: Use raw body parser for webhooks
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}), stripeWebhookRouter);
```

**Stripe webhook URL:** `https://api.elevateforhumanity.org/api/stripe/webhook`

---

### 3. Content Security Policy (CSP) & Security Headers ✅

**Locations:**
- Backend: `backend/src/middleware/security-headers.ts`
- Static: `public/_headers` (for Durable/Cloudflare)

**What was added:**
- Comprehensive CSP policy
- Clickjacking protection (X-Frame-Options)
- MIME type sniffing prevention
- XSS protection headers
- HSTS for HTTPS enforcement
- Permissions Policy
- CORS configuration

**How to integrate:**
```typescript
import { cspMiddleware, securityHeaders, corsOptions } from './middleware/security-headers';
import cors from 'cors';

app.use(cors(corsOptions));
app.use(cspMiddleware);
app.use(securityHeaders);
```

---

### 4. Sentry Error Tracking ✅

**Locations:**
- Backend: `backend/src/config/sentry.ts`
- Frontend: `frontend/src/config/sentry.ts`

**What was added:**
- Error tracking and performance monitoring
- Session replay for debugging
- Breadcrumb tracking
- Sensitive data filtering
- User context tracking

**Backend integration:**
```typescript
import { initSentry, sentryErrorHandler } from './config/sentry';

// Initialize at app start
initSentry(app);

// Add error handler AFTER all routes
app.use(sentryErrorHandler);
```

**Frontend integration:**
```typescript
import { initSentry } from './config/sentry';

// In main.tsx or App.tsx
initSentry();
```

**Required packages:**
```bash
# Backend
npm install @sentry/node @sentry/profiling-node

# Frontend
npm install @sentry/react @sentry/tracing
```

---

### 5. Cloudflare Workers & Queues ✅

**Locations:**
- Config: `wrangler.toml`
- Worker: `workers/src/index.ts`

**What was added:**
- Queue producers and consumers (email, analytics, webhooks)
- Cron triggers for scheduled tasks
- Durable Objects for rate limiting and sessions
- KV namespaces for caching
- R2 buckets for file storage

**Queues configured:**
- `email-queue` - Email sending
- `analytics-queue` - Analytics tracking
- `webhook-queue` - Webhook processing

**Cron schedules:**
- Daily at midnight - Cleanup old data
- Every 6 hours - Sync analytics
- Every 15 minutes - Process pending jobs

**How to deploy:**
```bash
cd workers
wrangler deploy
```

---

### 6. Supabase Integration ✅

**Locations:**
- Backend: `backend/src/config/supabase.ts`
- Frontend: `frontend/src/config/supabase.ts`

**What was added:**
- Supabase client configuration
- Authentication helpers
- Storage helpers
- Real-time subscription helpers
- Admin client for server-side operations

**Required packages:**
```bash
npm install @supabase/supabase-js
```

**Usage:**
```typescript
import { auth, storage, realtime } from './config/supabase';

// Sign in
await auth.signIn(email, password);

// Upload file
await storage.upload('avatars', 'user.jpg', file);

// Subscribe to changes
const channel = realtime.subscribe('users', (payload) => {
  console.log('Change:', payload);
});
```

---

### 7. Enhanced CodeQL & OIDC Deployments ✅

**Location:** `.github/workflows/`

**What was added:**
- Enhanced CodeQL workflow with security scanning
- OIDC-based deployments (no long-lived secrets)
- Multi-language analysis (JavaScript, TypeScript)
- Automated security alerts on PRs
- Deployment to Durable, Railway, Cloudflare

**Workflows:**
- `codeql.yml` - Security scanning
- `deploy-production-oidc.yml` - Production deployment

**Required secrets:**
```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
RAILWAY_TOKEN
DURABLE_API_KEY
DURABLE_SITE_ID
DATABASE_URL
```

---

### 8. Terraform Infrastructure as Code ✅

**Location:** `terraform/`

**What was added:**
- Cloudflare configuration (DNS, WAF, Workers, Queues)
- Railway configuration (backend, Redis)
- Database roles and permissions
- Secrets management
- Complete infrastructure versioning

**Files:**
- `main.tf` - Main configuration
- `cloudflare.tf` - Cloudflare resources
- `railway.tf` - Railway resources
- `database.tf` - Database configuration

**How to use:**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

### 9. Comprehensive Environment Configuration ✅

**Location:** `.env.example`

**What was added:**
- Complete environment variable documentation
- Security checklist
- Service-specific configurations
- Development vs production settings

**How to use:**
```bash
cp .env.example .env
# Fill in your actual values
```

---

## 🚀 Deployment Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    ELEVATE FOR HUMANITY                      │
│                     Production Stack                         │
└─────────────────────────────────────────────────────────────┘

Frontend (Landing Page)
├── Durable.co
│   ├── Static site hosting
│   ├── SSL/TLS certificates
│   └── CDN distribution
└── Domain: elevateforhumanity.org

Backend API
├── Railway
│   ├── Node.js/Express API
│   ├── Redis cache
│   └── Auto-deploy from GitHub
└── Domain: api.elevateforhumanity.org

Database
├── Supabase
│   ├── PostgreSQL with RLS
│   ├── Authentication
│   ├── Real-time subscriptions
│   └── Storage buckets
└── Connection: Secure SSL

CDN & Security
├── Cloudflare
│   ├── DNS management
│   ├── WAF & DDoS protection
│   ├── Rate limiting
│   ├── Workers (background jobs)
│   ├── Queues (async processing)
│   ├── KV (caching)
│   └── R2 (file storage)
└── Proxied through Cloudflare

Monitoring
├── Sentry
│   ├── Error tracking
│   ├── Performance monitoring
│   └── Session replay
└── Alerts to team

Payments
├── Stripe
│   ├── Payment processing
│   ├── Subscriptions
│   └── Webhooks with idempotency
└── PCI compliant
```

---

## 📋 Implementation Checklist

### Database Setup
- [ ] Migrate Prisma schema to PostgreSQL
- [ ] Apply RLS migration: `enable_rls.sql`
- [ ] Apply Stripe events migration: `add_stripe_events.sql`
- [ ] Test RLS policies with different user roles
- [ ] Verify tenant isolation

### Backend Setup
- [ ] Install new dependencies (Sentry, Supabase, etc.)
- [ ] Add RLS context middleware
- [ ] Add Stripe webhook route
- [ ] Add security headers middleware
- [ ] Initialize Sentry
- [ ] Configure Supabase client
- [ ] Update CORS origins
- [ ] Test all API endpoints

### Frontend Setup
- [ ] Install Sentry and Supabase packages
- [ ] Initialize Sentry in main.tsx
- [ ] Configure Supabase client
- [ ] Add authentication flows
- [ ] Test error tracking
- [ ] Verify CSP doesn't break functionality

### Cloudflare Setup
- [ ] Create KV namespaces
- [ ] Create R2 bucket
- [ ] Configure Queues
- [ ] Deploy Workers
- [ ] Set up cron triggers
- [ ] Configure WAF rules
- [ ] Set up rate limiting
- [ ] Update DNS records

### Railway Setup
- [ ] Create project
- [ ] Deploy backend service
- [ ] Add Redis service
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Enable auto-deploy

### Durable Setup
- [ ] Create site
- [ ] Configure custom domain
- [ ] Deploy frontend
- [ ] Verify SSL certificate
- [ ] Test deployment

### Stripe Setup
- [ ] Create webhook endpoint
- [ ] Configure webhook secret
- [ ] Test webhook delivery
- [ ] Verify idempotency
- [ ] Test payment flows

### Sentry Setup
- [ ] Create projects (backend, frontend)
- [ ] Get DSN keys
- [ ] Configure alerts
- [ ] Test error reporting
- [ ] Set up performance monitoring

### Terraform Setup
- [ ] Install Terraform
- [ ] Configure credentials
- [ ] Create terraform.tfvars
- [ ] Run terraform plan
- [ ] Apply infrastructure
- [ ] Verify all resources

### CI/CD Setup
- [ ] Add GitHub secrets
- [ ] Test CodeQL workflow
- [ ] Test deployment workflow
- [ ] Verify OIDC authentication
- [ ] Set up deployment notifications

### Security Verification
- [ ] Run security audit script
- [ ] Verify RLS policies
- [ ] Test rate limiting
- [ ] Verify CSP headers
- [ ] Check for exposed secrets
- [ ] Test authentication flows
- [ ] Verify CORS configuration
- [ ] Test webhook signatures

---

## 🔒 Security Best Practices

### Secrets Management
1. **Never commit secrets to Git**
   - Use `.env` files (in `.gitignore`)
   - Use Railway/Cloudflare secrets manager
   - Rotate secrets regularly

2. **Use strong random secrets**
   ```bash
   # Generate JWT secret (64 bytes)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate encryption key (32 bytes)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Separate test and production keys**
   - Use Stripe test keys in development
   - Use separate Sentry projects
   - Use different database instances

### Database Security
1. **Always use RLS**
   - Enable on all tables
   - Test with different user roles
   - Never bypass RLS in application code

2. **Use prepared statements**
   - Prisma handles this automatically
   - Never concatenate SQL strings

3. **Limit database permissions**
   - Use separate read-only user for analytics
   - Use service role only when necessary

### API Security
1. **Rate limiting**
   - Strict limits on auth endpoints (5 req/15min)
   - Standard limits on API (100 req/15min)
   - Use Cloudflare WAF for DDoS protection

2. **Input validation**
   - Validate all user input
   - Use Zod or similar for type safety
   - Sanitize HTML content

3. **Authentication**
   - Use Supabase Auth or JWT
   - Implement refresh tokens
   - Set appropriate token expiration

### Frontend Security
1. **CSP**
   - Restrict script sources
   - Block inline scripts (or use nonces)
   - Report violations to Sentry

2. **XSS Prevention**
   - Sanitize user-generated content
   - Use React's built-in escaping
   - Avoid dangerouslySetInnerHTML

3. **CSRF Protection**
   - Use SameSite cookies
   - Implement CSRF tokens for state-changing operations

---

## 🧪 Testing

### Test RLS Policies
```sql
-- Set user context
SELECT set_user_context('user-id', 'org-id', 'STUDENT', 'user@example.com');

-- Try to access data
SELECT * FROM lms_courses;

-- Should only see courses for that org
```

### Test Stripe Webhooks
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

### Test Security Headers
```bash
curl -I https://elevateforhumanity.org
# Check for CSP, X-Frame-Options, etc.
```

### Test Rate Limiting
```bash
# Send multiple requests
for i in {1..10}; do
  curl https://api.elevateforhumanity.org/api/auth/login
done
# Should get 429 after limit
```

---

## 📊 Monitoring

### Sentry Dashboards
- Error rate trends
- Performance metrics
- User impact
- Release tracking

### Cloudflare Analytics
- Traffic patterns
- Attack mitigation
- Cache hit rates
- Worker performance

### Railway Metrics
- CPU usage
- Memory usage
- Response times
- Error rates

---

## 🆘 Troubleshooting

### RLS Issues
**Problem:** Users can't access their own data
**Solution:** Check RLS context is being set correctly
```typescript
// Verify in logs
console.log('User context:', req.user);
```

### Webhook Issues
**Problem:** Stripe webhooks failing
**Solution:** Verify webhook secret and signature
```bash
# Check Stripe dashboard for webhook logs
# Verify STRIPE_WEBHOOK_SECRET is correct
```

### CORS Issues
**Problem:** Frontend can't call API
**Solution:** Check CORS configuration
```typescript
// Verify origin is in allowed list
console.log('CORS_ALLOWED_ORIGINS:', process.env.CORS_ALLOWED_ORIGINS);
```

### CSP Issues
**Problem:** Scripts blocked by CSP
**Solution:** Check browser console for CSP violations
- Add legitimate sources to CSP policy
- Use nonces for inline scripts

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Sentry Documentation](https://docs.sentry.io/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

## 🎯 Next Steps

1. **Complete the implementation checklist above**
2. **Run the audit script to verify:**
   ```bash
   ./audit-saas.sh
   ```
3. **Review the audit report:**
   ```bash
   cat audit-report.md
   ```
4. **Test in staging environment first**
5. **Deploy to production**
6. **Monitor Sentry for errors**
7. **Review security regularly**

---

**Questions or issues?** Check the troubleshooting section or review the code comments in each file.
