"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DifficultySlider } from "@/components/DifficultySlider";

export function SessionLogForm({
  sessionId, packageId, dogName, clientName, clientPhone,
  initialWorkedOn, initialDifficulty, initialTrainerNotes,
  initialHomework, homeworkSentAt,
}: {
  sessionId: string; packageId: string | null; dogName: string;
  clientName: string; clientPhone: string;
  initialWorkedOn: string | null; initialDifficulty: number | null;
  initialTrainerNotes: string | null; initialHomework: string | null;
  homeworkSentAt: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [workedOn, setWorkedOn] = useState(initialWorkedOn ?? "");
  const [difficulty, setDifficulty] = useState<number | null>(initialDifficulty);
  const [trainerNotes, setTrainerNotes] = useState(initialTrainerNotes ?? "");
  const [homework, setHomework] = useState(initialHomework ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState(homeworkSentAt);

  async function handleSave() {
    setSaving(true); setError(null);

    // 1) Atualiza diário de bordo e marca a sessão como concluída
    const { error: sessErr } = await supabase.from("sessions").update({
      worked_on: workedOn, difficulty_level: difficulty,
      trainer_notes: trainerNotes, status: "completed",
      completed_at: new Date().toISOString(),
    } as any).eq("id", sessionId);

    if (sessErr) { setError(sessErr.message); setSaving(false); return; }

    // 2) Upsert da lição de casa
    if (homework.trim()) {
      const { data: existing } = await supabase.from("tasks").select("id").eq("session_id", sessionId).maybeSingle();
      const existingTask = existing as any;
      if (existingTask?.id) {
        await supabase.from("tasks").update({ description: homework } as any).eq("id", existingTask.id);
      } else {
        // Busca dog_id para a task
        const { data: sessData } = await supabase.from("sessions").select("dog_id").eq("id", sessionId).single();
        const sess = sessData as any;
        if (sess?.dog_id) {
          await supabase.from("tasks").insert({
            session_id: sessionId, dog_id: sess.dog_id, description: homework,
          } as any);
        }
      }
    }

    // 3) Decrementa o pacote (não atômico — ok para MVP; use RPC antes de escalar)
    if (packageId) {
      const { data: pkgData } = await supabase.from("packages")
        .select("sessions_used, total_sessions").eq("id", packageId).single();
      const pkg = pkgData as any;
      if (pkg && pkg.sessions_used < pkg.total_sessions) {
        await supabase.from("packages").update({ sessions_used: pkg.sessions_used + 1 } as any).eq("id", packageId);
      }
    }

    setSaving(false); setSaved(true);
    router.refresh();
  }

  const message = buildMessage({ dogName, workedOn, homework });
  const waHref = clientPhone
    ? `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : null;

  async function handleMarkSent() {
    const now = new Date().toISOString();
    const { data: taskData } = await supabase.from("tasks").select("id").eq("session_id", sessionId).maybeSingle();
    const task = taskData as any;
    if (task?.id) {
      await supabase.from("tasks").update({ sent_at: now, sent_via: "whatsapp" } as any).eq("id", task.id);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("communication_logs").insert({
        trainer_id: user.id, type: "whatsapp", direction: "outbound",
        content_body: message, status: "sent",
      } as any);
    }
    setSentAt(now);
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label="O que foi trabalhado">
        <textarea value={workedOn} onChange={(e) => setWorkedOn(e.target.value)}
          className="input min-h-24"
          placeholder="Ex: trabalhamos foco em ambiente com distração, o cão respondeu bem ao comando 'olha'…" />
      </Field>

      <DifficultySlider value={difficulty} onChange={setDifficulty} />

      <Field label="Notas internas (não vão pro dono)">
        <textarea value={trainerNotes} onChange={(e) => setTrainerNotes(e.target.value)}
          className="input min-h-16" placeholder="Observações só suas…" />
      </Field>

      <Field label="Tarefa de casa para o dono">
        <textarea value={homework} onChange={(e) => setHomework(e.target.value)}
          className="input min-h-20"
          placeholder="Ex: praticar 5 min por dia o comando 'senta' antes das refeições…" />
      </Field>

      {error && <p role="alert" className="rounded-card bg-warn/10 px-3 py-2 text-sm text-warn">{error}</p>}

      <button onClick={handleSave} disabled={saving}
        className="rounded-card bg-primary py-3 font-display font-semibold text-white disabled:opacity-60">
        {saving ? "Salvando…" : "Salvar diário de bordo"}
      </button>

      {saved && homework.trim() && (
        <div className="card">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Prévia da mensagem</p>
          <pre className="whitespace-pre-wrap font-body text-sm text-ink">{message}</pre>

          {waHref ? (
            <a href={waHref} target="_blank" onClick={handleMarkSent}
              className="mt-3 flex items-center justify-center gap-2 rounded-card bg-accent py-3 font-display font-semibold text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.131.558 4.13 1.535 5.865L.057 23.99l6.305-1.65A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.999a9.96 9.96 0 01-5.085-1.393l-.364-.217-3.742.981 1-3.643-.237-.375A9.955 9.955 0 012.001 12c0-5.514 4.486-10 9.999-10 5.514 0 10 4.486 10 10 0 5.515-4.486 10-9.999 10z"/>
              </svg>
              Enviar pelo WhatsApp
            </a>
          ) : (
            <p className="mt-3 text-sm text-warn">Esse cliente não tem WhatsApp cadastrado.</p>
          )}

          {sentAt && (
            <p className="mt-2 font-mono text-[11px] text-ink-muted">
              Enviado em {new Date(sentAt).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function buildMessage({ dogName, workedOn, homework }: { dogName: string; workedOn: string; homework: string }) {
  const parts = [`🐾 *Resumo da sessão — ${dogName}*`];
  if (workedOn.trim()) parts.push(`\n*O que trabalhamos hoje:*\n${workedOn.trim()}`);
  if (homework.trim()) parts.push(`\n*Tarefa de casa até a próxima sessão:*\n${homework.trim()}`);
  parts.push(`\nQualquer dúvida, me chama por aqui! 🐶`);
  return parts.join("\n");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
