# Elevate for Humanity - Ecosystem Meta Workspace

🚀 **Unified development environment for all Elevate for Humanity repositories**

> This workspace automatically clones, links, and manages multiple repos (LMS, Marketing, Admin, Shared, Sitemap) as a single development environment.

## 🎯 Quick Start

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/elevateforhumanity/Elevate-sitemap)

The workspace will automatically:
1. Clone all 5 repositories
2. Set up pnpm workspace linking
3. Analyze structure and find duplicates
4. Prepare unified development environment

## 📋 Available Commands

```bash
pnpm dev        # Start all applications in parallel
pnpm build      # Build all applications
pnpm lint       # Lint all code
pnpm analyze    # Analyze repository structures
pnpm dedupe     # Find duplicate files across repos
pnpm organize   # Create deduplication plan
```

## 📁 Repository Structure

- **apps/lms** - Learning Management System (port 3000)
- **apps/marketing** - Marketing Website (port 5173)
- **apps/admin** - Admin Dashboard (port 3001)
- **packages/shared** - Shared components, utils, types
- **tools/sitemap** - SEO sitemap generator

## 📖 Documentation

See [META_WORKSPACE_GUIDE.md](./META_WORKSPACE_GUIDE.md) for complete documentation.

---

# Original: Automated Sitemap System

🚀 **Fully automated XML sitemap generation and deployment for elevateforhumanity.org**

## 🌟 Features

### ✅ **Automated Deployment**
- **Daily updates** at 2 AM UTC via GitHub Actions
- **Manual triggers** via workflow dispatch
- **Content change webhooks** for instant updates
- **GitHub Pages deployment** with custom domain support

### ✅ **Smart Generation**
- **Dynamic URL discovery** from live site content
- **Logical grouping** (core, programs, content, platform)
- **SEO optimization** with priorities and change frequencies
- **Duplicate detection** and removal

### ✅ **Comprehensive Validation**
- **XML structure validation** using xmllint
- **Content validation** (URLs, priorities, change frequencies)
- **Accessibility testing** for sample URLs
- **Size and limit compliance** (Google standards)

### ✅ **Error Handling**
- **Detailed error reporting** with file-specific messages
- **Graceful fallbacks** for inaccessible content
- **Notification system** for deployment status
- **Comprehensive logging** for debugging

## 📁 Structure

```
public/
├── sitemap.xml              # Main sitemap index (4 sitemaps)
├── sitemap-index.xml        # Backup index
├── robots.txt               # Search engine directives
├── CNAME                    # Custom domain configuration
└── sitemaps/
    ├── core-sitemap.xml     # 7 core pages (homepage, about, contact)
    ├── programs-sitemap.xml # 15 training programs
    ├── content-sitemap.xml  # 16 content pages (blog, policies, services)
    └── platform-sitemap.xml # 7 platform pages (LMS, account, employer)
```

## 🔧 Scripts

### `scripts/generate-sitemaps.js`
Core sitemap generation with configurable URL sets
```bash
npm run generate
```

### `scripts/validate-sitemaps.js`
Comprehensive XML and content validation
```bash
npm run validate
```

### `scripts/webhook-trigger.js`
Manual update triggers via GitHub API
```bash
GITHUB_TOKEN=your_token node scripts/webhook-trigger.js "source" "description"
```

### `scripts/fetch-dynamic-urls.js`
Live content discovery and URL extraction

## 🚀 Deployment

### **Automatic Deployment**
- **Scheduled**: Daily at 2 AM UTC
- **On Push**: When files in `public/` or `scripts/` change
- **Manual**: Via GitHub Actions workflow dispatch
- **Webhook**: Via repository dispatch events

### **Custom Domain Setup**
1. Configure DNS: `sitemaps.elevateforhumanity.org` → GitHub Pages
2. Enable HTTPS in repository settings
3. Verify CNAME file points to correct domain

### **GitHub Pages Configuration**
- **Source**: Deploy from branch `main` → `/public`
- **Custom domain**: `sitemaps.elevateforhumanity.org`
- **Enforce HTTPS**: Enabled

