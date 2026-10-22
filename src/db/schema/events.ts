import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./access";

export const events = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  venue: text("venue").notNull(),
  description: text("description").notNull().default(""),
  noticeHtml: text("notice_html"),
  status: text("status").notNull().default("draft"),
  registrationOpen: boolean("registration_open").notNull().default(false),
  registrationDeadline: timestamp("registration_deadline", { withTimezone: true }),
  isFree: boolean("is_free").notNull().default(false),
  imageKey: text("image_key"),
  thumbnailKey: text("thumbnail_key"),
  bibScope: text("bib_scope").notNull().default("competition"),
  bibStart: integer("bib_start").notNull().default(1),
  bibPrefix: text("bib_prefix").notNull().default(""),
  autoAssignBib: boolean("auto_assign_bib").notNull().default(true),
  showBibOnConfirmation: boolean("show_bib_on_confirmation").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const competitions = pgTable("competition", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }),
  priceCents: integer("price_cents").notNull().default(0),
  capacity: integer("capacity"),
  mode: text("mode").notNull().default("individual"),
  teamMinSize: integer("team_min_size"),
  teamNameRequired: boolean("team_name_required").notNull().default(false),
  priceMode: text("price_mode").notNull().default("per_person"),
  includedItems: text("included_items"),
  bibColor: text("bib_color"),
  cashOnEvent: boolean("cash_on_event").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("team", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitions.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const registrations = pgTable(
  "registration",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id),
    teamId: uuid("team_id").references(() => teams.id),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    birthDate: timestamp("birth_date", { withTimezone: true }).notNull(),
    documentType: text("document_type").notNull(),
    documentNumber: text("document_number").notNull(),
    status: text("status").notNull().default("pending_payment"),
    origin: text("origin").notNull().default("public"),
    bib: text("bib"),
    answers: jsonb("answers").$type<Record<string, unknown>>().notNull().default({}),
    acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
    acceptedWaiverAt: timestamp("accepted_waiver_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("registration_competition_bib").on(table.competitionId, table.bib)],
);

export const formFields = pgTable("form_field", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull(),
  required: boolean("required").notNull().default(false),
  uniqueInEvent: boolean("unique_in_event").notNull().default(false),
  options: jsonb("options").$type<string[]>().notNull().default([]),
  competitionIds: jsonb("competition_ids").$type<string[] | null>(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const addOns = pgTable("add_on", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  options: jsonb("options").$type<string[]>().notNull().default([]),
  priceCents: integer("price_cents").notNull().default(0),
  stock: integer("stock"),
  required: boolean("required").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  includedInCompetition: boolean("included_in_competition").notNull().default(false),
  competitionIds: jsonb("competition_ids").$type<string[] | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const registrationAddOns = pgTable("registration_add_on", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id")
    .notNull()
    .references(() => registrations.id, { onDelete: "cascade" }),
  addOnId: uuid("add_on_id")
    .notNull()
    .references(() => addOns.id),
  option: text("option"),
  priceCents: integer("price_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
