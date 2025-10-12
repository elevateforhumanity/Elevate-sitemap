# Complete Automation Setup Guide

## 🤖 What's Been Automated

Your autopilot now handles:
- ✅ **Auto-deploy** to Cloudflare, Render, and Supabase on every push
- ✅ **Auto-sync** changes from Elevate-sitemap to tiny-new
- ✅ **Auto-fix** failed deployments
- ✅ **AI assistance** for code review, bug fixes, and optimizations
- ✅ **Auto-rollback** on critical failures
- ✅ **Health monitoring** of all deployments

## 📋 Required Secrets

You need to add these secrets to your GitHub repository:

### Go to: https://github.com/elevateforhumanity/Elevate-sitemap/settings/secrets/actions

### 1. Cloudflare Secrets
```
CLOUDFLARE_API_TOKEN
  - Get from: https://dash.cloudflare.com/profile/api-tokens
  - Click "Create Token"
  - Use "Edit Cloudflare Workers" template
  - Copy token

CLOUDFLARE_ACCOUNT_ID
  - Your account ID: 6ba1d2a52a3fa230972960db307ac7c0
```

### 2. Render Secrets
```
RENDER_DEPLOY_HOOK_URL
  - Go to: https://dashboard.render.com
  - Select your service
  - Settings → Deploy Hook
  - Copy the webhook URL
```

### 3. Supabase Secrets
```
SUPABASE_ACCESS_TOKEN
  - Go to: https://supabase.com/dashboard/account/tokens
  - Generate new token
  - Copy token

SUPABASE_PROJECT_REF
  - Your project reference ID
  - Found in project settings
```

### 4. GitHub Secrets
```
PAT_TOKEN (Personal Access Token)
  - Go to: https://github.com/settings/tokens
  - Generate new token (classic)
  - Select scopes: repo, workflow, write:packages
  - Copy token
```

### 5. AI Worker Secrets (Optional but Recommended)
```
OPENAI_API_KEY
  - Go to: https://platform.openai.com/api-keys
  - Create new secret key
  - Copy key
  - Enables AI auto-fix and code review
```

### 6. Notifications (Optional)
```
SLACK_WEBHOOK_URL
  - Go to: https://api.slack.com/messaging/webhooks
  - Create incoming webhook
  - Copy webhook URL
  - Get deployment notifications in Slack
```

---

## 🚀 How It Works

### On Every Push to `main`:

1. **Build & Test**
   - Installs dependencies
   - Runs linter
   - Builds project
   - Uploads artifacts

2. **Deploy to Cloudflare Pages**
   - Downloads build artifacts
   - Deploys to Cloudflare
   - Auto-fixes if deployment fails
   - Notifies on success/failure

3. **Deploy to Render**
   - Triggers Render webhook
   - Waits for deployment
   - Checks health status
   - Retries on failure

4. **Deploy to Supabase**
   - Links to project
   - Pushes database migrations
   - Deploys Edge Functions
   - Auto-resets on failure

5. **Sync to tiny-new**
   - Copies all changes
   - Excludes store/demo pages
   - Commits and pushes
   - Keeps repositories in sync

6. **Health Check**
   - Verifies all deployments
   - Checks HTTP status codes
   - Reports status
   - Triggers alerts if down

### On Deployment Failure:

1. **Auto-Fix Attempts**
   - Identifies failure type
   - Applies appropriate fix
   - Retries build
   - Commits fix if successful

2. **AI Analysis** (if enabled)
   - Analyzes error logs
   - Suggests fixes
   - Applies fixes automatically
   - Creates PR if manual review needed

3. **Rollback** (if critical)
   - Finds last successful commit
   - Reverts to stable version
   - Notifies team
   - Creates issue for review

---

## 🤖 AI Workers Available

### 1. Code Review
**Trigger:** Open a Pull Request
**What it does:**
- Reviews code changes
- Suggests improvements
- Checks for bugs
- Ensures best practices

### 2. Auto-Fix
**Trigger:** Add label `ai-fix` to issue
**What it does:**
- Analyzes test failures
- Generates fixes
- Applies fixes automatically
- Commits changes

### 3. Dependency Updates
**Trigger:** Add label `dependencies` to issue
**What it does:**
- Checks for outdated packages
- Analyzes update safety
- Updates dependencies
- Creates PR with changes

### 4. Documentation
**Trigger:** Add label `documentation` to issue
**What it does:**
- Scans codebase
- Generates JSDoc comments
- Creates README files
- Updates documentation

### 5. Performance Optimization
**Trigger:** Add label `performance` to issue
**What it does:**
- Runs Lighthouse audit
- Analyzes performance
- Suggests optimizations
- Creates optimization issue

