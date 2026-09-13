type TrackCardProps = {
  eyebrow?: string;
  subtitle?: string;
  title: string;
  description: string;
  items?: string[];
  evidence?: string;
  evidenceTx?: string;
  status?: string;
  featured?: boolean;
};

export function TrackCard({
  eyebrow,
  subtitle,
  title,
  description,
  items,
  evidence,
  evidenceTx,
  status,
  featured = false,
}: TrackCardProps) {
  return (
    <article className={`flex h-full flex-col ${featured ? "fr-card-featured" : "fr-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="fr-label">{eyebrow}</p>}
          {subtitle && <p className="fr-micro fr-ink-muted mt-1">{subtitle}</p>}
        </div>
        {status && (
          <span className="fr-status-pill shrink-0">{status}</span>
        )}
      </div>
      <h3 className="fr-headline mt-5">{title}</h3>
      <p className="fr-body fr-ink-muted mt-3">{description}</p>
      {items && items.length > 0 && (
        <ul className="mt-5 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 fr-body-sm fr-ink-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#34d399]" />
              {item}
            </li>
          ))}
        </ul>
      )}
      {evidence && (
        <div className="mt-6 border-t border-[rgba(255,255,255,0.06)] pt-4">
          <p className="fr-micro fr-ink-muted">Evidence</p>
          <p className="fr-micro fr-ink-muted mt-2 break-all">{evidence}</p>
          {evidenceTx && (
            <p className="fr-micro fr-ink-muted mt-2 break-all">{evidenceTx}</p>
          )}
        </div>
      )}
    </article>
  );
}
