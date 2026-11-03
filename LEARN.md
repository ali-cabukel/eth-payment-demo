# Crypto and blockchain basics, explained through this demo

This guide goes with the demo app. Each idea is tied to something you can click.

## 1. What is a blockchain?

A **shared record book** that thousands of computers keep identical copies of.

- The record is split into **blocks**. Each block holds a batch of **transactions** ("Alice paid 0.05 ETH to invoice #1").
- Each block has a **hash**: a short fingerprint calculated from its contents. Change one byte and the fingerprint changes completely.
- Each block also stores the **hash of the block before it** (its *parent*). That is the "chain".
- To quietly change an old payment you'd have to change that block, which changes its hash, which breaks the next block's parent link, and so on. You'd have to redo every later block faster than the rest of the network. In practice that's impossible, so **history can't be edited**.

👉 In the demo: the **Mini block explorer** shows each block's hash and its parent hash. Click two neighbouring blocks and compare.

## 2. What is a cryptocurrency? What is Ether (ETH)?

The blockchain's own money. On Ethereum it is **Ether (ETH)**. Nobody holds it "for" you like a bank does. The blockchain just records which address owns how much.

- The smallest unit is **wei**. `1 ETH = 1,000,000,000,000,000,000 wei` (10¹⁸). Code always works in wei (whole numbers) to avoid rounding errors. That's why the contract stores amounts in wei and the app converts to ETH for display.
- **gwei** = 10⁹ wei, used for gas prices (see below).

## 3. Wallets, addresses and private keys

A **wallet** is just a key pair:

| | What it is | Share it? |
|---|---|---|
| **Private key** | a secret 256-bit number | **Never.** Whoever has it owns the money. |
| **Address** | derived from the public key, e.g. `0x7099…79C8` | Yes, like an IBAN |

When you send a transaction, your wallet **signs** it with the private key. Anyone can check the signature against your address, but nobody can forge it. There is **no "forgot password"**: lose the key and the funds are gone. Leak it and they are stolen.

👉 In the demo: the three people are Hardhat's built-in test wallets. Clicking a transaction shows its **signature** (`r`, `s`, `v`) and its **nonce** (a per-sender counter, so the same signed payment can't be replayed twice).

## 4. Transactions and gas fees

Every change to the blockchain is a **transaction**. Reading is free; writing costs a **fee**, paid in ETH:

```
fee = gas used × gas price
```

- **Gas** measures how much computation the transaction needs (a plain ETH transfer is 21,000 gas; calling a contract is more).
- **Gas price** is what you offer per unit of gas. When the network is busy, prices go up.
- The fee goes to the network (validators), **not** to the shop.

👉 In the demo: the log shows gas used, gas price and the fee for every action. Notice the merchant pays a fee just to create an invoice.

## 5. Mining / validation and confirmation

Transactions wait in a queue until a **validator** puts them into a block. Ethereum makes a new block about every **12 seconds**. A payment is "confirmed" once it is in a block. Many businesses wait a few more blocks (or for "finality", ~13 minutes) before shipping expensive goods.

👉 In the demo: the local chain mines a block **instantly** for each transaction, so it feels faster than real life.

## 6. Smart contracts

A **smart contract** is a program that lives on the blockchain at its own address. Once deployed:

- Its code is **public** and (normally) **can't be changed**.
- It runs exactly as written. Nobody, including the company that wrote it, can override it.
- It can **hold ETH** itself.

Our contract is `contracts/PaymentProcessor.sol`, written in **Solidity**. It has three functions:

| Function | Who calls it | What it does |
|---|---|---|
| `createInvoice(amount, description)` | merchant | stores an invoice, returns its id |
| `pay(id)` + ETH | customer | checks the amount is exact and the invoice is unpaid, marks it paid, credits the merchant |
| `withdraw()` | merchant | sends the merchant everything they've been paid |

If a rule fails (wrong amount, already paid), the contract **reverts**: the whole transaction is cancelled as if it never happened.

👉 In the demo: try **Underpay** or **Try paying again**. The log shows the contract's error message.

## 7. Events: how a company's back-end knows "it's paid"

Contracts emit **events** (`InvoiceCreated`, `InvoicePaid`, `Withdrawn`). They are cheap, permanent log entries. A real shop's server **listens for `InvoicePaid`** and then marks the order as paid in its own database and ships the goods.

👉 In the demo: click a transaction to see the events it emitted.

## 8. Why "pull" withdrawals? (a security lesson)

The contract does not push money to the merchant during `pay()`. It **adds to a balance** that the merchant **pulls** later with `withdraw()`, and it sets the balance to zero *before* sending the ETH. This blocks the classic **re-entrancy attack** (the 2016 "DAO hack", ~$60M) where a malicious receiver calls back into the contract mid-payment to withdraw twice.

## 9. Test networks vs. mainnet

| Network | Money | Used for |
|---|---|---|
| **Local (Hardhat)**, this demo | fake, unlimited | learning, automated tests |
| **Sepolia** testnet | free test ETH from "faucets" | testing with real wallets like MetaMask |
| **Ethereum mainnet** | real ETH | production |
| **Layer 2s** (Base, Arbitrum, Optimism…) | real ETH, much cheaper fees | most real-world payments today |

## 10. What a real company payment system needs on top

This demo is deliberately small. A production crypto-payment system also deals with:

1. **Price volatility.** ETH's price moves a lot. Most merchants price in fiat (TL/€/$) and convert at checkout, or accept **stablecoins** (USDC, USDT: tokens pegged to $1) instead of ETH.
2. **Customer wallets.** Customers pay with MetaMask, Coinbase Wallet, WalletConnect, etc. The app asks the wallet to sign; it never sees the private key.
3. **Key custody.** Who holds the company's private keys? Usually a hardware security module, a multi-signature wallet (e.g. Safe) or a custody provider. Losing them loses the money.
4. **Confirmations and reorgs.** Wait for enough blocks before treating a payment as final.
5. **Refunds.** Blockchain payments can't be reversed by a bank. Refunds must be a new payment back, which the contract or back-end must support.
6. **Audits.** Contract bugs are permanent and public. Production contracts are audited and usually built on well-tested libraries like OpenZeppelin.
7. **Privacy.** Everything on-chain is public forever. Never put customer names, emails or order details on-chain; store an order id and keep the rest in your own database.
8. **Regulation.** KYC/AML, tax and licensing rules depend on the country. In Türkiye, crypto-asset service providers are regulated by SPK (Law 7518, 2024), and using crypto assets *as a means of payment* is banned by the TCMB regulation of April 2021. Check with legal before launching.
9. **Payment gateways.** Many companies use a provider (Coinbase Commerce, BitPay, Stripe crypto, etc.) instead of building from scratch.

## Glossary

| Term | Meaning |
|---|---|
| Address | Public account id (`0x…`, 40 hex characters) |
| Block | A batch of transactions, linked to the previous block by its hash |
| Gas | Unit of computation; you pay for it in ETH |
| Gwei | 10⁹ wei, used for gas prices |
| Hash | Fixed-size fingerprint of some data; any change gives a totally different hash |
| Nonce | Per-account transaction counter |
| Private key | The secret that controls an address |
| Revert | Contract rejected the call; all its changes are undone |
| Smart contract | Program stored and run on the blockchain |
| Stablecoin | Token designed to stay at a fixed value (e.g. $1) |
| Wei | Smallest unit of ETH (10⁻¹⁸ ETH) |
