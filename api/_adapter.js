// Adapter to convert Vercel Serverless Function (req, res) to Netlify Function (event) format

export function adaptVercelHandler(netlifyHandler) {
  return async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const event = {
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
    };

    try {
      const result = await netlifyHandler(event);
      if (result.headers) {
        for (const [key, val] of Object.entries(result.headers)) {
          res.setHeader(key, val);
        }
      }
      res.status(result.statusCode || 200);
      if (typeof result.body === 'string') {
        res.setHeader('Content-Type', 'application/json');
        res.send(result.body);
      } else {
        res.json(result.body);
      }
    } catch (err) {
      console.error('[Vercel API Adapter Error]:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  };
}
