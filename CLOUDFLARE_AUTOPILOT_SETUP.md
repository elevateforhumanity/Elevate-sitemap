# Cloudflare Autopilot Configuration Guide

## 🎯 Current Situation

You have a Cloudflare Worker named **"golive"** already deployed at:
- **URL:** `https://golive.elevateforhumanity.workers.dev`
- **Account ID:** `6ba1d2a52a3fa230972960db307ac7c0`
- **Status:** Production (with Access enabled)

## ⚠️ Problem: Worker vs Pages

Your current setup uses **Cloudflare Workers**, but you need **Cloudflare Pages** for this static site.

### Difference:
- **Workers:** For backend APIs and serverless functions
- **Pages:** For static websites (HTML, CSS, JS)

## ✅ Solution: Deploy to Cloudflare Pages

### Option 1: Use Cloudflare Dashboard (Recommended - No Wrangler Needed)

**Steps:**
1. Go to [https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0](https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0)
2. Click **Workers & Pages** in left sidebar
3. Click **Create Application** button
4. Click **Pages** tab (not Workers)
5. Click **Connect to Git**
6. Select repository: **`elevateforhumanity/tiny-new`**
7. Configure build:
   ```
   Project name: tiny-new
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```
8. Click **Save and Deploy**

**Result:**
- Live at: `https://tiny-new.pages.dev`
- Auto-deploys on every push to `main`
- No Access authentication required
- Public for everyone

---

### Option 2: Use Wrangler CLI (Advanced)

If you want to use Wrangler CLI for deployment:

**1. Install Wrangler:**
```bash
npm install -g wrangler
```

**2. Login to Cloudflare:**
```bash
wrangler login
```

**3. Update wrangler.toml:**
```toml
name = "tiny-new"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# Optional: Add custom domain later
# [[routes]]
# pattern = "yourdomain.com/*"
# zone_name = "yourdomain.com"
```

**4. Build the project:**
```bash
cd /workspaces/tiny-new
npm run build
```

**5. Deploy to Pages:**
```bash
wrangler pages deploy dist --project-name=tiny-new
```

**Result:**
- Live at: `https://tiny-new.pages.dev`
- Manual deployment (run command each time)

---

## 🔧 What About the "golive" Worker?

### Option A: Keep It (Recommended)
- Use "golive" Worker for backend APIs
- Use "tiny-new" Pages for frontend
- They can work together

### Option B: Delete It
If you don't need the Worker:
1. Go to [https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/workers/services/view/golive/production](https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/workers/services/view/golive/production)
2. Click **Settings** tab
3. Scroll to bottom
4. Click **Delete Worker**

---

## 🚀 Recommended Setup for Your Autopilot

### Architecture:
```
┌─────────────────────────────────────┐
│  Cloudflare Pages (Frontend)        │
│  https://tiny-new.pages.dev         │
│  - Store page                       │
│  - Demo page                        │
│  - All static content               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Cloudflare Worker (Backend)        │
│  https://golive.*.workers.dev       │
│  - Stripe checkout API              │
│  - License validation               │
│  - Email notifications              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Supabase (Database)                │
│  - Customer data                    │
│  - License keys                     │
│  - Purchase history                 │
└─────────────────────────────────────┘
```

---

## 📋 Autopilot Configuration Steps

### Step 1: Deploy Frontend to Pages
```bash
# Option A: GitHub Integration (Easiest)
# Just connect GitHub repo in Cloudflare dashboard

# Option B: Wrangler CLI
cd /workspaces/tiny-new
npm run build
wrangler pages deploy dist --project-name=tiny-new
```

### Step 2: Configure Worker for Backend APIs
Update your "golive" Worker to handle:
- `/api/create-checkout-session` - Stripe payments
- `/api/verify-license` - License validation
- `/api/send-license-email` - Email delivery

### Step 3: Connect Pages to Worker
In your Pages settings, add environment variable:
```
API_URL=https://golive.elevateforhumanity.workers.dev
```

### Step 4: Remove Access from Worker
The Worker needs to be public for API calls:
1. Go to Zero Trust → Access → Applications
2. Find policy for `*-golive.elevateforhumanity.workers.dev`
3. Delete or disable the policy

---

## 🔐 Security Configuration

### For Pages (Frontend):
- ✅ Already configured in `public/_headers`
- ✅ Security headers set
- ✅ No authentication needed (public site)

### For Worker (Backend):
- ✅ Add API key validation
- ✅ Rate limiting
- ✅ CORS configuration
- ❌ Remove Cloudflare Access (blocks API calls)

---

## 💡 Quick Start Commands

### Deploy Everything:
```bash
# 1. Build frontend
cd /workspaces/tiny-new
npm run build

# 2. Deploy to Pages (if using Wrangler)
wrangler pages deploy dist --project-name=tiny-new

# 3. Deploy Worker (if you have worker code)
cd worker
wrangler deploy
```

### Test Deployment:
```bash
# Test Pages
curl https://tiny-new.pages.dev

# Test Worker API
curl https://golive.elevateforhumanity.workers.dev/api/health
```

---

## ❓ Do You Need to Configure Wrangler?

### Answer: **NO, if using GitHub integration** (Recommended)

**Use GitHub Integration if:**
- ✅ You want automatic deployments
- ✅ You don't want to run commands manually
- ✅ You want the simplest setup
- ✅ You're deploying a static site

**Use Wrangler CLI if:**
- ✅ You need manual control over deployments
- ✅ You're deploying Workers (backend APIs)
- ✅ You want to deploy from CI/CD
- ✅ You need advanced configuration

---

## 🎯 Recommended Action for Your Autopilot

**Best approach:**
1. ✅ Deploy **tiny-new** to Cloudflare Pages via GitHub (no Wrangler needed)
2. ✅ Keep **golive** Worker for backend APIs
3. ✅ Remove Access from golive Worker
4. ✅ Connect Pages to Worker via environment variables

**This gives you:**
- Fast static site hosting (Pages)
- Serverless backend (Worker)
- Automatic deployments (GitHub)
- No manual Wrangler commands needed

---

## 📞 Next Steps

1. **Deploy to Pages** (5 minutes)
   - Use GitHub integration in Cloudflare dashboard
   - No Wrangler configuration needed

2. **Configure Worker** (10 minutes)
   - Remove Access policy
   - Add API endpoints
   - Test API calls

3. **Connect Everything** (5 minutes)
   - Add API_URL to Pages environment
   - Test end-to-end flow
   - Verify store checkout works

**Total Time: 20 minutes**

---

## 🆘 Troubleshooting

### Issue: "Access Denied" on Worker
**Solution:** Remove Cloudflare Access policy from Worker

### Issue: "Module not found" in Worker
**Solution:** Make sure Worker has all dependencies bundled

### Issue: "CORS error" when calling Worker from Pages
**Solution:** Add CORS headers to Worker responses:
```javascript
headers: {
  'Access-Control-Allow-Origin': 'https://tiny-new.pages.dev',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### Issue: Pages not updating after push
**Solution:** Check build logs in Cloudflare dashboard

---

**Summary:** Your autopilot does NOT need to configure Wrangler if you use GitHub integration for Pages deployment. Just connect the repo in the Cloudflare dashboard and it will auto-deploy.
