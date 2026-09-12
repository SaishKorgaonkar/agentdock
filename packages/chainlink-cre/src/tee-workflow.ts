import {
  CronCapability,
  handlerInTee,
  Runner,
  type TeeRuntime,
} from "@chainlink/cre-sdk";

import { evaluatePrivatePolicy, type PrivatePolicyDecision } from "./policy.js";

export type AgentDockTeeConfig = Readonly<{
  schedule: string;
  policyVersion: string;
  reportEvidenceHash: string;
  totalWei: string;
  maximumWei: string;
}>;

export function evaluatePolicyInTee(
  runtime: TeeRuntime<AgentDockTeeConfig>,
): PrivatePolicyDecision {
  const decision = evaluatePrivatePolicy({
    policyVersion: runtime.config.policyVersion,
    reportEvidenceHash: runtime.config.reportEvidenceHash,
    totalWei: runtime.config.totalWei,
    maximumWei: runtime.config.maximumWei,
  });

  runtime.log(`AgentDock confidential policy decision: ${decision.status}`);
  return decision;
}

export function initAgentDockTeeWorkflow(config: AgentDockTeeConfig) {
  const cron = new CronCapability();

  return [
    handlerInTee(
      cron.trigger({ schedule: config.schedule }),
      evaluatePolicyInTee,
      [{ tee: "nitro", regions: ["us-west-2"] }],
    ),
  ];
}

export async function runAgentDockTeeWorkflow() {
  const runner = await Runner.newRunner<AgentDockTeeConfig>();
  await runner.run(initAgentDockTeeWorkflow);
}
