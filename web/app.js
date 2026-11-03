import { ethers } from "/vendor/ethers.js";

const RPC_URL = "http://127.0.0.1:8545";

// UI text. The page picks a language with <html lang="..."> (index.html = en, tr.html = tr).
const STRINGS = {
  en: {
    locale: "en-US",
    shop: "Coffee Shop",
    merchant: "merchant",
    customer: "customer",
    contractName: "PaymentProcessor contract",
    noContractFile: "The contract hasn't been deployed yet (web/contract.json is missing).",
    noChain: (url) => `Nothing is answering at ${url}.`,
    restarted: "The blockchain was restarted, so the contract is gone. Run npm run deploy again.",
    connected: (addr) => `Connected. The contract lives at <span class="mono">${addr}</span>. Pick a person and try it out.`,
    sent: (who, label, hash) => `${who} signed and sent <b>${label}</b>. Tx hash <span class="mono">${hash}</span>. Waiting to be mined…`,
    confirmed: (label, block, gas, gwei, fee, who) =>
      `✅ <b>${label}</b> confirmed in block <b>#${block}</b>. Gas used ${gas} × ${gwei} gwei = fee ${fee} (paid by ${who}).`,
    refused: (label, why) =>
      `❌ <b>${label}</b> was refused by the contract: “${why}”. The wallet simulated it first and stopped, so nothing was mined, no ETH moved and no fee was paid.`,
    badAmount: "Please enter an amount like 0.05",
    defaultDesc: "Invoice",
    invoiceAction: (label, id) => `${label} invoice #${id}`,
    owed: (eth, who) => `${eth} for ${who}`,
    paid: "Paid",
    open: "Open",
    to: (who) => `to ${who}`,
    payAs: (who) => `Pay as ${who}`,
    pay: "Pay",
    underpay: "Underpay",
    underpayLabel: "Underpay (10%)",
    payAgain: "Try paying again",
    payAgainLabel: "Pay again",
    block: (n) => `Block #${n}`,
    genesis: " (genesis)",
    txCount: (n) => `${n} tx`,
    blockNumber: "Block number",
    hash: "Hash",
    parentHash: "Parent hash",
    parentNote: (n) => `(= hash of block #${n})`,
    time: "Time",
    gasUsed: "Gas used",
    transactions: "Transactions",
    none: "none",
    deployment: "Contract deployment",
    plainTransfer: "plain ETH transfer",
    txHash: "Tx hash",
    status: "Status",
    success: "Success",
    reverted: "Reverted",
    from: "From",
    toLabel: "To",
    newContract: "(new contract)",
    functionCalled: "Function called",
    ethSent: "ETH sent",
    nonce: "Nonce",
    nonceNote: "(this sender's transaction counter; stops replays)",
    gasOfLimit: (used, limit) => `${used} of limit ${limit}`,
    fee: "Fee",
    perGas: (gwei) => `(${gwei} gwei per gas)`,
    events: "Events emitted",
    signature: "Signature",
    back: (n) => `← back to block #${n}`,
  },
  tr: {
    locale: "tr-TR",
    shop: "Kahveci",
    merchant: "mağaza",
    customer: "müşteri",
    contractName: "PaymentProcessor sözleşmesi",
    noContractFile: "Sözleşme henüz yayınlanmamış (web/contract.json yok).",
    noChain: (url) => `${url} adresinde yanıt veren bir şey yok.`,
    restarted: "Blokzincir yeniden başlatıldığı için sözleşme silindi. npm run deploy komutunu tekrar çalıştırın.",
    connected: (addr) => `Bağlandı. Sözleşmenin adresi <span class="mono">${addr}</span>. Bir kişi seçip deneyin.`,
    sent: (who, label, hash) => `${who}, <b>${label}</b> işlemini imzalayıp gönderdi. İşlem hash'i <span class="mono">${hash}</span>. Bloğa girmesi bekleniyor…`,
    confirmed: (label, block, gas, gwei, fee, who) =>
      `✅ <b>${label}</b> işlemi <b>#${block}</b> numaralı blokta onaylandı. Kullanılan gas ${gas} × ${gwei} gwei = ücret ${fee} (ödeyen: ${who}).`,
    // The contract's own error messages are English; add a Turkish gloss.
    reasons: {
      "Wrong amount": "yanlış tutar",
      "Invoice already paid": "fatura zaten ödenmiş",
      "Invoice does not exist": "böyle bir fatura yok",
      "Nothing to withdraw": "çekilecek para yok",
      "Amount must be > 0": "tutar 0'dan büyük olmalı",
    },
    refused: (label, why) =>
      `❌ <b>${label}</b> işlemi sözleşme tarafından reddedildi: “${why}”${STRINGS.tr.reasons[why] ? ` (${STRINGS.tr.reasons[why]})` : ""}. Cüzdan işlemi önce denedi ve durdu; bloğa bir şey yazılmadı, ETH el değiştirmedi, ücret ödenmedi.`,
    badAmount: "Lütfen 0,05 gibi bir tutar girin",
    defaultDesc: "Fatura",
    invoiceAction: (label, id) => `#${id} numaralı fatura: ${label}`,
    owed: (eth, who) => `${who}: ${eth}`,
    paid: "Ödendi",
    open: "Açık",
    to: (who) => `alacaklı: ${who}`,
    payAs: (who) => `${who} olarak öde`,
    pay: "Öde",
    underpay: "Eksik öde",
    underpayLabel: "Eksik öde (%10)",
    payAgain: "Tekrar ödemeyi dene",
    payAgainLabel: "Tekrar öde",
    block: (n) => `Blok #${n}`,
    genesis: " (ilk blok)",
    txCount: (n) => `${n} işlem`,
    blockNumber: "Blok numarası",
    hash: "Hash",
    parentHash: "Üst blok hash'i",
    parentNote: (n) => `(= #${n} numaralı bloğun hash'i)`,
    time: "Zaman",
    gasUsed: "Kullanılan gas",
    transactions: "İşlemler",
    none: "yok",
    deployment: "Sözleşme yayınlama",
    plainTransfer: "düz ETH transferi",
    txHash: "İşlem hash'i",
    status: "Durum",
    success: "Başarılı",
    reverted: "Geri alındı",
    from: "Gönderen",
    toLabel: "Alıcı",
    newContract: "(yeni sözleşme)",
    functionCalled: "Çağrılan fonksiyon",
    ethSent: "Gönderilen ETH",
    nonce: "Nonce",
    nonceNote: "(gönderenin işlem sayacı; aynı işlemin tekrar gönderilmesini engeller)",
    gasOfLimit: (used, limit) => `${used} (üst sınır ${limit})`,
    fee: "Ücret",
    perGas: (gwei) => `(gas başına ${gwei} gwei)`,
    events: "Yayılan olaylar",
    signature: "İmza",
    back: (n) => `← #${n} numaralı bloğa dön`,
  },
};
const T = STRINGS[document.documentElement.lang] || STRINGS.en;

