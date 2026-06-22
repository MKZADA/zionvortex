import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SessionCard } from "@/components/SessionCard";
import { EmptyState } from "@/components/EmptyState";

export default async function AgendaPage() {
  const supabase = createServerSupabaseClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, scheduled_at, location, status, dogs(name, clients(name))")
    .gte("scheduled_at", startOfDay.toISOString())
    .lte("scheduled_at", endOfDay.toISOString())
    .order("scheduled_at", { ascending: true });

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold capitalize text-ink">
          {hoje}
        </h1>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
          {sessions?.length ?? 0} sessão(ões) hoje
        </p>
      </div>

      {!sessions?.length && (
        <EmptyState
          title="Nada na agenda de hoje"
          hint="Quando você marcar uma sessão, ela aparece aqui ordenada por horário."
          action={
            <Link href="/sessions/new" className="font-mono text-xs text-accent underline">
              Agendar sessão
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-2.5">
        {sessions?.map((s: any) => (
          <SessionCard
            key={s.id}
            id={s.id}
            dogName={s.dogs?.name ?? "Cão"}
            clientName={s.dogs?.clients?.name ?? ""}
            scheduledAt={s.scheduled_at}
            location={s.location}
            status={s.status}
          />
        ))}
      </div>

      <Link
        href="/sessions/new"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full
                   bg-accent text-2xl text-white shadow-lg"
        aria-label="Agendar nova sessão"
      >
        +
      </Link>
    </div>
  );
}
