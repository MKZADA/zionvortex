# AdestraFlow — MVP

CRM mobile-first para adestradores e comportamentalistas caninos autônomos.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend/Banco**: Supabase (Postgres + Auth + Storage)
- **Automações**: n8n self-hosted (lembretes WhatsApp, geração de PDF)
- **Deploy frontend**: Vercel

---

## Setup em 4 passos

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, rode as migrations **em ordem**:
   - `supabase/migrations/0001_init.sql` — cria todas as tabelas
   - `supabase/migrations/0002_rls.sql` — ativa isolamento multi-tenant (**não pule isso**)
3. Em **Project Settings > API**, copie:
   - `Project URL`
   - `anon public key`

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 4. Deploy na Vercel

```bash
# Instale a CLI da Vercel se não tiver
npm i -g vercel

vercel
```

Na Vercel, configure as mesmas variáveis de ambiente do `.env.local` em:
**Project > Settings > Environment Variables**

---

## Estrutura de pastas

```
app/
  (app)/          # Rotas protegidas (requerem login)
    page.tsx        → Agenda do dia
    sessions/       → Listagem e detalhe de sessões (+ diário de bordo)
    clients/        → Cadastro e perfil de clientes (donos)
    dogs/           → Cadastro e perfil de cães (alunos)
  login/            → Tela de login/cadastro
  auth/callback/    → Handler de confirmação de e-mail
components/
  BottomNav.tsx     → Navegação inferior (mobile-first)
  SessionLogForm.tsx → Diário de bordo + gerador de lição de casa
  PackageRope.tsx   → Visualização de pacote como corda com nós
  DifficultySlider.tsx → Seletor de dificuldade 1-5
lib/supabase/
  client.ts         → Cliente browser (Client Components)
  server.ts         → Cliente server (Server Components)
  types.ts          → Tipos TypeScript do banco
supabase/migrations/
  0001_init.sql     → Schema completo
  0002_rls.sql      → Row Level Security (isolamento multi-tenant)
```

---

## Próximos passos após o MVP funcionar

### Tipos gerados (TypeScript mais forte)
Depois de criar o projeto Supabase, substitua os tipos hand-written:
```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > lib/supabase/types.ts
```
E reintroduza `<Database>` nos clientes em `lib/supabase/client.ts` e `server.ts`.

### Trigger Postgres para criar o trainer automaticamente
No Supabase SQL Editor:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.trainers (id, email, name, phone_whatsapp)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### n8n — Lembretes automáticos de WhatsApp
Crie um workflow no n8n com:
1. **Trigger**: Schedule (a cada hora)
2. **Supabase**: `SELECT * FROM sessions WHERE scheduled_at BETWEEN now() + interval '23h' AND now() + interval '25h' AND reminder_sent_at IS NULL AND status = 'scheduled'`
3. **Evolution API**: envia mensagem no WhatsApp do cliente (`clients.phone_whatsapp`)
4. **Supabase**: `UPDATE sessions SET reminder_sent_at = now() WHERE id = :id`

### Pacote de sessões — incremento atômico
Antes de ter múltiplos dispositivos acessando simultaneamente, substitua o update ingênuo no `SessionLogForm` por uma função Postgres:
```sql
CREATE OR REPLACE FUNCTION increment_package_usage(pkg_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE packages
  SET sessions_used = sessions_used + 1,
      status = CASE WHEN sessions_used + 1 >= total_sessions THEN 'completed' ELSE status END
  WHERE id = pkg_id AND sessions_used < total_sessions;
END;
$$ LANGUAGE plpgsql;
```
Chame via `supabase.rpc("increment_package_usage", { pkg_id: packageId })`.
