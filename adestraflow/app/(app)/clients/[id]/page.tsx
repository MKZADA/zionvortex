import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import type { ClientRow, DogRow } from "@/lib/supabase/types";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: clientRaw } = await supabase
    .from("clients")
    .select("id, name, phone_whatsapp, email, address_city, notes")
    .eq("id", params.id)
    .single();

  if (!clientRaw) notFound();
  const client = clientRaw as Pick<ClientRow, "id"|"name"|"phone_whatsapp"|"email"|"address_city"|"notes">;

  const { data: dogsRaw } = await supabase
    .from("dogs")
    .select("id, name, breed, status")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false });

  const dogs = (dogsRaw ?? []) as Pick<DogRow, "id"|"name"|"breed"|"status">[];
  const whatsappLink = `https://wa.me/${client.phone_whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">{client.name}</h1>
        <a href={whatsappLink} target="_blank" className="text-sm text-accent underline">
          {client.phone_whatsapp}
        </a>
        {client.address_city && <p className="text-sm text-ink-muted">{client.address_city}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">Cães</h2>
        <Link href={`/dogs/new?client_id=${client.id}`} className="font-mono text-xs text-accent underline">
          + Cadastrar cão
        </Link>
      </div>

      {!dogs.length && (
        <EmptyState
          title="Nenhum cão cadastrado"
          hint={`Cadastre o primeiro cão de ${client.name} para começar a agendar sessões.`}
        />
      )}

      <div className="flex flex-col gap-2.5">
        {dogs.map((d) => (
          <Link key={d.id} href={`/dogs/${d.id}`} className="card flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-ink">{d.name}</p>
              {d.breed && <p className="text-sm text-ink-muted">{d.breed}</p>}
            </div>
            <StatusBadge status={d.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    active: "Ativo", paused: "Pausado", completed: "Concluído", archived: "Arquivado",
  };
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-primary">
      {label[status] ?? status}
    </span>
  );
}
