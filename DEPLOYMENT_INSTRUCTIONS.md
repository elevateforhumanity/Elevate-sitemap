# Deployment Instructions - 3 Platforms

## ✅ Build Status
- **Build Time:** 1.33s
- **Bundle Size:** 293.91 KB (gzipped: 90.20 KB)
- **Output Directory:** `dist/`
- **All public files included:** ✅

---

## 1️⃣ Cloudflare Pages (Recommended)

### Auto-Deploy via GitHub
1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create Application** → **Pages**
3. Click **Connect to Git**
4. Select repository: **`elevateforhumanity/Elevate-sitemap`**
5. Configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (default)
6. Click **Save and Deploy**

### Live URL
`https://elevateforhumanity.pages.dev`

### Features
- ✅ Auto-deploys on every push to `main`
- ✅ Security headers configured via `public/_headers`
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Unlimited bandwidth

---

## 2️⃣ Render.com

### Auto-Deploy via GitHub
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/)
2. Click **New** → **Static Site**
3. Connect GitHub repository: **`elevateforhumanity/Elevate-sitemap`**
4. Render will auto-detect `render.yaml` configuration:
   - **Name:** elevateforhumanity
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**

### Live URL
`https://elevateforhumanity.onrender.com`

### Features
- ✅ Auto-deploys on every push to `main`
- ✅ Security headers configured in `render.yaml`
- ✅ Free SSL certificate
- ✅ Custom domain support
- ✅ Free tier: 100GB bandwidth/month

---

## 3️⃣ Supabase (Database + Auth + Storage)

### Setup Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Configure:
   - **Name:** elevateforhumanity
   - **Database Password:** (generate strong password)
   - **Region:** Choose closest to users
4. Click **Create Project**

### Link Local Project
```bash
cd /workspaces/Elevate-sitemap
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Push Database Schema
```bash
npx supabase db push
```

### Environment Variables
Add to Cloudflare Pages and Render:
```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### Features
- ✅ PostgreSQL database
- ✅ Authentication (email, OAuth)
- ✅ File storage (R2-compatible)
- ✅ Real-time subscriptions
- ✅ Row-level security
- ✅ Free tier: 500MB database, 1GB storage

---

## 🔒 Security Headers (All Platforms)

Configured on all deployments:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

---

## 📊 Deployment Status

| Platform | Status | URL | Auto-Deploy |
|----------|--------|-----|-------------|
| **Cloudflare Pages** | ⏳ Pending | `elevateforhumanity.pages.dev` | ✅ Yes |
| **Render.com** | ⏳ Pending | `elevateforhumanity.onrender.com` | ✅ Yes |
| **Supabase** | ⏳ Pending | `YOUR_PROJECT_REF.supabase.co` | Manual |

---

## 🚀 Next Steps

1. **Deploy to Cloudflare Pages** (2 minutes)
   - Follow instructions above
   - Get live URL

2. **Deploy to Render.com** (3 minutes)
   - Follow instructions above
   - Get live URL

3. **Set up Supabase** (5 minutes)
   - Create project
   - Link local
   - Push schema
   - Add environment variables to Cloudflare/Render

4. **Test All Deployments**
   - Visit each URL
   - Test enrollment workflow
   - Verify Calendly integration
   - Test video interview component

---

## 💰 Cost Breakdown

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Cloudflare Pages** | Unlimited | $0 |
| **Render.com** | 100GB/month | $7/month (400GB) |
| **Supabase** | 500MB DB, 1GB storage | $25/month (8GB DB, 100GB storage) |

**Total Monthly Cost:** $0 (free tier) or $32 (paid tier)

---

## 📝 Notes

- All platforms auto-deploy on push to `main` branch
- Build time: ~1.5 seconds
- No manual deployment needed after initial setup
- All security headers configured
- SSL certificates automatic on all platforms
