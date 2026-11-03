# ETH Payment Demo

A small, hands-on Ethereum payment system for learning. It runs on a **local test blockchain on your own computer**. The ETH is fake, nothing touches the real network, and nothing costs money.

- A **smart contract** (`contracts/PaymentProcessor.sol`): a merchant creates invoices, customers pay them in ETH, the merchant withdraws.
- A **web page** (`web/`): switch between a coffee shop and two customers, create and pay invoices, and browse the blocks and transactions you created.
- **Türkçe:** the page is also at http://localhost:4321/tr.html and the guide is in [LEARN.tr.md](LEARN.tr.md).
- A **beginner's guide**: [LEARN.md](LEARN.md) explains blockchain, wallets, gas, smart contracts and what a real company system needs, all tied to the demo.

## Run it

Needs Node.js 18 or newer. From this folder:

```bash
npm install
```

Then use three terminal tabs:

```bash
npm run chain    # 1. start the local blockchain (leave it running)
```

```bash
npm run deploy   # 2. put the contract on it
```

```bash
npm run web      # 3. open http://localhost:4321
```

If you stop and restart `npm run chain`, the blockchain starts empty again: run `npm run deploy` again and reload the page.

## Things to try

1. As **Coffee Shop**, create an invoice for 0.05 ETH.
2. Switch to **Alice** and pay it. Her balance drops by 0.05 ETH **plus a small gas fee**.
3. Click **Underpay** on a new invoice, or **Try paying again** on a paid one. The contract refuses.
4. Switch back to **Coffee Shop** and **Withdraw**. The shop's balance goes up (minus the withdraw fee).
5. In the block explorer, click a block, then a transaction: see who sent it, which function it called, the fee, the events and the signature.

## Run the tests

```bash
npm test
```

## Files

| Path | What |
|---|---|
| `contracts/PaymentProcessor.sol` | the smart contract (Solidity) |
| `test/PaymentProcessor.test.js` | automated tests |
| `scripts/deploy.js` | deploys the contract and writes `web/contract.json` |
| `scripts/serve.js` | tiny web server for the page |
| `web/index.html`, `web/tr.html`, `web/app.js` | the demo page in English and Turkish (uses ethers.js) |
| `LEARN.tr.md` | the guide in Turkish |
| `LEARN.md` | the beginner's guide |
