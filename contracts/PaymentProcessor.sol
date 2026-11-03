// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PaymentProcessor — a tiny invoice-based payment system (learning demo)
/// @notice Flow: a merchant creates an invoice -> a customer pays it in ETH ->
///         the money is held by this contract -> the merchant withdraws it.
/// @dev    Everything stored here is public on the blockchain. Do not put
///         personal data (names, emails, addresses) in invoice descriptions.
contract PaymentProcessor {
    struct Invoice {
        address merchant;    // who gets paid
        uint256 amount;      // price in wei (1 ETH = 10^18 wei)
        string description;  // e.g. "Order #1042"
        bool paid;
        address payer;       // filled in when paid
        uint64 paidAt;       // block timestamp of the payment
    }

    /// All invoices, by id (ids start at 1).
    mapping(uint256 => Invoice) public invoices;
    uint256 public invoiceCount;

    /// Money each merchant has received but not yet withdrawn.
    mapping(address => uint256) public balances;

    // Events are the contract's "log". Apps (and back-ends) listen to them
    // to learn that something happened, e.g. to mark an order as paid.
    event InvoiceCreated(uint256 indexed id, address indexed merchant, uint256 amount, string description);
    event InvoicePaid(uint256 indexed id, address indexed payer, uint256 amount);
    event Withdrawn(address indexed merchant, uint256 amount);

    /// @notice Merchant creates an invoice and gets back its id.
    function createInvoice(uint256 amount, string calldata description) external returns (uint256 id) {
        require(amount > 0, "Amount must be > 0");
        id = ++invoiceCount;
        invoices[id] = Invoice({
            merchant: msg.sender,
            amount: amount,
            description: description,
            paid: false,
            payer: address(0),
            paidAt: 0
        });
        emit InvoiceCreated(id, msg.sender, amount, description);
    }

    /// @notice Customer pays an invoice by sending exactly the invoice amount in ETH.
    /// @dev `payable` means this function can receive ETH. `msg.value` is how much was sent.
    function pay(uint256 id) external payable {
        Invoice storage inv = invoices[id];
        require(inv.merchant != address(0), "Invoice does not exist");
        require(!inv.paid, "Invoice already paid");
        require(msg.value == inv.amount, "Wrong amount");

        inv.paid = true;
        inv.payer = msg.sender;
        inv.paidAt = uint64(block.timestamp);
        balances[inv.merchant] += msg.value;

        emit InvoicePaid(id, msg.sender, msg.value);
    }

    /// @notice Merchant withdraws everything they have been paid.
    /// @dev "Pull" pattern: we set the balance to 0 *before* sending ETH,
    ///      so a malicious receiver cannot call back in and withdraw twice
    ///      (a "re-entrancy" attack).
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        balances[msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// Reject plain ETH transfers that are not tied to an invoice.
    receive() external payable {
        revert("Use pay(invoiceId)");
    }
}
