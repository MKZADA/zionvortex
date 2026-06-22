"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(traduzErro(error.message)); setLoading(false); return; }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(traduzErro(error.message)); setLoading(false); return; }
      if (data.user) {
        // Cria a linha em trainers vinculada ao novo usuário.
        // Em produção: mover para trigger Postgres (auth.users -> trainers).
        await supabase.from("trainers").insert({
          id: data.user.id,
          name,
          email,
          phone_whatsapp: "",
        } as any);
      }
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-2xl font-bold text-primary">AdestraFlow</h1>
        <p className="mb-8 font-mono text-xs uppercase tracking-wide text-ink-muted">
          {mode === "login" ? "Acesse sua conta" : "Criar conta"}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <Field label="Seu nome">
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ex: Carlos Mendes" />
            </Field>
          )}
          <Field label="E-mail">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="voce@email.com" />
          </Field>
          <Field label="Senha">
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </Field>
          {error && <p role="alert" className="rounded-card bg-warn/10 px-3 py-2 text-sm text-warn">{error}</p>}
          <button type="submit" disabled={loading}
            className="mt-2 rounded-card bg-primary py-3 font-display font-semibold text-white disabled:opacity-60">
            {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          className="mt-6 w-full text-center font-body text-sm text-ink-muted underline-offset-2 hover:underline">
          {mode === "login" ? "Ainda não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </div>
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

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered")) return "Esse e-mail já tem conta. Tente entrar.";
  if (msg.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}
