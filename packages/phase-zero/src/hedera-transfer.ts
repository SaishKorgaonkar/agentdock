import {
  AccountBalanceQuery,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  Status,
  TransferTransaction,
} from "@hashgraph/sdk";

import { optionalEnv, requiredEnv } from "./env.js";

const operatorId = requiredEnv("HEDERA_OPERATOR_ID");
const operatorKey = requiredEnv("HEDERA_OPERATOR_KEY");
const recipientId = requiredEnv("HEDERA_X402_RECIPIENT_ID");
const tinybars = BigInt(optionalEnv("HEDERA_TRANSFER_TINYBARS", "10000"));

if (tinybars <= 0n) {
  throw new Error("HEDERA_TRANSFER_TINYBARS must be greater than zero");
}

const operator = AccountId.fromString(operatorId);
const recipient = AccountId.fromString(recipientId);
const operatorPrivateKey = PrivateKey.fromStringECDSA(operatorKey);

if (operator.compare(recipient) === 0) {
  throw new Error(
    "HEDERA_X402_RECIPIENT_ID must differ from HEDERA_OPERATOR_ID",
  );
}

const client = Client.forTestnet();
client.setOperator(operator, operatorPrivateKey);

const transaction = new TransferTransaction()
  .addHbarTransfer(operator, Hbar.fromTinybars(-tinybars))
  .addHbarTransfer(recipient, Hbar.fromTinybars(tinybars));

const response = await transaction.execute(client);
const receipt = await response.getReceipt(client);

if (receipt.status !== Status.Success) {
  throw new Error(
    `Hedera transfer failed with status ${receipt.status.toString()}`,
  );
}

const recipientBalance = await new AccountBalanceQuery()
  .setAccountId(recipient)
  .execute(client);

console.log(
  JSON.stringify(
    {
      network: "hedera-testnet",
      transactionId: response.transactionId.toString(),
      status: receipt.status.toString(),
      recipientAccountId: recipient.toString(),
      recipientBalanceTinybars: recipientBalance.hbars.toTinybars().toString(),
    },
    null,
    2,
  ),
);
