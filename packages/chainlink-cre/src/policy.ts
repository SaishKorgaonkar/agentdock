import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

export type PrivatePolicyInput = Readonly<{
  policyVersion: string;
  reportEvidenceHash: string;
  totalWei: string;
  maximumWei: string;
}>;

export type PrivatePolicyDecision = Readonly<{
  status: "COMPLETED" | "REQUIRES_APPROVAL";
  decisionHash: string;
}>;

export function evaluatePrivatePolicy(
  input: PrivatePolicyInput,
): PrivatePolicyDecision {
  if (!input.policyVersion.trim() || !/^0x[0-9a-f]{64}$/i.test(input.reportEvidenceHash)) {
    throw new Error("Policy version and report evidence hash are required");
  }

  const totalWei = BigInt(input.totalWei);
  const maximumWei = BigInt(input.maximumWei);
  if (totalWei < 0n || maximumWei < 0n) {
    throw new Error("Policy values must not be negative");
  }

  const status = totalWei <= maximumWei ? "COMPLETED" : "REQUIRES_APPROVAL";
  const canonical = `${input.policyVersion}|${input.reportEvidenceHash}|${totalWei}|${maximumWei}|${status}`;

  return {
    status,
    decisionHash: `0x${bytesToHex(sha256(utf8ToBytes(canonical)))}`,
  };
}
