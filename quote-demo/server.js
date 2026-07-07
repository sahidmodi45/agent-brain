// quote-demo/server.js
//
// Minimal, dependency-free Node HTTP server for the quote-demo project.
// Uses only Node built-ins: http, fs, path.
//
// Routes:
//   GET /       -> serves index.html (text/html)
//   GET /quote  -> returns a random quote as JSON: { text, author }
//   anything else -> 404, plain text, no crash

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
];

const INDEX_PATH = path.join(__dirname, 'index.html');

function sendJSON(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function send404(res) {
  const body = 'Not Found';
  res.writeHead(404, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveIndex(res) {
  fs.readFile(INDEX_PATH, (err, data) => {
    if (err) {
      const body = 'Internal Server Error';
      res.writeHead(500, {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(body),
      });
      res.end(body);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': data.length,
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Strip query string, if any, before matching the route.
  const urlPath = (req.url || '/').split('?')[0];

  if (req.method === 'GET' && urlPath === '/') {
    serveIndex(res);
    return;
  }

  if (req.method === 'GET' && urlPath === '/quote') {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    sendJSON(res, 200, quote);
    return;
  }

  send404(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
