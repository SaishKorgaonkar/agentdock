import { describe, expect, it } from "vitest";

import {
  PaymentVerificationError,
  verifyRecipientTransfer,
} from "./payment.js";

const transactionId = "0.0.12345@1234567890.123456789";
const recipient = "0.0.5005";

describe("Hedera payment verification", () => {
  it("accepts a settled transfer that meets the quoted price", () => {
    expect(
      verifyRecipientTransfer(transactionId, recipient, 10_000n, [
        { accountId: "0.0.1001", amountTinybars: -10_000n },
        { accountId: recipient, amountTinybars: 10_000n },
      ]),
    ).toEqual({
      transactionId,
      recipientAccountId: recipient,
      amountTinybars: 10_000n,
    });
  });

  it("rejects a payment that does not settle enough HBAR to the recipient", () => {
    expect(() =>
      verifyRecipientTransfer(transactionId, recipient, 10_000n, [
        { accountId: "0.0.1001", amountTinybars: -9_999n },
        { accountId: recipient, amountTinybars: 9_999n },
      ]),
    ).toThrow(PaymentVerificationError);
  });
});
