import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createServerSupabaseClient();
  const filter = searchParams.status ?? "scheduled";

  let query = supabase
    .from("sessions")
    .select("id, scheduled_at, status, dogs(name, clients(name))")
    .order("scheduled_at", { ascending: filter === "scheduled" });

  if (filter !== "all") query = query.eq("status", filter);

  const { data: sessionsRaw } = await query.limit(50);
  const sessions = (sessionsRaw ?? []) as any[];

  const tabs = [
    { value: "scheduled", label: "Agendadas" },
    { value: "completed", label: "Concluídas" },
    { value: "all",       label: "Todas" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Sessões</h1>

      <div className="flex gap-2 rounded-card bg-line p-1">
        {tabs.map((tab) => (
          <Link key={tab.value} href={`/sessions?status=${tab.value}`}
            className={`flex-1 rounded-[7px] py-1.5 text-center font-mono text-xs font-medium ${
              filter === tab.value ? "bg-surface text-primary shadow-sm" : "text-ink-muted"
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {!sessions.length && (
        <EmptyState
          title="Nenhuma sessão aqui"
          hint="Agende uma sessão pelo perfil do cão."
        />
      )}

      <div className="flex flex-col gap-2.5">
        {sessions.map((s) => {
          const dog = Array.isArray(s.dogs) ? s.dogs[0] : s.dogs;
          const client = dog?.clients ? (Array.isArray(dog.clients) ? dog.clients[0] : dog.clients) : null;
          return (
            <Link key={s.id} href={`/sessions/${s.id}`} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-ink">{dog?.name ?? "—"}</p>
                  <p className="text-sm text-ink-muted">{client?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-ink">
                    {new Date(s.scheduled_at as string).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                  <p className="font-mono text-xs text-ink-muted">
                    {new Date(s.scheduled_at as string).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/sessions/new"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-lg"
        aria-label="Agendar nova sessão">
        +
      </Link>
    </div>
  );
}
