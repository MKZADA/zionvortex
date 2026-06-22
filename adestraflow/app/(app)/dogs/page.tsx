import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";

export default async function DogsPage() {
  const supabase = createServerSupabaseClient();
  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed, behavior_tags, status, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Cães</h1>

      {!dogs?.length && (
        <EmptyState
          title="Nenhum cão cadastrado"
          hint="Cães são cadastrados a partir do perfil do cliente (dono)."
          action={
            <Link href="/clients" className="font-mono text-xs text-accent underline">
              Ir para clientes
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-2.5">
        {dogs?.map((d: any) => (
          <Link key={d.id} href={`/dogs/${d.id}`} className="card">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold text-ink">{d.name}</p>
              <span className="text-xs text-ink-muted">{d.clients?.name}</span>
            </div>
            {d.breed && <p className="text-sm text-ink-muted">{d.breed}</p>}
            {!!d.behavior_tags?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.behavior_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-rope/10 px-2 py-0.5 font-mono text-[10px] text-rope"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