## 📊 Optimization Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Files** | 19 sitemaps | 4 sitemaps | **80% reduction** |
| **Duplicates** | 4 duplicate URLs | 0 duplicates | **100% elimination** |
| **Invalid URLs** | 28 example.com | 0 invalid | **100% cleanup** |
| **Structure** | Fragmented | Logical groups | **Organized** |
| **Maintenance** | Manual updates | Automated | **Zero-touch** |

## 🔗 URLs

### **Production URLs**
- **Main Sitemap**: `https://sitemaps.elevateforhumanity.org/sitemap.xml`
- **Backup URL**: `https://elevateforhumanity.github.io/Elevate-sitemap/sitemap.xml`
- **GitHub Actions**: [View Workflows](https://github.com/elevateforhumanity/Elevate-sitemap/actions)

### **Google Search Console**
Submit main sitemap URL: `https://elevateforhumanity.org/sitemap.xml`

## 🛠️ Development

### **Local Setup**
```bash
git clone https://github.com/elevateforhumanity/Elevate-sitemap.git
cd Elevate-sitemap
npm install
npm run dev
```

### **Manual Generation**
```bash
# Generate sitemaps
npm run generate

# Validate output
npm run validate

# Deploy (requires GitHub token)
git add . && git commit -m "Update sitemaps" && git push
```

### **Trigger Updates**
```bash
# Via webhook (requires GITHUB_TOKEN)
GITHUB_TOKEN=your_token node scripts/webhook-trigger.js "blog-update" "New blog post added"

# Via GitHub CLI
gh workflow run deploy-sitemaps.yml

# Via API
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/elevateforhumanity/Elevate-sitemap/dispatches \
  -d '{"event_type":"content-updated","client_payload":{"source":"api","description":"Content updated"}}'
```

## 📈 Monitoring

### **GitHub Actions Status**
- Monitor workflow runs: [Actions Tab](https://github.com/elevateforhumanity/Elevate-sitemap/actions)
- Check deployment logs for errors
- Verify sitemap accessibility after updates

### **Google Search Console**
- Submit sitemap: `https://elevateforhumanity.org/sitemap.xml`
- Monitor indexing status and errors
- Track URL discovery and crawling

### **Validation Checks**
- **XML Structure**: Automated via xmllint
- **Content Validation**: Custom validation script
- **URL Accessibility**: Sample testing included
- **Size Limits**: Google compliance checking

## 🔧 Configuration

### **URL Configuration** (`scripts/generate-sitemaps.js`)
```javascript
const urlConfigs = {
  core: { urls: [...] },      // Homepage, about, contact
  programs: { urls: [...] },  // Training programs
  content: { urls: [...] },   // Blog, policies, services
  platform: { urls: [...] }   // LMS, account, employer
};
```

### **Automation Settings** (`.github/workflows/`)
- **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
- **Triggers**: Push, manual, webhook
- **Validation**: XML + content validation
- **Deployment**: GitHub Pages

## 🆘 Troubleshooting

### **Common Issues**

**Deployment Fails**
- Check GitHub Actions logs
- Verify XML validation passes
- Ensure no syntax errors in scripts

**URLs Not Accessible**
- Check domain configuration
- Verify GitHub Pages settings
- Confirm CNAME file is correct

**Validation Errors**
- Run `npm run validate` locally
- Check XML structure with xmllint
- Verify URL formats and priorities

**Outdated Content**
- Trigger manual update via webhook
- Check if dynamic URL fetching is working
- Verify content source accessibility

### **Support**
- **Issues**: [GitHub Issues](https://github.com/elevateforhumanity/Elevate-sitemap/issues)
- **Actions**: [Workflow Runs](https://github.com/elevateforhumanity/Elevate-sitemap/actions)
- **Documentation**: This README

---

## 📄 License
MIT License - see LICENSE file for details

**Automated sitemap system for Elevate for Humanity**  
*Optimized for Google Search Console and SEO performance*
