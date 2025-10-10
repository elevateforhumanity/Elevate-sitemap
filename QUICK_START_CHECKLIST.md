# Quick Start Checklist

## ⚡ Get Your Secure SaaS Running in 30 Minutes

Follow this checklist to implement all security enhancements.

---

## ☑️ Phase 1: Dependencies (5 minutes)

```bash
# Backend dependencies
cd backend
npm install @sentry/node @sentry/profiling-node @supabase/supabase-js

# Frontend dependencies
cd ../frontend
npm install @sentry/react @sentry/tracing @supabase/supabase-js

# Workers dependencies
cd ../workers
npm install
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 2: Environment Configuration (10 minutes)

```bash
# Copy environment template
cp .env.example .env
```

**Fill in these CRITICAL values in `.env`:**

```bash
# Database (from Supabase dashboard)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (from Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry (from Sentry dashboard)
SENTRY_DSN=https://...@sentry.io/...

# Generate these secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 3: Database Setup (5 minutes)

```bash
cd backend

# Update Prisma schema to use PostgreSQL (already done)
# Apply migrations
npx prisma migrate dev

# Apply RLS policies
psql $DATABASE_URL -f ../prisma/migrations/enable_rls.sql

# Add Stripe events table
psql $DATABASE_URL -f ../prisma/migrations/add_stripe_events.sql

# Generate Prisma client
npx prisma generate
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 4: Backend Integration (5 minutes)

Update `backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// NEW IMPORTS
import { initSentry, sentryErrorHandler } from './config/sentry';
import { setRLSContext } from './middleware/rls-context';
import { cspMiddleware, securityHeaders, corsOptions } from './middleware/security-headers';
import stripeWebhookRouter from './routes/stripe-webhook';

const app = express();
const prisma = new PrismaClient();

// 1. Initialize Sentry FIRST
initSentry(app);

// 2. Security middleware
app.use(cors(corsOptions));
app.use(cspMiddleware);
app.use(securityHeaders);

// 3. Body parsers (EXCEPT for webhook route)
app.use(express.json({ verify: (req, res, buf) => {
  if (req.originalUrl.startsWith('/api/stripe/webhook')) {
    (req as any).rawBody = buf.toString();
  }
}}));

// 4. Auth middleware (your existing auth)
// app.use(authMiddleware);

// 5. RLS context (AFTER auth)
app.use(setRLSContext(prisma));

// 6. Stripe webhooks (raw body)
app.use('/api/stripe/webhook', 
  express.raw({type: 'application/json'}), 
  stripeWebhookRouter
);

// 7. Your existing routes
// app.use('/api', routes);

// 8. Sentry error handler (LAST)
app.use(sentryErrorHandler);

app.listen(3000, () => console.log('Server running on port 3000'));
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 5: Frontend Integration (3 minutes)

Update `frontend/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NEW IMPORT
import { initSentry } from './config/sentry';

// Initialize Sentry
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 6: Stripe Webhook Setup (2 minutes)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://api.elevateforhumanity.org/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.*`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 7: Test Locally (5 minutes)

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Test Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger payment_intent.succeeded
```

**Verify:**
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Stripe webhook receives test event
- [ ] Check Sentry for test error (trigger one intentionally)

**✅ All tests pass? Check here: [ ]**

---

## ☑️ Phase 8: Deploy (10 minutes)

### Railway (Backend)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up
```

### Durable (Frontend)
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Durable (via their dashboard or CLI)
# Upload the dist/ folder
```

### Cloudflare Workers
```bash
cd workers
wrangler login
wrangler deploy
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 9: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to: Settings → Secrets and variables → Actions
2. Add these secrets:

```
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
RAILWAY_TOKEN=...
DURABLE_API_KEY=...
DURABLE_SITE_ID=...
DATABASE_URL=...
SENTRY_DSN=...
STRIPE_WEBHOOK_SECRET=...
```

**✅ Done? Check here: [ ]**

---

## ☑️ Phase 10: Verify Production (5 minutes)

```bash
# Run the audit script
./audit-saas.sh

# Check the report
cat audit-report.md
```

**Expected results:**
- ✅ RLS policies enabled
- ✅ Stripe webhooks configured
- ✅ CSP headers present
- ✅ Sentry tracking errors
- ✅ Cloudflare Workers deployed

**✅ All green? Check here: [ ]**

---

## 🎉 You're Done!

Your platform now has:
- ✅ Enterprise-grade security
- ✅ Reliable payment processing
- ✅ Real-time error tracking
- ✅ Scalable infrastructure
- ✅ Automated deployments

---

## 📊 Quick Health Check

Run these commands to verify everything:

```bash
# Check backend health
curl https://api.elevateforhumanity.org/api/health

# Check frontend
curl -I https://elevateforhumanity.org

# Check security headers
curl -I https://elevateforhumanity.org | grep -E "(X-Frame|Content-Security|Strict-Transport)"

# Check Sentry (should see events in dashboard)
# https://sentry.io/organizations/[your-org]/issues/

# Check Stripe webhooks (should see successful deliveries)
# https://dashboard.stripe.com/webhooks
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
cd backend
npm run dev

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### RLS blocking queries
```sql
-- Check RLS context
SELECT current_setting('app.current_user_id', true);
SELECT current_setting('app.current_org_id', true);

-- If empty, check middleware is applied
```

### Stripe webhooks failing
```bash
# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Test locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Sentry not tracking errors
```typescript
// Test manually
import { captureException } from './config/sentry';
captureException(new Error('Test error'));
```

---

## 📚 Next Steps

1. **Read the full guide:** `SECURITY_IMPLEMENTATION_GUIDE.md`
2. **Review the summary:** `IMPLEMENTATION_SUMMARY.md`
3. **Set up monitoring dashboards**
4. **Configure alerts**
5. **Train your team**

---

## ✨ Pro Tips

- **Test in staging first** - Always
- **Monitor Sentry closely** - First 48 hours
- **Review logs daily** - First week
- **Rotate secrets** - Every 90 days
- **Keep dependencies updated** - Weekly
- **Backup database** - Daily automated

---

**Questions?** Check `SECURITY_IMPLEMENTATION_GUIDE.md` or review code comments.

**Ready to scale!** 🚀
