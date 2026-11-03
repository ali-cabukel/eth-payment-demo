const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentProcessor", function () {
  async function deploy() {
    const [merchant, customer, stranger] = await ethers.getSigners();
    const pp = await ethers.deployContract("PaymentProcessor");
    return { pp, merchant, customer, stranger };
  }

  const price = ethers.parseEther("0.5");

  it("creates an invoice", async function () {
    const { pp, merchant } = await deploy();
    await expect(pp.connect(merchant).createInvoice(price, "Order #1"))
      .to.emit(pp, "InvoiceCreated")
      .withArgs(1n, merchant.address, price, "Order #1");

    const inv = await pp.invoices(1);
    expect(inv.merchant).to.equal(merchant.address);
    expect(inv.amount).to.equal(price);
    expect(inv.paid).to.equal(false);
  });

  it("lets a customer pay the exact amount", async function () {
    const { pp, merchant, customer } = await deploy();
    await pp.connect(merchant).createInvoice(price, "Order #1");

    await expect(pp.connect(customer).pay(1, { value: price }))
      .to.emit(pp, "InvoicePaid")
      .withArgs(1n, customer.address, price);

    const inv = await pp.invoices(1);
    expect(inv.paid).to.equal(true);
    expect(inv.payer).to.equal(customer.address);
    expect(await pp.balances(merchant.address)).to.equal(price);
  });

  it("rejects wrong amounts, double payment and unknown invoices", async function () {
    const { pp, merchant, customer } = await deploy();
    await pp.connect(merchant).createInvoice(price, "Order #1");

    await expect(pp.connect(customer).pay(1, { value: price - 1n })).to.be.revertedWith("Wrong amount");
    await pp.connect(customer).pay(1, { value: price });
    await expect(pp.connect(customer).pay(1, { value: price })).to.be.revertedWith("Invoice already paid");
    await expect(pp.connect(customer).pay(99, { value: price })).to.be.revertedWith("Invoice does not exist");
  });

  it("lets the merchant withdraw, and only once", async function () {
    const { pp, merchant, customer, stranger } = await deploy();
    await pp.connect(merchant).createInvoice(price, "Order #1");
    await pp.connect(customer).pay(1, { value: price });

    await expect(pp.connect(stranger).withdraw()).to.be.revertedWith("Nothing to withdraw");
    await expect(pp.connect(merchant).withdraw()).to.changeEtherBalances([merchant, pp], [price, -price]);
    await expect(pp.connect(merchant).withdraw()).to.be.revertedWith("Nothing to withdraw");
  });

  it("rejects plain ETH transfers", async function () {
    const { pp, customer } = await deploy();
    await expect(customer.sendTransaction({ to: await pp.getAddress(), value: price })).to.be.revertedWith(
      "Use pay(invoiceId)"
    );
  });
});
