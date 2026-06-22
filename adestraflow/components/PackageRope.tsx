// Elemento de assinatura do produto: o pacote de sessões é mostrado como
// uma corda com um nó por sessão — nós preenchidos são sessões já dadas,
// nós vazios são sessões restantes. É a metáfora mais próxima do objeto
// físico que todo adestrador usa todo dia (a guia), em vez de uma barra
// de progresso genérica de SaaS.
export function PackageRope({
  total,
  used,
  label,
}: {
  total: number;
  used: number;
  label: string;
}) {
  const knots = Array.from({ length: total }, (_, i) => i < used);
  const remaining = total - used;
  const width = Math.max(total * 28 + 16, 60);

  return (
    <div className="card">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-display text-sm font-semibold text-ink">{label}</p>
        <p className="font-mono text-xs text-ink-muted">
          {used}/{total} sessões
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} 32`}
        className="w-full"
        role="img"
        aria-label={`${used} de ${total} sessões usadas, ${remaining} restantes`}
      >
        <path
          d={`M 14 16 Q ${width / 2} 28, ${width - 14} 16`}
          stroke="#C9B391"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {knots.map((filled, i) => {
          const t = total === 1 ? 0.5 : i / (total - 1);
          const x = 14 + t * (width - 28);
          // aproxima a curva da corda (mesma equação do path acima)
          const y = 16 + Math.sin(Math.PI * t) * 6;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={filled ? 6 : 5.5}
              fill={filled ? "#8B6B43" : "#FFFFFF"}
              stroke={filled ? "#8B6B43" : "#C9B391"}
              strokeWidth={filled ? 0 : 2}
            />
          );
        })}
      </svg>

      {remaining <= 1 && remaining > 0 && (
        <p className="mt-2 font-mono text-[11px] text-warn">
          Última sessão do pacote — bom momento pra oferecer renovação.
        </p>
      )}
      {remaining === 0 && (
        <p className="mt-2 font-mono text-[11px] text-warn">
          Pacote esgotado.
        </p>
      )}
    </div>
  );
}
