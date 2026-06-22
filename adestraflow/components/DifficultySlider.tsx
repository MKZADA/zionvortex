const LEVEL_COLOR = [
  "", // índice 0 não usado
  "bg-primary-light",
  "bg-primary",
  "bg-accent",
  "bg-accent-dark",
  "bg-warn",
];

export function DifficultySlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (level: number) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-ink-muted">
        Dificuldade do cão na sessão
      </span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            type="button"
            key={level}
            onClick={() => onChange(level)}
            aria-pressed={value === level}
            aria-label={`Dificuldade ${level} de 5`}
            className={`flex h-12 flex-1 items-center justify-center rounded-card font-display text-lg font-semibold
              ${
                value === level
                  ? `${LEVEL_COLOR[level]} text-white`
                  : "border border-line bg-surface text-ink-muted"
              }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
