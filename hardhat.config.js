require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    // `npm run chain` starts this local blockchain on http://127.0.0.1:8545.
    // It gives you 20 test accounts with 10,000 fake ETH each.
    localhost: { url: "http://127.0.0.1:8545" },
  },
};
