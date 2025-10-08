/**
 * Combined Server - Serves Backend API + Frontend HTML
 * This is what you need to go live
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Import backend app
const backendApp = require('./backend/dist/index.js');

// Serve static HTML pages
app.use(express.static('pages'));
app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/catalog', express.static('catalog'));
app.use('/hls', express.static('hls'));
app.use('/public', express.static('public'));

// API routes go to backend
app.use('/api', backendApp);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'lms.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📄 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});
