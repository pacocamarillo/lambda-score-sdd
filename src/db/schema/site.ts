import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "@/db/schema/access";

export type SiteSponsor = {
  id: string;
  name: string;
  siteUrl: string;
  logoDataUrl: string;
};

export const sites = pgTable("site", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  active: boolean("active").notNull().default(false),
  colorPrimary: text("color_primary").notNull().default("#1e4d5c"),
  colorSecondary: text("color_secondary").notNull().default("#5f6b76"),
  colorAccent: text("color_accent").notNull().default("#1d7a46"),
  colorSuccess: text("color_success").notNull().default("#1d7a46"),
  colorWarning: text("color_warning").notNull().default("#7a4e12"),
  coverEnabled: boolean("cover_enabled").notNull().default(true),
  coverImage: text("cover_image"),
  coverTitle: text("cover_title").notNull().default(""),
  coverDescription: text("cover_description").notNull().default(""),
  sponsors: jsonb("sponsors").$type<SiteSponsor[]>().notNull().default([]),
  facebookUrl: text("facebook_url").notNull().default(""),
  xUrl: text("x_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  contactPhone: text("contact_phone").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
