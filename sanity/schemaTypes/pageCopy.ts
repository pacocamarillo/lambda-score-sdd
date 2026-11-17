import { defineField, defineType } from "sanity";

export const pageCopy = defineType({
  name: "pageCopy",
  title: "Copy de página",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Clave",
      type: "string",
      options: {
        list: [
          { title: "Inicio", value: "home" },
          { title: "Nosotros", value: "nosotros" },
          { title: "Servicios", value: "servicios" },
          { title: "Cotizar", value: "cotizar" },
          { title: "Trifecta", value: "trifecta" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "h1", title: "H1 / promesa", type: "string" }),
    defineField({ name: "lead", title: "Lead", type: "text" }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text" }),
    defineField({
      name: "blocks",
      title: "Bloques libres (JSON / notas)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", title: "Título" }),
            defineField({ name: "body", type: "text", title: "Cuerpo" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "key", subtitle: "h1" },
  },
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configuración del sitio",
  type: "document",
  fields: [
    defineField({ name: "phoneDisplay", title: "Teléfono", type: "string" }),
    defineField({ name: "marketingPhoneDisplay", title: "Teléfono marketing", type: "string" }),
    defineField({ name: "email", title: "Correo", type: "string" }),
    defineField({ name: "whatsappUrl", title: "WhatsApp URL", type: "url" }),
    defineField({
      name: "social",
      title: "Redes",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", title: "Nombre" }),
            defineField({ name: "href", type: "url", title: "URL" }),
          ],
        },
      ],
    }),
  ],
});
