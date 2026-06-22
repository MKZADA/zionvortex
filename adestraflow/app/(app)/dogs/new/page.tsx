"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SUGGESTED_TAGS = ["reativo", "ansioso", "medo de barulho", "puxa na guia", "filhote", "resgate"];

export default function NewDogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");
  const supabase = createClient();
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clientId) { setError("Cadastre o cão a partir do perfil do dono."); return; }
    setLoading(true); setError(null);
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessão expirada."); setLoading(false); return; }

    const { data, error } = await supabase.from("dogs").insert({
      trainer_id: user.id,
      client_id: clientId,
      name: String(form.get("name")),
      breed: (String(form.get("breed") || "")) || null,
      birth_date: (String(form.get("birth_date") || "")) || null,
      behavior_tags: tags,
      intake_notes: (String(form.get("intake_notes") || "")) || null,
    } as any).select("id").single();

    if (error) { setError(error.message); setLoading(false); return; }
    router.push(`/dogs/${(data as any).id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Novo cão</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome do cão"><input name="name" required className="input" placeholder="Ex: Thor" /></Field>
        <Field label="Raça (opcional)"><input name="breed" className="input" placeholder="SRD, Labrador…" /></Field>
        <Field label="Data de nascimento (opcional)"><input name="birth_date" type="date" className="input" /></Field>
        <div>
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-ink-muted">Comportamento</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => (
              <button type="button" key={tag} onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
                  tags.includes(tag) ? "border-rope bg-rope text-white" : "border-line bg-surface text-ink-muted"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        <Field label="Histórico relatado pelo dono (opcional)">
          <textarea name="intake_notes" className="input min-h-24" placeholder="O que o dono contou na primeira conversa…" />
        </Field>
        {error && <p role="alert" className="rounded-card bg-warn/10 px-3 py-2 text-sm text-warn">{error}</p>}
        <button type="submit" disabled={loading}
          className="mt-2 rounded-card bg-primary py-3 font-display font-semibold text-white disabled:opacity-60">
          {loading ? "Salvando…" : "Salvar cão"}
        </button>
      </form>
    </div>
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
