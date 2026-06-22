import Link from "next/link";
import type { SessionStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Agendada",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não compareceu",
};

const STATUS_COLOR: Record<SessionStatus, string> = {
  scheduled: "text-primary",
  completed: "text-ink-muted",
  cancelled: "text-warn",
  no_show: "text-warn",
};

export function SessionCard({
  id,
  dogName,
  clientName,
  scheduledAt,
  location,
  status,
}: {
  id: string;
  dogName: string;
  clientName: string;
  scheduledAt: string;
  location: string | null;
  status: SessionStatus;
}) {
  const time = new Date(scheduledAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/sessions/${id}`} className="card flex items-center gap-3">
      <div className="flex w-14 shrink-0 flex-col items-center font-mono">
        <span className="text-lg font-medium leading-none text-ink">{time}</span>
      </div>
      <div className="min-w-0 flex-1 border-l border-line pl-3">
        <p className="truncate font-display text-base font-semibold text-ink">
          {dogName}
        </p>
        <p className="truncate text-sm text-ink-muted">{clientName}</p>
        {location && <p className="truncate text-xs text-ink-muted">{location}</p>}
      </div>
      <span className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${STATUS_COLOR[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    </Link>
  );
}
