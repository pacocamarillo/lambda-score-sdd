CREATE TABLE "coupon" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "code" text NOT NULL,
  "discount_type" text NOT NULL,
  "percent" integer,
  "amount_cents" integer,
  "description" text NOT NULL DEFAULT '',
  "applies_to_registration" boolean NOT NULL DEFAULT false,
  "applies_to_add_ons" boolean NOT NULL DEFAULT false,
  "all_events" boolean NOT NULL DEFAULT false,
  "event_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "include_future_competitions" boolean NOT NULL DEFAULT false,
  "usage_limit" integer,
  "expires_at" timestamptz,
  "use_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "coupon_organization_code" UNIQUE ("organization_id", "code")
);
