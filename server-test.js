import { createServer } from 'http';
import { stat, createReadStream } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const DIST_DIR = join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = extname(filePath);
  let contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Special handling for .mjs files
  if (ext === '.js' && filePath.includes('module')) {
    contentType = 'application/javascript; charset=utf-8';
  }
  
  stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        filePath = join(DIST_DIR, 'index.html');
        contentType = 'text/html';
        serveFile(filePath, contentType);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      if (stats.isDirectory()) {
        filePath = join(filePath, 'index.html');
        contentType = 'text/html';
      }
      serveFile(filePath, contentType);
    }
  });
  
  function serveFile(path, contentType) {
    stat(path, (err, stats) => {
      if (err) {
        res.writeHead(404);
        res.end(`File Not Found: ${path}`);
        return;
      }
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'public, max-age=0'
      });
      
      const stream = createReadStream(path);
      stream.pipe(res);
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Testing URLs:');
  console.log(`  http://localhost:${PORT}/index.html`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/test-ios.html`);
  console.log(`  http://localhost:${PORT}/debug.html`);
});