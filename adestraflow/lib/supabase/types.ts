// Tipos escritos à mão para espelhar o schema SQL.
// Quando o projeto Supabase existir, substitua por:
//   npx supabase gen types typescript --project-id SEU_ID > lib/supabase/types.ts

export type TrainerPlan   = "trial" | "starter" | "pro";
export type DogStatus     = "active" | "paused" | "completed" | "archived";
export type PackageStatus = "active" | "completed" | "expired" | "cancelled";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type MediaType     = "photo" | "video";
export type MediaLabel    = "antes" | "progresso" | "depois";
export type SentVia       = "whatsapp" | "pdf" | "email";
export type CommType      = "whatsapp" | "email" | "sms";
export type CommDirection = "outbound" | "inbound";
export type CommStatus    = "sent" | "delivered" | "read" | "failed";

// ----- Row types (retorno do SELECT) -----

export interface TrainerRow {
  id: string; name: string; business_name: string | null;
  email: string; phone_whatsapp: string; plan: TrainerPlan;
  trial_ends_at: string | null; created_at: string; updated_at: string;
}
export interface ClientRow {
  id: string; trainer_id: string; name: string; phone_whatsapp: string;
  email: string | null; address_city: string | null; notes: string | null;
  created_at: string;
}
export interface DogRow {
  id: string; client_id: string; trainer_id: string; name: string;
  breed: string | null; birth_date: string | null; weight_kg: number | null;
  behavior_tags: string[]; behavior_notes: string | null; intake_notes: string | null;
  status: DogStatus; created_at: string;
}
export interface PackageRow {
  id: string; trainer_id: string; client_id: string; dog_id: string | null;
  name: string; total_sessions: number; sessions_used: number;
  price_cents: number; purchased_at: string; expires_at: string | null;
  status: PackageStatus;
}
export interface SessionRow {
  id: string; trainer_id: string; dog_id: string; package_id: string | null;
  scheduled_at: string; duration_minutes: number; location: string | null;
  status: SessionStatus; worked_on: string | null; difficulty_level: number | null;
  trainer_notes: string | null; completed_at: string | null;
  reminder_sent_at: string | null; created_at: string;
}
export interface DogMediaRow {
  id: string; dog_id: string; session_id: string | null; storage_url: string;
  media_type: MediaType; label: MediaLabel | null; caption: string | null;
  created_at: string;
}
export interface TaskRow {
  id: string; session_id: string; dog_id: string; description: string;
  sent_via: SentVia | null; sent_at: string | null; pdf_url: string | null;
  created_at: string;
}
export interface CommunicationLogRow {
  id: string; trainer_id: string; client_id: string | null;
  type: CommType; direction: CommDirection; content_body: string | null;
  status: CommStatus; error_message: string | null; sent_at: string;
}

// ----- Insert types -----

export type TrainerInsert   = Partial<TrainerRow>   & Pick<TrainerRow, "name"|"email"|"phone_whatsapp">;
export type ClientInsert    = Partial<ClientRow>    & Pick<ClientRow,  "trainer_id"|"name"|"phone_whatsapp">;
export type DogInsert       = Partial<DogRow>       & Pick<DogRow,    "client_id"|"trainer_id"|"name">;
export type PackageInsert   = Partial<PackageRow>   & Pick<PackageRow,"trainer_id"|"client_id"|"name"|"total_sessions"|"price_cents">;
export type SessionInsert   = Partial<SessionRow>   & Pick<SessionRow,"trainer_id"|"dog_id"|"scheduled_at">;
export type DogMediaInsert  = Partial<DogMediaRow>  & Pick<DogMediaRow,"dog_id"|"storage_url"|"media_type">;
export type TaskInsert      = Partial<TaskRow>      & Pick<TaskRow,   "session_id"|"dog_id"|"description">;
export type CommLogInsert   = Partial<CommunicationLogRow> & Pick<CommunicationLogRow,"trainer_id"|"type"|"direction">;

// ----- Database shape que o Supabase client genérico espera -----

export interface Database {
  public: {
    Tables: {
      trainers:            { Row: TrainerRow;           Insert: TrainerInsert;   Update: Partial<TrainerRow>;           };
      clients:             { Row: ClientRow;            Insert: ClientInsert;    Update: Partial<ClientRow>;            };
      dogs:                { Row: DogRow;               Insert: DogInsert;       Update: Partial<DogRow>;               };
      packages:            { Row: PackageRow;           Insert: PackageInsert;   Update: Partial<PackageRow>;           };
      sessions:            { Row: SessionRow;           Insert: SessionInsert;   Update: Partial<SessionRow>;           };
      dog_media:           { Row: DogMediaRow;          Insert: DogMediaInsert;  Update: Partial<DogMediaRow>;          };
      tasks:               { Row: TaskRow;              Insert: TaskInsert;      Update: Partial<TaskRow>;              };
      communication_logs:  { Row: CommunicationLogRow;  Insert: CommLogInsert;   Update: Partial<CommunicationLogRow>;  };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}

// Aliases convenientes
export type Trainer          = TrainerRow;
export type Client           = ClientRow;
export type Dog              = DogRow;
export type Package          = PackageRow;
export type Session          = SessionRow;
export type DogMedia         = DogMediaRow;
export type Task             = TaskRow;
export type CommunicationLog = CommunicationLogRow;
