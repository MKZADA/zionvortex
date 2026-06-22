"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessão expirada."); setLoading(false); return; }

    const { data, error } = await supabase.from("clients").insert({
      trainer_id: user.id,
      name: String(form.get("name")),
      phone_whatsapp: String(form.get("phone")),
      email: (String(form.get("email") || "")) || null,
      address_city: (String(form.get("city") || "")) || null,
    } as any).select("id").single();

    if (error) {
      setError(error.message.includes("duplicate") ? "Já existe um cliente com esse WhatsApp." : error.message);
      setLoading(false); return;
    }
    router.push(`/clients/${(data as any).id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Novo cliente</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome"><input name="name" required className="input" placeholder="Ex: Mariana Lopes" /></Field>
        <Field label="WhatsApp (com DDD)">
          <input name="phone" required className="input" placeholder="+5527999999999" pattern="\+?[0-9]{10,15}" />
        </Field>
        <Field label="E-mail (opcional)"><input name="email" type="email" className="input" placeholder="email@exemplo.com" /></Field>
        <Field label="Cidade (opcional)"><input name="city" className="input" placeholder="Vitória" /></Field>
        {error && <p role="alert" className="rounded-card bg-warn/10 px-3 py-2 text-sm text-warn">{error}</p>}
        <button type="submit" disabled={loading}
          className="mt-2 rounded-card bg-primary py-3 font-display font-semibold text-white disabled:opacity-60">
          {loading ? "Salvando…" : "Salvar cliente"}
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
