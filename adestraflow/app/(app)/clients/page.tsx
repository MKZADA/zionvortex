import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";

export default async function ClientsPage() {
  const supabase = createServerSupabaseClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, phone_whatsapp, dogs(id)")
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Clientes</h1>
        <Link href="/clients/new" className="font-mono text-xs text-accent underline">
          + Novo
        </Link>
      </div>

      {!clients?.length && (
        <EmptyState
          title="Nenhum cliente ainda"
          hint="Cadastre o dono antes de cadastrar o cão dele."
          action={
            <Link href="/clients/new" className="font-mono text-xs text-accent underline">
              Cadastrar cliente
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-2.5">
        {clients?.map((c: any) => (
          <Link key={c.id} href={`/clients/${c.id}`} className="card flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-ink">{c.name}</p>
              <p className="text-sm text-ink-muted">{c.phone_whatsapp}</p>
            </div>
            <span className="font-mono text-xs text-ink-muted">
              {c.dogs?.length ?? 0} cão(ães)
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
