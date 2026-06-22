"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PackageOption = { id: string; name: string; total_sessions: number; sessions_used: number; };

export function NewSessionForm({ dogId, packages }: { dogId: string | null; packages: PackageOption[]; }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dogId) { setError("Agende a sessão a partir do perfil do cão."); return; }
    setLoading(true); setError(null);
    const form = new FormData(e.currentTarget);
    const scheduledAt = new Date(`${form.get("date")}T${form.get("time")}:00`).toISOString();
    const packageId = (String(form.get("package_id") || "")) || null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessão expirada."); setLoading(false); return; }

    const { data, error } = await supabase.from("sessions").insert({
      trainer_id: user.id,
      dog_id: dogId,
      package_id: packageId,
      scheduled_at: scheduledAt,
      duration_minutes: Number(form.get("duration")) || 60,
      location: (String(form.get("location") || "")) || null,
    } as any).select("id").single();

    if (error) { setError(error.message); setLoading(false); return; }
    router.push(`/sessions/${(data as any).id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data"><input name="date" type="date" required className="input" /></Field>
        <Field label="Horário"><input name="time" type="time" required className="input" /></Field>
      </div>
      <Field label="Duração (min)">
        <input name="duration" type="number" defaultValue={60} min={15} step={15} className="input" />
      </Field>
      <Field label="Local (opcional)">
        <input name="location" className="input" placeholder="Ex: Sítio do cliente" />
      </Field>
      {packages.length > 0 && (
        <Field label="Vincular a um pacote (opcional)">
          <select name="package_id" className="input">
            <option value="">Sessão avulsa</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sessions_used}/{p.total_sessions} usadas)
              </option>
            ))}
          </select>
        </Field>
      )}
      {error && <p role="alert" className="rounded-card bg-warn/10 px-3 py-2 text-sm text-warn">{error}</p>}
      <button type="submit" disabled={loading}
        className="mt-2 rounded-card bg-primary py-3 font-display font-semibold text-white disabled:opacity-60">
        {loading ? "Agendando…" : "Agendar"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
