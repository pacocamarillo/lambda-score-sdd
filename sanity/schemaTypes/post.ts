import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Artículo",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "cardTitle", title: "Título corto (listados)", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug (ruta de raíz)",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedAt", title: "Fecha de publicación", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Extracto", type: "text" }),
    defineField({ name: "description", title: "Meta description", type: "text" }),
    defineField({ name: "image", title: "Imagen destacada", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Texto alternativo", type: "string" }),
    defineField({ name: "body", title: "Cuerpo", type: "array", of: [{ type: "block" }] }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", media: "image" },
  },
});