### 6. Security Scanner
**Trigger:** Add label `security` to issue
**What it does:**
- Runs npm audit
- Analyzes vulnerabilities
- Applies security patches
- Commits fixes

---

## 📊 Monitoring Dashboard

### View Deployment Status:
- **GitHub Actions:** https://github.com/elevateforhumanity/Elevate-sitemap/actions
- **Cloudflare:** https://dash.cloudflare.com/6ba1d2a52a3fa230972960db307ac7c0/pages
- **Render:** https://dashboard.render.com
- **Supabase:** https://supabase.com/dashboard

### Health Check URLs:
- **Cloudflare:** https://elevateforhumanity.pages.dev
- **Render:** https://elevateforhumanity.onrender.com
- **Supabase:** https://[your-project-ref].supabase.co

---

## 🔧 Manual Triggers

### Trigger AI Worker Manually:
1. Go to: https://github.com/elevateforhumanity/Elevate-sitemap/actions
2. Select "AI Assistant Worker"
3. Click "Run workflow"
4. Choose task:
   - Fix failing tests
   - Update dependencies
   - Optimize performance
   - Fix security issues
   - Generate documentation

### Trigger Deployment Manually:
1. Go to: https://github.com/elevateforhumanity/Elevate-sitemap/actions
2. Select "Auto Deploy to All Platforms"
3. Click "Run workflow"
4. Select branch (usually `main`)

---

## 🎯 Workflow Examples

### Example 1: Push Code Change
```bash
git add .
git commit -m "Add new feature"
git push origin main
```
**What happens:**
1. GitHub Actions triggers
2. Builds and tests code
3. Deploys to Cloudflare, Render, Supabase
4. Syncs to tiny-new
5. Runs health checks
6. Notifies you of success

### Example 2: Deployment Fails
**What happens:**
1. Auto-fix detects failure
2. Identifies problem (missing module, syntax error, etc.)
3. Applies fix automatically
4. Retries deployment
5. If still fails, creates issue and notifies you

### Example 3: Need AI Help
```bash
# Create issue with label
gh issue create --title "Optimize performance" --label "performance"
```
**What happens:**
1. AI Worker triggers
2. Runs performance audit
3. Analyzes results
4. Creates optimization suggestions
5. Posts recommendations in issue

---

## 🔒 Security Best Practices

### Secrets Management:
- ✅ Never commit secrets to Git
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Rotate tokens regularly (every 90 days)
- ✅ Use least-privilege access
- ✅ Enable 2FA on all accounts

### Access Control:
- ✅ Limit who can trigger workflows
- ✅ Require PR reviews for main branch
- ✅ Enable branch protection rules
- ✅ Use CODEOWNERS file

---

## 📝 Checklist

### Initial Setup:
- [ ] Add all required secrets to GitHub
- [ ] Test Cloudflare deployment
- [ ] Test Render deployment
- [ ] Test Supabase deployment
- [ ] Verify sync to tiny-new works
- [ ] Test AI worker (optional)
- [ ] Set up Slack notifications (optional)

### Ongoing:
- [ ] Monitor GitHub Actions dashboard
- [ ] Review AI suggestions
- [ ] Check deployment health weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly

---

## 🆘 Troubleshooting

### Issue: Workflow not triggering
**Solution:** Check branch protection rules and workflow permissions

### Issue: Deployment failing repeatedly
**Solution:** Check secrets are correct and services are accessible

### Issue: AI worker not responding
**Solution:** Verify OPENAI_API_KEY is set and has credits

### Issue: Sync to tiny-new not working
**Solution:** Check PAT_TOKEN has correct permissions

---

## 📞 Support

### Get Help:
- **GitHub Issues:** https://github.com/elevateforhumanity/Elevate-sitemap/issues
- **GitHub Discussions:** https://github.com/elevateforhumanity/Elevate-sitemap/discussions
- **Email:** support@elevateforhumanity.org

### Useful Commands:
```bash
# View workflow runs
gh run list

# View specific run
gh run view [run-id]

# Trigger workflow manually
gh workflow run "Auto Deploy to All Platforms"

# Check deployment status
curl https://elevateforhumanity.pages.dev/health.txt
```

---

## 🎉 You're All Set!

Your autopilot is now configured to:
- ✅ Deploy automatically on every push
- ✅ Fix failures automatically
- ✅ Sync changes to tiny-new
- ✅ Provide AI assistance when needed
- ✅ Monitor health of all deployments
- ✅ Rollback on critical failures

**No more manual deployments or commits needed!**

Just push your code and let the autopilot handle the rest.

---

**Last Updated:** October 12, 2024  
**Status:** ✅ Fully Automated
