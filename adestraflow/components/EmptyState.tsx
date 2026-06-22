export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      <p className="max-w-[28ch] text-sm text-ink-muted">{hint}</p>
      {action}
    </div>
  );
}
