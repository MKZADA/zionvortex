import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SessionLogForm } from "@/components/SessionLogForm";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: sessionRaw } = await supabase
    .from("sessions")
    .select(`id, scheduled_at, status, worked_on, difficulty_level, trainer_notes, package_id,
       dogs(id, name, clients(id, name, phone_whatsapp))`)
    .eq("id", params.id)
    .single();

  if (!sessionRaw) notFound();
  const session = sessionRaw as any;

  const dog = Array.isArray(session.dogs) ? session.dogs[0] : session.dogs;
  const client = dog?.clients ? (Array.isArray(dog.clients) ? dog.clients[0] : dog.clients) : null;

  const { data: existingTask } = await supabase
    .from("tasks")
    .select("id, description, sent_at, sent_via")
    .eq("session_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const task = existingTask as any;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href={`/dogs/${dog?.id}`} className="font-mono text-xs text-ink-muted underline">
          ← {dog?.name}
        </Link>
        <h1 className="font-display text-xl font-bold text-ink">Diário de bordo</h1>
        <p className="text-sm text-ink-muted">
          {new Date(session.scheduled_at as string).toLocaleString("pt-BR", {
            dateStyle: "long", timeStyle: "short",
          })}
        </p>
      </div>

      <SessionLogForm
        sessionId={session.id}
        packageId={session.package_id}
        dogName={dog?.name ?? ""}
        clientName={client?.name ?? ""}
        clientPhone={client?.phone_whatsapp ?? ""}
        initialWorkedOn={session.worked_on}
        initialDifficulty={session.difficulty_level}
        initialTrainerNotes={session.trainer_notes}
        initialHomework={task?.description ?? null}
        homeworkSentAt={task?.sent_at ?? null}
      />
    </div>
  );
}
