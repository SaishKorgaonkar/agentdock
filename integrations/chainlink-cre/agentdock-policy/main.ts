import {
  CronCapability,
  handlerInTee,
  Runner,
  type TeeRuntime,
} from "@chainlink/cre-sdk";
import { evaluatePrivatePolicy } from "@agentdock/domain";

export type Config = {
  schedule: string;
  policyVersion: string;
  reportEvidenceHash: string;
  totalWei: string;
  maximumWei: string;
};

export const onCronTrigger = (runtime: TeeRuntime<Config>) => {
  const decision = evaluatePrivatePolicy(runtime.config);
  runtime.log(`AgentDock confidential policy decision: ${decision.status}`);
  runtime.log(`AgentDock decision hash: ${decision.decisionHash}`);
  return decision;
};

export const initWorkflow = (config: Config) => {
  const cron = new CronCapability();
  return [
    handlerInTee(cron.trigger({ schedule: config.schedule }), onCronTrigger, [
      { tee: "nitro", regions: ["us-west-2"] },
    ]),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
