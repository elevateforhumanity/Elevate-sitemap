# Deploy Your ACTUAL Site with Backend - RIGHT NOW

## What This Does
- ✅ Serves your 34 HTML pages with working JavaScript
- ✅ Runs the backend API at `/api/*`
- ✅ Connects to PostgreSQL database
- ✅ Everything works together

## Deploy to Render (5 minutes)

### Step 1: Commit and Push
```bash
git add .
git commit -m "Full stack deployment ready"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo: `elevateforhumanity/Elevate-sitemap`
4. Select the repo
5. Click "Apply"

Render will:
- Create PostgreSQL database
- Build backend
- Run migrations
- Start combined server
- Your site goes live

### Step 3: Access Your Site
- **Your Site:** `https://elevate-fullstack.onrender.com`
- **LMS Page:** `https://elevate-fullstack.onrender.com/lms.html`
- **API:** `https://elevate-fullstack.onrender.com/api/health`

## Alternative: Railway (If Render doesn't work)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
# Go to railway.app dashboard → Add Database → PostgreSQL

# Deploy
railway up

# Set environment variables in dashboard:
# - NODE_ENV=production
# - JWT_SECRET=your-secret-here
# - JWT_REFRESH_SECRET=your-refresh-secret

# Run migrations
railway run sh -c "cd backend && npx prisma migrate deploy"
```

## What Happens After Deployment

1. **Backend API works** - All `/api/*` routes functional
2. **HTML pages load** - Your 34 pages with JavaScript
3. **Database connected** - PostgreSQL with Prisma
4. **Authentication works** - JWT tokens, user sessions
5. **Buttons work** - JavaScript connects to API

## Troubleshooting

### If deployment fails:
1. Check Render logs for errors
2. Verify DATABASE_URL is set
3. Ensure migrations ran successfully

### If pages don't load:
1. Check that `pages/` folder exists
2. Verify server-combined.js is running
3. Check browser console for errors

## Next Steps After Live

1. **Custom Domain:** Add your domain in Render dashboard
2. **Environment Variables:** Set production secrets
3. **Monitoring:** Enable Render metrics
4. **Backups:** Configure database backups

## The Difference

**Before:** React SPA that ignored your HTML pages
**Now:** Your actual HTML pages + working backend API

Your site will actually function with:
- User authentication
- Course enrollment
- Database operations
- All the features you built
