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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    });

    const ct = upstream.headers.get('content-type') || '';
    const bodyText = await upstream.text();

    if (!upstream.ok || !ct.includes('application/json')) {
      res.status(upstream.status).json({
        error: 'Upstream error',
        status: upstream.status,
        message: bodyText
      });
      return;
    }

    res.status(upstream.status);
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
