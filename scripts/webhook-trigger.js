#!/usr/bin/env node

const axios = require('axios');

/**
 * Trigger sitemap update via GitHub repository dispatch
 * Usage: node webhook-trigger.js [source] [description]
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'elevateforhumanity';
const REPO_NAME = 'Elevate-sitemap';

async function triggerSitemapUpdate(source = 'manual', description = 'Content updated') {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable required');
    process.exit(1);
  }

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
      {
        event_type: 'content-updated',
        client_payload: {
          source,
          description,
          timestamp: new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 204) {
      console.log('✅ Sitemap update triggered successfully');
      console.log(`📝 Source: ${source}`);
      console.log(`📄 Description: ${description}`);
      console.log(`🔗 Monitor: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`);
    } else {
      console.error('❌ Unexpected response:', response.status);
    }

  } catch (error) {
    console.error('❌ Failed to trigger update:', error.response?.data || error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const source = process.argv[2] || 'manual';
  const description = process.argv[3] || 'Content updated';
  
  triggerSitemapUpdate(source, description);
}

module.exports = { triggerSitemapUpdate };