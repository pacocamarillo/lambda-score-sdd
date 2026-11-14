ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "nav_profile" text NOT NULL DEFAULT 'full';
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "parent_organization_id" uuid;

CREATE TABLE IF NOT EXISTS "news_post" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organization"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "excerpt" text NOT NULL DEFAULT '',
  "content_html" text NOT NULL DEFAULT '',
  "image_data_url" text,
  "status" text NOT NULL DEFAULT 'draft',
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE "news_post" ADD CONSTRAINT "news_post_org_slug" UNIQUE ("organization_id", "slug");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
