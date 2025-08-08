const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

// Proxy endpoint for Reddit API
app.get('/api/reddit/*', async (req, res) => {
    try {
        // Extract the Reddit URL from the request
        const redditPath = req.params[0];
        const redditUrl = `https://www.reddit.com/${redditPath}`;
        
        // Add query parameters if they exist
        const queryString = req.url.split('?')[1];
        const fullUrl = queryString ? `${redditUrl}?${queryString}` : redditUrl;
        
        console.log(`Proxying request to: ${fullUrl}`);
        
        // Make request to Reddit with proper headers
        const response = await fetch(fullUrl, {
            headers: {
                'User-Agent': 'Redlookit/1.0 (by /u/one-loop)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Reddit API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch from Reddit API',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Redlookit proxy server running on port ${PORT}`);
    console.log(`Access the app at: http://localhost:${PORT}`);
});
