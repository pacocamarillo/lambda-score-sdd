import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Evento",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nombre", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "startsAt", title: "Fecha", type: "date", validation: (r) => r.required() }),
    defineField({ name: "place", title: "Lugar", type: "string" }),
    defineField({ name: "image", title: "Imagen", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Texto alternativo", type: "string" }),
    defineField({ name: "registrationUrl", title: "URL de inscripción", type: "url" }),
    defineField({ name: "summary", title: "Resumen", type: "text" }),
  ],
});
