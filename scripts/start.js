// All-in-one start for the container: local blockchain + contract deploy + web server.
// The chain lives in memory, so every restart begins with a fresh chain and a fresh contract.
const { spawn, spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HARDHAT = path.join(ROOT, "node_modules", ".bin", "hardhat");
const CHAIN_URL = "http://127.0.0.1:8545";

async function waitForChain(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(CHAIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      });
      if (r.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Blockchain did not start in time");
}

async function main() {
  const chain = spawn(HARDHAT, ["node", "--hostname", "127.0.0.1", "--port", "8545"], { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] });
  chain.on("exit", (code) => {
    console.error(`Blockchain stopped (exit ${code})`);
    process.exit(1);
  });
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => (chain.kill(), process.exit(0)));

  await waitForChain();
  console.log("Blockchain is up");

  const deploy = spawnSync(HARDHAT, ["run", "scripts/deploy.js", "--network", "localhost"], { cwd: ROOT, stdio: "inherit" });
  if (deploy.status !== 0) throw new Error("Contract deploy failed");

  require("./serve").start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
