const http = require('http');
const https = require('https');

const TARGET_HOST = 'api.football-data.org';
const TARGET_BASE = '/v4';

http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'X-Auth-Token, Content-Type',
      'access-control-allow-methods': 'GET, OPTIONS',
    });
    res.end();
    return;
  }

  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: TARGET_BASE + req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET_HOST,
    },
  };

  const proxy = https.request(options, (proxyRes) => {
    const headers = {
      ...proxyRes.headers,
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'X-Auth-Token, Content-Type',
    };
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502);
    res.end(err.message);
  });

  req.pipe(proxy, { end: true });
}).listen(8082, () => {
  console.log('Football API proxy running on http://localhost:8082');
});
