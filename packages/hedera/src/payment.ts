import {
  AccountId,
  Client,
  Status,
  TransactionId,
  TransactionRecordQuery,
} from "@hashgraph/sdk";

export type PaymentReceipt = Readonly<{
  transactionId: string;
  recipientAccountId: string;
  amountTinybars: bigint;
}>;

export class PaymentVerificationError extends Error {}

export function verifyRecipientTransfer(
  transactionId: string,
  recipientAccountId: string,
  minimumTinybars: bigint,
  transfers: readonly Readonly<{
    accountId: string;
    amountTinybars: bigint;
  }>[],
): PaymentReceipt {
  if (minimumTinybars <= 0n) {
    throw new Error("Minimum payment must be greater than zero");
  }

  const received = transfers
    .filter((transfer) => transfer.accountId === recipientAccountId)
    .reduce((total, transfer) => total + transfer.amountTinybars, 0n);

  if (received < minimumTinybars) {
    throw new PaymentVerificationError(
      `Payment ${transactionId} sent ${received} tinybars to ${recipientAccountId}; expected at least ${minimumTinybars}`,
    );
  }

  return {
    transactionId,
    recipientAccountId,
    amountTinybars: received,
  };
}

export class HederaPaymentVerifier {
  readonly #recipient: AccountId;
  readonly #minimumTinybars: bigint;

  constructor(recipientAccountId: string, minimumTinybars: bigint) {
    this.#recipient = AccountId.fromString(recipientAccountId);
    this.#minimumTinybars = minimumTinybars;
  }

  async verify(transactionId: string): Promise<PaymentReceipt> {
    const client = Client.forTestnet();
    const record = await new TransactionRecordQuery()
      .setTransactionId(TransactionId.fromString(transactionId))
      .execute(client);

    if (record.receipt.status !== Status.Success) {
      throw new PaymentVerificationError(
        `Hedera transaction ${transactionId} did not succeed: ${record.receipt.status.toString()}`,
      );
    }

    return verifyRecipientTransfer(
      transactionId,
      this.#recipient.toString(),
      this.#minimumTinybars,
      record.transfers.map((transfer) => ({
        accountId: transfer.accountId.toString(),
        amountTinybars: BigInt(transfer.amount.toTinybars().toString()),
      })),
    );
  }
}
