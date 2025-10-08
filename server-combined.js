/**
 * Combined Server - Serves Backend API + Frontend HTML
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static HTML pages
app.use(express.static('pages'));
app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/catalog', express.static('catalog'));
app.use('/hls', express.static('hls'));
app.use('/public', express.static('public'));

// Start backend API as separate process
const backendProcess = spawn('node', ['backend/dist/index.js'], {
  env: { ...process.env, PORT: '3001' },
  stdio: 'inherit'
});

backendProcess.on('error', (err) => {
  console.error('❌ Backend failed to start:', err);
});

// Proxy API requests to backend
app.use('/api', (req, res) => {
  const url = `http://localhost:3001${req.url}`;
  require('http').get(url, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res);
  }).on('error', (err) => {
    res.status(502).json({ error: 'Backend unavailable' });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'lms.html'));
});

// Cleanup on exit
process.on('SIGTERM', () => {
  backendProcess.kill();
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📄 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 Backend: http://localhost:3001`);
});
