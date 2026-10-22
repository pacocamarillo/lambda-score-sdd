export type EventStatus = "draft" | "published" | "cancelled";
export type RegistrationStatus = "pending_payment" | "confirmed" | "cancelled";
export type DocumentType = "ine" | "curp" | "rfc" | "other";
export type CompetitionMode = "individual" | "team";
export type PriceMode = "per_person" | "per_team";
export type BibScope = "event" | "competition";
export type FormFieldType = "text" | "number" | "select" | "radio" | "textarea" | "file" | "heading";

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; message: string };

export type ParticipantGender = "male" | "female";

export type ParticipantInput = {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: ParticipantGender;
  documentType?: DocumentType;
  documentNumber?: string;
  answers?: Record<string, unknown>;
};
