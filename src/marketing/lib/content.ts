export type ServiceId =
  | "asesoria"
  | "cronometraje"
  | "arco"
  | "vallas"
  | "marketing";

export type EventType =
  | "running"
  | "mtb"
  | "triathlon"
  | "swim"
  | "other";

export type RentalScenario = "meta" | "flujo" | "premiacion" | "otro";

export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SiteConfig {
  name: string;
  legalName: string;
  url: string;
  phone: string;
  phoneDisplay: string;
  marketingPhone: string;
  marketingPhoneDisplay: string;
  email: string;
  whatsapp: string;
  whatsappUrl: string;
  social: { label: string; href: string }[];
  navGroups: NavGroup[];
  companyLink: NavItem;
  cta: NavItem;
}

export interface Service {
  id: ServiceId;
  name: string;
  summary: string;
  quotable: boolean;
}

export interface RentalItem {
  name: string;
  priceFrom?: number;
  scenario: RentalScenario;
  pagePath: string;
}

export interface Event {
  slug: string;
  name: string;
  startsAt: string;
  place: string;
  image: string;
  imageAlt: string;
  registrationUrl: string;
  summary: string;
}

export interface Lap {
  index: number;
  time: string;
  place: number;
  cumulativeTime: string;
  cumulativePlace: number;
}

export interface ResultRow {
  place: number;
  bib: string;
  name: string;
  time: string;
  gap: string;
  laps: Lap[];
}

export interface ResultSet {
  year: number;
  eventName: string;
  eventDate: string;
  distance: string;
  rows: ResultRow[];
}

export interface Post {
  slug: string;
  title: string;
  cardTitle: string;
  publishedAt: string;
  excerpt: string;
  description: string;
  image: string;
  imageAlt: string;
  body: string;
}

export interface QuoteRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailConfirm: string;
  firstRace: boolean;
  eventType: EventType;
  services: ServiceId[];
  street: string;
  city: string;
  state: string;
  postalCode: string;
  tentativeDate?: string;
  estimatedParticipants?: number;
  message?: string;
}

export interface SurveyResponse {
  organizer: string;
  eventName: string;
  eventDate: string;
  scores: number[];
  comment?: string;
}

export function eventStatus(
  startsAt: string,
  now = new Date(),
): "upcoming" | "past" {
  const start = new Date(startsAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  return eventDay >= today ? "upcoming" : "past";
}

export function upcomingEvents(events: Event[], limit = 3): Event[] {
  return events
    .filter((event) => eventStatus(event.startsAt) === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, limit);
}
