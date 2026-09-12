// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract WorkflowReceiptRegistry {
    enum Status { Completed, RequiresApproval, Failed, Expired }

    struct Receipt {
        bytes32 workflowId;
        bytes32 agentNamehash;
        bytes32 serviceNamehash;
        bytes32 evidenceHash;
        bytes32 decisionHash;
        string hederaPaymentReference;
        Status status;
        uint64 recordedAt;
    }

    address public immutable writer;
    mapping(bytes32 workflowId => Receipt receipt) private receipts;

    event ReceiptRecorded(
        bytes32 indexed workflowId,
        bytes32 indexed agentNamehash,
        bytes32 indexed evidenceHash,
        Status status,
        string hederaPaymentReference
    );

    error Unauthorized();
    error ReceiptAlreadyExists();

    constructor(address initialWriter) {
        writer = initialWriter;
    }

    function recordReceipt(Receipt calldata receipt) external {
        if (msg.sender != writer) revert Unauthorized();
        if (receipts[receipt.workflowId].recordedAt != 0) revert ReceiptAlreadyExists();

        Receipt memory stored = receipt;
        stored.recordedAt = uint64(block.timestamp);
        receipts[receipt.workflowId] = stored;
        emit ReceiptRecorded(
            stored.workflowId,
            stored.agentNamehash,
            stored.evidenceHash,
            stored.status,
            stored.hederaPaymentReference
        );
    }

    function getReceipt(bytes32 workflowId) external view returns (Receipt memory) {
        return receipts[workflowId];
    }
}
