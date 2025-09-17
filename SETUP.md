# Setup Guide - Automated Sitemap System

## 🚀 Quick Start

### 1. **Enable GitHub Pages**
```
Repository Settings → Pages → Source: Deploy from branch → main → /public
```

### 2. **Configure Custom Domain** (Optional)
```
Repository Settings → Pages → Custom domain: sitemaps.elevateforhumanity.org
```

### 3. **Set Up DNS** (If using custom domain)
```
DNS Record: CNAME sitemaps.elevateforhumanity.org → elevateforhumanity.github.io
```

### 4. **Update Main Site**
Point your main site's sitemap reference to:
```
https://sitemaps.elevateforhumanity.org/sitemap.xml
```

### 5. **Submit to Google Search Console**
```
Property: elevateforhumanity.org
Sitemap URL: https://elevateforhumanity.org/sitemap.xml
```

## 🔧 Advanced Configuration

### **Environment Variables**
For webhook triggers, set up GitHub token:
```bash
export GITHUB_TOKEN=your_personal_access_token
```

### **Workflow Permissions**
Ensure GitHub Actions has these permissions:
- `contents: write` - For committing updates
- `pages: write` - For GitHub Pages deployment
- `id-token: write` - For deployment authentication

### **Custom URL Configuration**
Edit `scripts/generate-sitemaps.js` to modify URL sets:
```javascript
const urlConfigs = {
  core: {
    urls: [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      // Add more core URLs
    ]
  }
  // Add more categories
};
```

## 🔄 Integration Options

### **Option 1: Webhook Integration**
Set up webhooks from your main site to trigger updates:
```javascript
// When content changes, trigger sitemap update
fetch('https://api.github.com/repos/elevateforhumanity/Elevate-sitemap/dispatches', {
  method: 'POST',
  headers: {
    'Authorization': 'token YOUR_GITHUB_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event_type: 'content-updated',
    client_payload: {
      source: 'cms',
      description: 'New content published'
    }
  })
});
```

### **Option 2: API Integration**
Use the webhook trigger script:
```bash
GITHUB_TOKEN=your_token node scripts/webhook-trigger.js "blog-update" "New post added"
```

### **Option 3: Manual Updates**
Trigger via GitHub CLI:
```bash
gh workflow run deploy-sitemaps.yml
```

## 📊 Monitoring Setup

### **GitHub Actions Monitoring**
1. Go to repository Actions tab
2. Enable notifications for workflow failures
3. Monitor deployment logs regularly

### **Google Search Console Setup**
1. Add property for `elevateforhumanity.org`
2. Submit sitemap: `https://elevateforhumanity.org/sitemap.xml`
3. Monitor indexing status and errors
4. Set up email alerts for sitemap issues

### **Uptime Monitoring** (Optional)
Set up monitoring for sitemap accessibility:
```bash
# Example with curl
curl -f https://sitemaps.elevateforhumanity.org/sitemap.xml || echo "Sitemap down"
```

## 🛠️ Customization

### **Adding New URL Categories**
1. Edit `scripts/generate-sitemaps.js`
2. Add new category to `urlConfigs`
3. Update sitemap index generation
4. Test locally with `npm run dev`

### **Modifying Update Frequency**
Edit `.github/workflows/deploy-sitemaps.yml`:
```yaml
schedule:
  # Change from daily to hourly
  - cron: '0 * * * *'
```

### **Custom Validation Rules**
Edit `scripts/validate-sitemaps.js` to add custom checks:
```javascript
// Add custom validation logic
if (customCondition) {
  this.addError('Custom validation failed', fileName);
}
```

## 🔒 Security Considerations

### **GitHub Token Permissions**
Use minimal permissions for GitHub tokens:
- `repo` scope for private repositories
- `public_repo` scope for public repositories
- `workflow` scope for triggering actions

### **Webhook Security**
If implementing webhooks, use:
- HTTPS only
- Token authentication
- Request validation
- Rate limiting

### **Domain Security**
For custom domains:
- Enable HTTPS enforcement
- Use HSTS headers
- Monitor for unauthorized changes

## 📋 Maintenance

### **Regular Tasks**
- **Weekly**: Check GitHub Actions for failures
- **Monthly**: Review Google Search Console reports
- **Quarterly**: Update URL configurations
- **Annually**: Review and update documentation

### **Troubleshooting Checklist**
1. ✅ GitHub Pages enabled and configured
2. ✅ DNS records pointing correctly
3. ✅ GitHub Actions permissions set
4. ✅ Sitemap validation passing
5. ✅ Google Search Console submission successful

### **Performance Optimization**
- Monitor sitemap file sizes (keep under 50MB)
- Limit URLs per sitemap (under 50,000)
- Use appropriate change frequencies
- Set realistic priorities

## 🆘 Support

### **Common Issues**

**"GitHub Pages not deploying"**
- Check repository settings
- Verify workflow permissions
- Review Actions logs

**"Custom domain not working"**
- Verify DNS configuration
- Check CNAME file content
- Wait for DNS propagation (up to 24 hours)

**"Sitemaps not updating"**
- Check workflow triggers
- Verify script execution
- Review validation errors

**"Google not indexing"**
- Confirm sitemap submission
- Check for validation errors
- Monitor Search Console reports

### **Getting Help**
- **GitHub Issues**: Report bugs and feature requests
- **Actions Logs**: Check workflow execution details
- **Google Search Console**: Monitor indexing status
- **Documentation**: Refer to README.md for detailed information

---

**Setup complete! Your automated sitemap system is ready for production.**