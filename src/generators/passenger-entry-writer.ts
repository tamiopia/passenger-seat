import * as fs from 'fs';
import * as path from 'path';

export function generateNextJsPassengerEntry(outDir: string) {
  const content = `// Passenger entry point for Next.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Since we deploy only .next, public, and node_modules, we tell Next.js not to build
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
  });
});
`;
  fs.writeFileSync(path.join(outDir, 'passenger_entry.js'), content, 'utf-8');
}
