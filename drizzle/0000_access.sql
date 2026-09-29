CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "password_hash" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "organization" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "subdomain" text NOT NULL UNIQUE,
  "country" text NOT NULL DEFAULT 'MX',
  "currency" text NOT NULL DEFAULT 'MXN',
  "custom_domain" text,
  "description" text,
  "advanced_roles_enabled" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "membership" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "user"("id"),
  "organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "role" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "membership_user_org" UNIQUE ("user_id", "organization_id")
);

CREATE TABLE "session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "user"("id"),
  "membership_id" uuid REFERENCES "membership"("id"),
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "invitation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "email" text NOT NULL,
  "role" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "access_token" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "purpose" text NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "user_id" uuid REFERENCES "user"("id"),
  "organization_id" uuid REFERENCES "organization"("id"),
  "invitation_id" uuid REFERENCES "invitation"("id"),
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "staff_assignment" (
  "membership_id" uuid PRIMARY KEY REFERENCES "membership"("id"),
  "mode" text NOT NULL
);

CREATE TABLE "event_permission" (
  "membership_id" uuid NOT NULL REFERENCES "membership"("id"),
  "event_id" uuid NOT NULL,
  "level" text NOT NULL,
  "excluded" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("membership_id", "event_id")
);
