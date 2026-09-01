export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="px-6 md:px-10 pt-8 pb-6 border-b border-line bg-paper-raised">
      <h1 className="text-2xl font-display font-semibold text-ink">{title}</h1>
      {description ? (
        <p className="mt-1.5 text-sm text-ink-soft max-w-2xl">{description}</p>
      ) : null}
    </header>
  );
}
