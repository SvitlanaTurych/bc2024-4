const http = require('http');
const { Command } = require('commander');
const fs = require('fs').promises; 
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <cache>', 'path to cache directory');

program.parse(process.argv);

const options = program.opts();

fs.access(options.cache)
  .catch(() => {
    console.error(`Error: Cache directory "${options.cache}" does not exist.`);
    process.exit(1);
  });

const server = http.createServer(async (req, res) => {
  const urlPath = req.url;
  const method = req.method;
 
  const code = urlPath.slice(1);
  const filePath = path.join(options.cache, `${code}.jpg`);

  if (method === 'GET') {
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
    } else if (method === 'PUT') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
          body = Buffer.concat(body);
          try {
            await fs.writeFile(filePath, body);
            res.writeHead(201, { 'Content-Type': 'text/plain' });
            res.end('201 Created');
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
          }
        });
      }
  else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method Not Allowed');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
