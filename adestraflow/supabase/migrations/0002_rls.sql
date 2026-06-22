-- ============================================
-- MIGRATION 0002: ROW LEVEL SECURITY (RLS)
-- ============================================
-- ATENÇÃO: rode DEPOIS de 0001_init.sql.
-- Sem isso o Supabase retorna dados de TODOS os adestradores
-- para qualquer usuário autenticado. Isso é uma brecha de segurança
-- crítica — não entre em produção sem essa migration aplicada.
--
-- Lógica: cada adestrador só acessa suas próprias linhas.
-- A coluna trainer_id é comparada com auth.uid() (o ID do usuário autenticado).

-- Ativa RLS em todas as tabelas
ALTER TABLE trainers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- trainers: cada usuário só vê e edita o próprio perfil
CREATE POLICY "trainers: dono lê" ON trainers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "trainers: dono edita" ON trainers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "trainers: inserção própria" ON trainers FOR INSERT WITH CHECK (auth.uid() = id);

-- clients
CREATE POLICY "clients: dono lê" ON clients FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "clients: dono insere" ON clients FOR INSERT WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "clients: dono edita" ON clients FOR UPDATE USING (trainer_id = auth.uid());
CREATE POLICY "clients: dono deleta" ON clients FOR DELETE USING (trainer_id = auth.uid());

-- dogs
CREATE POLICY "dogs: dono lê" ON dogs FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "dogs: dono insere" ON dogs FOR INSERT WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "dogs: dono edita" ON dogs FOR UPDATE USING (trainer_id = auth.uid());
CREATE POLICY "dogs: dono deleta" ON dogs FOR DELETE USING (trainer_id = auth.uid());

-- packages
CREATE POLICY "packages: dono lê" ON packages FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "packages: dono insere" ON packages FOR INSERT WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "packages: dono edita" ON packages FOR UPDATE USING (trainer_id = auth.uid());
CREATE POLICY "packages: dono deleta" ON packages FOR DELETE USING (trainer_id = auth.uid());

-- sessions
CREATE POLICY "sessions: dono lê" ON sessions FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "sessions: dono insere" ON sessions FOR INSERT WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "sessions: dono edita" ON sessions FOR UPDATE USING (trainer_id = auth.uid());
CREATE POLICY "sessions: dono deleta" ON sessions FOR DELETE USING (trainer_id = auth.uid());

-- dog_media: sem trainer_id direto — acesso via dog (que tem trainer_id)
CREATE POLICY "dog_media: dono lê" ON dog_media FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_media.dog_id AND dogs.trainer_id = auth.uid()));
CREATE POLICY "dog_media: dono insere" ON dog_media FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_media.dog_id AND dogs.trainer_id = auth.uid()));
CREATE POLICY "dog_media: dono deleta" ON dog_media FOR DELETE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_media.dog_id AND dogs.trainer_id = auth.uid()));

-- tasks: sem trainer_id direto — acesso via session
CREATE POLICY "tasks: dono lê" ON tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = tasks.session_id AND sessions.trainer_id = auth.uid()));
CREATE POLICY "tasks: dono insere" ON tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = tasks.session_id AND sessions.trainer_id = auth.uid()));
CREATE POLICY "tasks: dono edita" ON tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = tasks.session_id AND sessions.trainer_id = auth.uid()));

-- communication_logs
CREATE POLICY "comm_logs: dono lê" ON communication_logs FOR SELECT USING (trainer_id = auth.uid());
CREATE POLICY "comm_logs: dono insere" ON communication_logs FOR INSERT WITH CHECK (trainer_id = auth.uid());
