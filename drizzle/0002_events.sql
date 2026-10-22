CREATE TABLE "event" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "name" text NOT NULL,
  "event_date" timestamptz NOT NULL,
  "venue" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "notice_html" text,
  "status" text NOT NULL DEFAULT 'draft',
  "registration_open" boolean NOT NULL DEFAULT false,
  "registration_deadline" timestamptz,
  "is_free" boolean NOT NULL DEFAULT false,
  "image_key" text,
  "thumbnail_key" text,
  "bib_scope" text NOT NULL DEFAULT 'competition',
  "bib_start" integer NOT NULL DEFAULT 1,
  "bib_prefix" text NOT NULL DEFAULT '',
  "auto_assign_bib" boolean NOT NULL DEFAULT true,
  "show_bib_on_confirmation" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "competition" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "event"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "start_time" timestamptz,
  "price_cents" integer NOT NULL DEFAULT 0,
  "capacity" integer,
  "mode" text NOT NULL DEFAULT 'individual',
  "team_min_size" integer,
  "team_name_required" boolean NOT NULL DEFAULT false,
  "price_mode" text NOT NULL DEFAULT 'per_person',
  "included_items" text,
  "bib_color" text,
  "cash_on_event" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "team" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "competition_id" uuid NOT NULL REFERENCES "competition"("id") ON DELETE CASCADE,
  "name" text NOT NULL DEFAULT '',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "registration" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "competition_id" uuid NOT NULL REFERENCES "competition"("id"),
  "team_id" uuid REFERENCES "team"("id"),
  "email" text NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "birth_date" timestamptz NOT NULL,
  "document_type" text NOT NULL,
  "document_number" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending_payment',
  "origin" text NOT NULL DEFAULT 'public',
  "bib" text,
  "answers" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "accepted_terms_at" timestamptz,
  "accepted_waiver_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "registration_competition_bib" UNIQUE ("competition_id", "bib")
);

CREATE TABLE "form_field" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "event"("id") ON DELETE CASCADE,
  "label" text NOT NULL,
  "field_type" text NOT NULL,
  "required" boolean NOT NULL DEFAULT false,
  "unique_in_event" boolean NOT NULL DEFAULT false,
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "competition_ids" jsonb,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "add_on" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "event"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "price_cents" integer NOT NULL DEFAULT 0,
  "stock" integer,
  "required" boolean NOT NULL DEFAULT false,
  "visible" boolean NOT NULL DEFAULT true,
  "included_in_competition" boolean NOT NULL DEFAULT false,
  "competition_ids" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "registration_add_on" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "registration_id" uuid NOT NULL REFERENCES "registration"("id") ON DELETE CASCADE,
  "add_on_id" uuid NOT NULL REFERENCES "add_on"("id"),
  "option" text,
  "price_cents" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "event_organization_id" ON "event" ("organization_id");
CREATE INDEX "competition_event_id" ON "competition" ("event_id");
CREATE INDEX "registration_competition_id" ON "registration" ("competition_id");
CREATE INDEX "registration_status" ON "registration" ("status");