// Hardhat's built-in test accounts #1–#3 (account #0 deployed the contract).
const PEOPLE = [
  { index: 1, name: T.shop, role: T.merchant },
  { index: 2, name: "Alice", role: T.customer },
  { index: 3, name: "Bob", role: T.customer },
];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
const num = (n, digits = 9) => Number(n).toLocaleString(T.locale, { maximumFractionDigits: digits });
const eth = (wei, digits = 4) => `${num(ethers.formatEther(wei), digits)} ETH`;
const gwei = (wei) => num(ethers.formatUnits(wei, "gwei"));
const time = (ts) => new Date(Number(ts) * 1000).toLocaleTimeString(T.locale);

let provider, contract, iface, contractAddress;
let active; // the person we are acting as
let selectedBlock = null;
let busy = false;

function nameOf(addr) {
  if (!addr) return "";
  if (contractAddress && addr.toLowerCase() === contractAddress.toLowerCase()) return T.contractName;
  const p = PEOPLE.find((p) => p.address.toLowerCase() === addr.toLowerCase());
  return p ? p.name : short(addr);
}

function log(html, isError = false) {
  const li = document.createElement("li");
  li.innerHTML = html;
  if (isError) li.className = "err";
  $("log").prepend(li);
}

function reason(err) {
  return err?.reason || err?.info?.error?.message || err?.shortMessage || err?.message || String(err);
}

async function init() {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  provider.pollingInterval = 1000;

  let info;
  try {
    info = await (await fetch("contract.json", { cache: "no-store" })).json();
  } catch {
    return showError(T.noContractFile);
  }
  try {
    const net = await provider.getNetwork();
    $("chain-id").textContent = net.chainId.toString();
  } catch {
    return showError(T.noChain(RPC_URL));
  }
  if ((await provider.getCode(info.address)) === "0x") {
    return showError(T.restarted);
  }

  contractAddress = info.address;
  iface = new ethers.Interface(info.abi);
  const accounts = await provider.send("eth_accounts", []);
  for (const p of PEOPLE) p.address = ethers.getAddress(accounts[p.index]);
  active = PEOPLE[0];

  $("create-btn").onclick = createInvoice;
  $("withdraw-btn").onclick = withdraw;
  provider.on("block", refresh);
  log(T.connected(contractAddress));
  await refresh();
}

function showError(text) {
  $("app").style.display = "none";
  $("error-screen").style.display = "grid";
  $("error-text").textContent = text;
}

