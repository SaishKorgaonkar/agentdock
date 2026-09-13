import Link from "next/link";

type FlowStepProps = {
  index: number;
  phase: string;
  title: string;
  detail: string;
  proof?: string;
  link?: { href: string; label: string };
  featured?: boolean;
};

export function FlowStep({
  index,
  phase,
  title,
  detail,
  proof,
  link,
  featured = false,
}: FlowStepProps) {
  return (
    <article className={featured ? "fr-card-featured" : "fr-card"}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-5">
          <span className="fr-caption fr-ink-muted">0{index}</span>
          <div>
            <p className="fr-label">{phase}</p>
            <h3 className="fr-headline mt-2">{title}</h3>
            <p className="fr-body fr-ink-muted mt-3 max-w-2xl">{detail}</p>
            {proof && <p className="fr-micro fr-ink-muted mt-3">{proof}</p>}
          </div>
        </div>
        {link && (
          <Link href={link.href} className="fr-link fr-body-sm shrink-0 lg:mt-6">
            {link.label} →
          </Link>
        )}
      </div>
    </article>
  );
}
