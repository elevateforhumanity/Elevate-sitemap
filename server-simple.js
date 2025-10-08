/**
 * Simple Static Server - Just serve the HTML pages
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Health check first (before static files)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root serves LMS page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'lms.html'));
});

// Serve static files (after routes to avoid conflicts)
app.use(express.static('pages'));
app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/catalog', express.static('catalog'));
app.use('/hls', express.static('hls'));
app.use('/public', express.static('public'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📄 Site: http://localhost:${PORT}`);
});
