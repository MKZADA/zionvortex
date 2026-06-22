import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewSessionForm } from "@/components/NewSessionForm";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: { dog_id?: string };
}) {
  const dogId = searchParams.dog_id ?? null;
  const supabase = createServerSupabaseClient();

  const { data: packages } = dogId
    ? await supabase
        .from("packages")
        .select("id, name, total_sessions, sessions_used")
        .eq("dog_id", dogId)
        .eq("status", "active")
    : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Agendar sessão</h1>
      <NewSessionForm dogId={dogId} packages={packages ?? []} />
    </div>
  );
}
