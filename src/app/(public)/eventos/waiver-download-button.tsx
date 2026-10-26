"use client";

const DEFAULT_FIELDS = {
  firstName: "firstName",
  lastName: "lastName",
  birthDate: "birthDate",
  email: "email",
  competitionId: "competitionId",
  gender: "gender",
};

export function WaiverDownloadButton({
  eventId,
  categoryFieldIds = [],
  fields = DEFAULT_FIELDS,
}: {
  eventId: string;
  categoryFieldIds?: string[];
  fields?: typeof DEFAULT_FIELDS;
}) {
  return (
    <button
      type="button"
      className="ghost"
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        const data = new FormData(form);
        const params = new URLSearchParams();
        params.set("firstName", String(data.get(fields.firstName) ?? ""));
        params.set("lastName", String(data.get(fields.lastName) ?? ""));
        params.set("birthDate", String(data.get(fields.birthDate) ?? ""));
        params.set("email", String(data.get(fields.email) ?? ""));
        params.set("competitionId", String(data.get(fields.competitionId) ?? ""));
        params.set("gender", String(data.get(fields.gender) ?? ""));
        const category = categoryFieldIds
          .map((fieldId) => String(data.get(`field_${fieldId}`) ?? "").trim())
          .find(Boolean);
        if (category) params.set("category", category);
        window.open(`/eventos/${eventId}/carta?${params.toString()}`, "_blank", "noopener");
      }}
    >
      Descargar carta de exoneración (PDF)
    </button>
  );
}
