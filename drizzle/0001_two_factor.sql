ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "totp_secret_enc" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "totp_enabled_at" timestamptz;

CREATE TABLE IF NOT EXISTS "backup_code" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "code_hash" text NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "backup_code_user_id" ON "backup_code" ("user_id");
