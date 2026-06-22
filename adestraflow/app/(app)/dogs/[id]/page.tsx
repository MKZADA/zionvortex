import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PackageRope } from "@/components/PackageRope";
import { EmptyState } from "@/components/EmptyState";

export default async function DogDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: dogRaw } = await supabase
    .from("dogs")
    .select("id, name, breed, birth_date, behavior_tags, intake_notes, clients(id, name)")
    .eq("id", params.id)
    .single();

  if (!dogRaw) notFound();
  const dog = dogRaw as any;

  const { data: activePackage } = await supabase
    .from("packages")
    .select("id, name, total_sessions, sessions_used")
    .eq("dog_id", params.id)
    .eq("status", "active")
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: sessionsRaw } = await supabase
    .from("sessions")
    .select("id, scheduled_at, status, difficulty_level, worked_on")
    .eq("dog_id", params.id)
    .order("scheduled_at", { ascending: false })
    .limit(10);

  const sessions = (sessionsRaw ?? []) as any[];
  const pkg = activePackage as any;
  const client = dog.clients ? (Array.isArray(dog.clients) ? dog.clients[0] : dog.clients) : null;
  const age = dog.birth_date ? calcAge(dog.birth_date as string) : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">{dog.name}</h1>
        <p className="text-sm text-ink-muted">{[dog.breed, age].filter(Boolean).join(" · ")}</p>
        {client && (
          <Link href={`/clients/${client.id}`} className="text-sm text-accent underline">{client.name}</Link>
        )}
      </div>

      {!!dog.behavior_tags?.length && (
        <div className="flex flex-wrap gap-1.5">
          {(dog.behavior_tags as string[]).map((tag) => (
            <span key={tag} className="rounded-full bg-rope/10 px-2.5 py-1 font-mono text-[10px] text-rope">{tag}</span>
          ))}
        </div>
      )}

      {pkg ? (
        <PackageRope total={pkg.total_sessions} used={pkg.sessions_used} label={pkg.name} />
      ) : (
        <EmptyState title="Sem pacote ativo" hint="Esse cão está sem pacote de sessões vinculado no momento." />
      )}

      {dog.intake_notes && (
        <div className="card">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Histórico relatado</p>
          <p className="text-sm text-ink">{dog.intake_notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Sessões</h2>
        <Link href={`/sessions/new?dog_id=${dog.id}`} className="font-mono text-xs text-accent underline">+ Agendar</Link>
      </div>

      {!sessions.length && (
        <EmptyState title="Nenhuma sessão ainda" hint="O diário de bordo aparece aqui depois da primeira sessão." />
      )}

      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <Link key={s.id} href={`/sessions/${s.id}`} className="card">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-ink-muted">
                {new Date(s.scheduled_at as string).toLocaleDateString("pt-BR")}
              </p>
              {s.difficulty_level && (
                <span className="font-mono text-xs text-ink-muted">dificuldade {s.difficulty_level}/5</span>
              )}
            </div>
            {s.worked_on && <p className="mt-1 line-clamp-2 text-sm text-ink">{s.worked_on}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function calcAge(birthDate: string): string {
  const months = (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 12) return `${Math.round(months)} meses`;
  return `${Math.floor(months / 12)} anos`;
}
