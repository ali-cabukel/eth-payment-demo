// Tiny static server for the demo page (no extra dependencies).
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 4321;
const WEB = path.join(__dirname, "..", "web");
const ETHERS = path.join(__dirname, "..", "node_modules", "ethers", "dist", "ethers.min.js");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];
    const file = url === "/vendor/ethers.js" ? ETHERS : path.join(WEB, url === "/" ? "index.html" : url);
    if (!file.startsWith(WEB) && file !== ETHERS) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end("Not found");
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Demo running at http://localhost:${PORT}`));
