-- ============================================
-- ADESTRAFLOW — MIGRATION 0001: SCHEMA INICIAL
-- ============================================
-- Esta é a versão corrigida do schema (ordem de criação de tabelas ajustada
-- para que dog_media venha depois de sessions, resolvendo o erro de FK
-- fora de ordem da primeira versão). Rode isso no Supabase SQL Editor,
-- ou via `supabase db push` se estiver usando a CLI com migrations.

CREATE TABLE trainers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    business_name   VARCHAR(150),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone_whatsapp  VARCHAR(20) NOT NULL,
    plan            VARCHAR(20) NOT NULL DEFAULT 'trial'
                        CHECK (plan IN ('trial', 'starter', 'pro')),
    trial_ends_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    phone_whatsapp  VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    address_city    VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (trainer_id, phone_whatsapp)
);
CREATE INDEX idx_clients_trainer ON clients(trainer_id);

CREATE TABLE dogs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    breed               VARCHAR(100),
    birth_date          DATE,
    weight_kg           NUMERIC(5,2),
    behavior_tags       TEXT[] DEFAULT '{}',
    behavior_notes      TEXT,
    intake_notes        TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dogs_trainer ON dogs(trainer_id);
CREATE INDEX idx_dogs_client ON dogs(client_id);

CREATE TABLE packages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    dog_id              UUID REFERENCES dogs(id) ON DELETE SET NULL,
    name                VARCHAR(100) NOT NULL,
    total_sessions      INTEGER NOT NULL CHECK (total_sessions > 0),
    sessions_used       INTEGER NOT NULL DEFAULT 0,
    price_cents         INTEGER NOT NULL,
    purchased_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    CHECK (sessions_used <= total_sessions)
);
CREATE INDEX idx_packages_client ON packages(client_id);

CREATE TABLE sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    dog_id              UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    package_id          UUID REFERENCES packages(id) ON DELETE SET NULL,
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INTEGER DEFAULT 60,
    location            VARCHAR(150),
    status              VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    worked_on           TEXT,
    difficulty_level    SMALLINT CHECK (difficulty_level BETWEEN 1 AND 5),
    trainer_notes       TEXT,
    completed_at        TIMESTAMPTZ,
    reminder_sent_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_trainer_date ON sessions(trainer_id, scheduled_at);
CREATE INDEX idx_sessions_dog ON sessions(dog_id);
CREATE INDEX idx_sessions_pending_reminder ON sessions(scheduled_at)
    WHERE reminder_sent_at IS NULL AND status = 'scheduled';

CREATE TABLE dog_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
    storage_url     TEXT NOT NULL,
    media_type      VARCHAR(10) NOT NULL CHECK (media_type IN ('photo', 'video')),
    label           VARCHAR(20) CHECK (label IN ('antes', 'progresso', 'depois')),
    caption         VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_dog ON dog_media(dog_id);

CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    description     TEXT NOT NULL,
    sent_via        VARCHAR(20) CHECK (sent_via IN ('whatsapp', 'pdf', 'email', NULL)),
    sent_at         TIMESTAMPTZ,
    pdf_url         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_session ON tasks(session_id);

CREATE TABLE communication_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
    direction       VARCHAR(10) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    content_body    TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    error_message   TEXT,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comm_logs_trainer ON communication_logs(trainer_id);
