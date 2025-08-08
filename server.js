const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

function buildTargetUrl(req) {
  const redditPath = req.params[0]; // captures everything after /api/reddit/
  const query = req.url.split('?')[1];
  const base = `https://www.reddit.com/${redditPath}`;
  return query ? `${base}?${query}` : base;
}

// Proxy endpoint for Reddit API
app.get('/api/reddit/*', async (req, res) => {
  try {
    const targetUrl = buildTargetUrl(req);
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Redlookit/1.0 (by /u/one-loop)',
        'Accept': 'application/json'
      }
    });

    // Forward status and body directly
    const bodyText = await upstream.text();
    res.status(upstream.status);
    // Pass-through content-type when possible
    const ct = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    res.set('content-type', ct);
    res.send(bodyText);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({
      error: 'Bad Gateway',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Redlookit proxy server running on port ${PORT}`);
  console.log(`Access the app at: http://localhost:${PORT}`);
});
