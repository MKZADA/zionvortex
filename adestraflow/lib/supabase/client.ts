import { createBrowserClient } from "@supabase/ssr";

// Sem genérico <Database> — Supabase só infere tipos corretamente
// com tipos gerados por `supabase gen types`. Usamos cast explícito
// nos pontos de uso. Quando o projeto Supabase estiver criado, rode:
//   npx supabase gen types typescript --project-id ID > lib/supabase/types.ts
// e reintroduza o genérico aqui.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
