import { defineField, defineType } from "sanity";

export const rentalItem = defineType({
  name: "rentalItem",
  title: "Concepto de renta",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nombre", type: "string", validation: (r) => r.required() }),
    defineField({ name: "priceFrom", title: "Precio desde (MXN)", type: "number" }),
    defineField({
      name: "scenario",
      title: "Escenario",
      type: "string",
      options: {
        list: [
          { title: "Meta", value: "meta" },
          { title: "Control de flujo", value: "flujo" },
          { title: "Premiación", value: "premiacion" },
          { title: "Otro", value: "otro" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "pagePath",
      title: "Ruta de ficha",
      type: "string",
      options: {
        list: [
          "/renta-de-arco-meta-para-carreras",
          "/renta-de-vallas-metalicas-en-puebla-seguridad-y-control-para-eventos-masivos",
        ],
      },
      validation: (r) => r.required(),
    }),
  ],
});