async function asActive() {
  const signer = await provider.getSigner(active.address);
  return contract ? contract.connect(signer) : new ethers.Contract(contractAddress, iface, signer);
}

// Sends a transaction, waits for it to be mined, and explains what happened.
async function send(label, fn) {
  if (busy) return;
  busy = true;
  document.querySelectorAll("button.btn").forEach((b) => (b.disabled = true));
  try {
    const tx = await fn(await asActive());
    log(T.sent(esc(active.name), esc(label), short(tx.hash)));
    const r = await tx.wait();
    log(T.confirmed(esc(label), r.blockNumber, num(r.gasUsed), gwei(r.gasPrice), eth(r.gasUsed * r.gasPrice, 8), esc(active.name)));
  } catch (err) {
    log(T.refused(esc(label), esc(reason(err)).trim()), true);
  } finally {
    busy = false;
    await refresh();
  }
}

async function createInvoice() {
  // Accept both "0.05" and the Turkish "0,05".
  const amountText = $("amount").value.trim().replace(",", ".");
  const desc = $("desc").value.trim() || T.defaultDesc;
  let amount;
  try {
    amount = ethers.parseEther(amountText || "0");
  } catch {
    return log(T.badAmount, true);
  }
  await send(`createInvoice(${num(amountText)} ETH, "${desc}")`, (c) => c.createInvoice(amount, desc));
}

async function payInvoice(id, amount, label) {
  await send(T.invoiceAction(label, id), (c) => c.pay(id, { value: amount }));
}

async function withdraw() {
  await send("withdraw()", (c) => c.withdraw());
}

// ---------- rendering ----------

async function refresh() {
  if (!contractAddress) return;
  contract = new ethers.Contract(contractAddress, iface, provider);
  const latest = await provider.getBlockNumber();
  $("block-num").textContent = `#${latest}`;
  await Promise.all([renderAccounts(), renderInvoices(), renderBlocks(latest)]);
  document.querySelectorAll("button.btn").forEach((b) => (b.disabled = busy));
}

async function renderAccounts() {
  const balances = await Promise.all(PEOPLE.map((p) => provider.getBalance(p.address)));
  $("accounts").innerHTML = PEOPLE.map(
    (p, i) => `
      <button class="acct ${p === active ? "active" : ""}" data-i="${i}">
        <div class="name">${esc(p.name)} <span class="muted">· ${p.role}</span></div>
        <div class="mono muted">${p.address}</div>
        <div class="bal">${eth(balances[i])}</div>
      </button>`
  ).join("");
  document.querySelectorAll(".acct").forEach((el) => {
    el.onclick = () => {
      active = PEOPLE[Number(el.dataset.i)];
      refresh();
    };
  });
  const owed = await contract.balances(active.address);
  $("merchant-balance").textContent = T.owed(eth(owed), active.name);
}

async function renderInvoices() {
  const count = Number(await contract.invoiceCount());
  if (count === 0) return;
  const ids = Array.from({ length: count }, (_, i) => count - i);
  const invs = await Promise.all(ids.map((id) => contract.invoices(id)));
  $("invoices").innerHTML = invs
    .map((inv, i) => {
      const id = ids[i];
      const status = inv.paid ? `<span class="tag ok">${T.paid}</span>` : `<span class="tag warn">${T.open}</span>`;
      const paidBy = inv.paid ? `${esc(nameOf(inv.payer))}<div class="muted">${time(inv.paidAt)}</div>` : "";
      const tooLittle = inv.amount > 1000n ? inv.amount / 10n : inv.amount - 1n;
      const actions = inv.paid
        ? `<button class="btn ghost" data-pay="${id}" data-amt="${inv.amount}" data-label="${T.payAgainLabel}">${T.payAgain}</button>`
        : `<button class="btn" data-pay="${id}" data-amt="${inv.amount}" data-label="${T.pay}">${esc(T.payAs(active.name))}</button>
           <button class="btn ghost" data-pay="${id}" data-amt="${tooLittle}" data-label="${T.underpayLabel}">${T.underpay}</button>`;
      return `<tr>
        <td>${id}</td>
        <td>${esc(inv.description)}<div class="muted">${esc(T.to(nameOf(inv.merchant)))}</div></td>
        <td>${eth(inv.amount)}</td>
        <td>${status}</td>
        <td>${paidBy}</td>
        <td style="white-space:nowrap">${actions}</td>
      </tr>`;
    })
    .join("");
  document.querySelectorAll("[data-pay]").forEach((b) => {
    b.onclick = () => payInvoice(Number(b.dataset.pay), BigInt(b.dataset.amt), b.dataset.label);
  });
}

