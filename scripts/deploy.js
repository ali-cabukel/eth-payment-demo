// Deploys PaymentProcessor to the local chain and tells the web page where it is.
const fs = require("fs");
const path = require("path");
const { ethers, artifacts } = require("hardhat");

async function main() {
  const pp = await ethers.deployContract("PaymentProcessor");
  await pp.waitForDeployment();
  const address = await pp.getAddress();
  const { abi } = await artifacts.readArtifact("PaymentProcessor");

  const out = path.join(__dirname, "..", "web", "contract.json");
  fs.writeFileSync(out, JSON.stringify({ address, abi }, null, 2));

  console.log(`PaymentProcessor deployed at ${address}`);
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
