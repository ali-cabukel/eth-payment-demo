// Tiny web server for the demo page (no extra dependencies).
// - serves web/ and the ethers.js browser bundle
// - forwards POST /rpc to the local blockchain, so the page only ever talks to this server
//   (needed when it runs in the cloud, where the browser can't reach 127.0.0.1:8545)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 4321;
const CHAIN_URL = new URL(process.env.CHAIN_URL || "http://127.0.0.1:8545");
const WEB = path.join(__dirname, "..", "web");
const ETHERS = path.join(__dirname, "..", "node_modules", "ethers", "dist", "ethers.min.js");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };
const MAX_BODY = 64 * 1024;

// Only normal Ethereum calls get through. Hardhat's admin methods (hardhat_*, evm_*, debug_*)
// would let a visitor reset the chain or mint ETH for themselves.
const allowed = (m) => typeof m === "string" && (m.startsWith("eth_") || m === "net_version" || m === "web3_clientVersion");

function rpc(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > MAX_BODY) req.destroy();
  });
  req.on("end", () => {
    let calls;
    try {
      const parsed = JSON.parse(body);
      calls = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return res.writeHead(400).end("Bad JSON");
    }
    const blocked = calls.find((c) => !allowed(c?.method));
    if (blocked) return res.writeHead(403).end(`Method not allowed: ${blocked?.method}`);

    const upstream = http.request(
      CHAIN_URL,
      { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (up) => {
        res.writeHead(up.statusCode, { "Content-Type": "application/json" });
        up.pipe(res);
      }
    );
    upstream.on("error", () => res.writeHead(502).end("Blockchain not reachable"));
    upstream.end(body);
  });
}

function start() {
  return http
    .createServer((req, res) => {
      const url = req.url.split("?")[0];
      if (url === "/rpc" && req.method === "POST") return rpc(req, res);
      const file = url === "/vendor/ethers.js" ? ETHERS : path.join(WEB, url === "/" ? "index.html" : url);
      if (!file.startsWith(WEB) && file !== ETHERS) return res.writeHead(403).end();
      fs.readFile(file, (err, data) => {
        if (err) return res.writeHead(404).end("Not found");
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
        res.end(data);
      });
    })
    .listen(PORT, () => console.log(`Demo running at http://localhost:${PORT}`));
}

if (require.main === module) start();
module.exports = { start };
