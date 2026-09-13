import { PageShell } from "../_components/site-chrome";
import { PageHero } from "../_components/ui/page-hero";
import { PageSection } from "../_components/ui/page-section";
import WorkflowConsole from "./workflow-console";

export default function WorkflowPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          label="Workflow launcher"
          title="Start a governed execution"
          description="Create a draft, select a paid agent service, then attach ENS authority before any payment can occur."
        />

        <PageSection bordered={false}>
          <WorkflowConsole />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["ENS authority", "Hedera x402", "CRE policy", "Sepolia receipt"].map((item, index) => (
              <article key={item} className="fr-use-case">
                <p className="fr-label !text-[10px]">0{index + 1}</p>
                <h3 className="mt-3">{item}</h3>
              </article>
            ))}
          </div>
        </PageSection>
      </main>
    </PageShell>
  );
}