async function renderBlocks(latest) {
  const nums = [];
  for (let n = latest; n >= 0 && nums.length < 8; n--) nums.push(n);
  const blocks = await Promise.all(nums.map((n) => provider.getBlock(n)));
  $("blocks").innerHTML = blocks
    .map(
      (b) => `
      <div class="block ${b.number === selectedBlock ? "sel" : ""}" data-n="${b.number}">
        <div class="num">${T.block(b.number)}${b.number === 0 ? T.genesis : ""}</div>
        <div class="mono">hash ${short(b.hash)}</div>
        <div class="link mono">parent ${short(b.parentHash)}</div>
        <div class="muted">${T.txCount(b.transactions.length)} · ${time(b.timestamp)}</div>
      </div>`
    )
    .join("");
  document.querySelectorAll(".block").forEach((el) => (el.onclick = () => showBlock(Number(el.dataset.n))));
}

async function showBlock(n) {
  selectedBlock = n;
  document.querySelectorAll(".block").forEach((el) => el.classList.toggle("sel", Number(el.dataset.n) === n));
  const b = await provider.getBlock(n);
  const txs = b.transactions.length
    ? b.transactions.map((h) => `<div><span class="txlink mono" data-tx="${h}">${h}</span></div>`).join("")
    : `<span class="muted">${T.none}</span>`;
  $("detail").innerHTML = `
    <dl>
      <dt>${T.blockNumber}</dt><dd>${b.number}</dd>
      <dt>${T.hash}</dt><dd class="mono">${b.hash}</dd>
      <dt>${T.parentHash}</dt><dd class="mono">${b.parentHash} <span class="muted">${T.parentNote(Math.max(b.number - 1, 0))}</span></dd>
      <dt>${T.time}</dt><dd>${new Date(b.timestamp * 1000).toLocaleString(T.locale)}</dd>
      <dt>${T.gasUsed}</dt><dd>${num(b.gasUsed)}</dd>
      <dt>${T.transactions}</dt><dd>${txs}</dd>
    </dl>`;
  document.querySelectorAll("[data-tx]").forEach((el) => (el.onclick = () => showTx(el.dataset.tx)));
}

async function showTx(hash) {
  const [tx, r] = await Promise.all([provider.getTransaction(hash), provider.getTransactionReceipt(hash)]);
  let call = T.deployment;
  if (tx.to) {
    const parsed = iface.parseTransaction({ data: tx.data, value: tx.value });
    call = parsed ? `${parsed.name}(${parsed.args.map((a) => (typeof a === "bigint" ? a.toString() : JSON.stringify(a))).join(", ")})` : T.plainTransfer;
  }
  const events = r.logs
    .map((l) => {
      try {
        const e = iface.parseLog(l);
        return `<div class="mono">${e.name}(${e.args.map((a) => (typeof a === "bigint" ? a.toString() : a)).join(", ")})</div>`;
      } catch {
        return "";
      }
    })
    .join("");
  $("detail").innerHTML = `
    <dl>
      <dt>${T.txHash}</dt><dd class="mono">${tx.hash}</dd>
      <dt>${T.status}</dt><dd>${r.status === 1 ? `<span class="tag ok">${T.success}</span>` : `<span class="tag err">${T.reverted}</span>`}</dd>
      <dt>${T.from}</dt><dd>${esc(nameOf(tx.from))} <span class="mono muted">${tx.from}</span></dd>
      <dt>${T.toLabel}</dt><dd>${tx.to ? `${esc(nameOf(tx.to))} <span class="mono muted">${tx.to}</span>` : T.newContract}</dd>
      <dt>${T.functionCalled}</dt><dd class="mono">${esc(call)}</dd>
      <dt>${T.ethSent}</dt><dd>${eth(tx.value, 8)}</dd>
      <dt>${T.nonce}</dt><dd>${tx.nonce} <span class="muted">${T.nonceNote}</span></dd>
      <dt>${T.gasUsed}</dt><dd>${T.gasOfLimit(num(r.gasUsed), num(tx.gasLimit))}</dd>
      <dt>${T.fee}</dt><dd>${eth(r.gasUsed * r.gasPrice, 8)} <span class="muted">${T.perGas(gwei(r.gasPrice))}</span></dd>
      <dt>${T.events}</dt><dd>${events || `<span class="muted">${T.none}</span>`}</dd>
      <dt>${T.signature}</dt><dd class="mono muted">r ${short(tx.signature.r)} · s ${short(tx.signature.s)} · v ${tx.signature.v}</dd>
    </dl>
    <p><span class="txlink" id="back">${T.back(r.blockNumber)}</span></p>`;
  $("back").onclick = () => showBlock(r.blockNumber);
}

init().catch((err) => showError(reason(err)));
