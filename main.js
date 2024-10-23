const http = require('http');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <cache>', 'path to cache directory');

program.parse(process.argv);

const options = program.opts();

if (!fs.existsSync(options.cache)) {
  console.error(`Error: Cache directory "${options.cache}" does not exist.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
