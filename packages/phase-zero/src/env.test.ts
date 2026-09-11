import { afterEach, describe, expect, it } from "vitest";

import { optionalEnv, requiredEnv } from "./env.js";

const variable = "AGENTDOCK_PHASE_ZERO_TEST";
const original = process.env[variable];

afterEach(() => {
  if (original === undefined) {
    delete process.env[variable];
  } else {
    process.env[variable] = original;
  }
});

describe("environment configuration", () => {
  it("rejects missing required values", () => {
    delete process.env[variable];

    expect(() => requiredEnv(variable)).toThrow(
      `Missing required environment variable: ${variable}`,
    );
  });

  it("trims configured values and falls back when optional values are missing", () => {
    process.env[variable] = " configured ";

    expect(requiredEnv(variable)).toBe("configured");
    expect(optionalEnv("AGENTDOCK_PHASE_ZERO_UNSET", "fallback")).toBe(
      "fallback",
    );
  });
});
