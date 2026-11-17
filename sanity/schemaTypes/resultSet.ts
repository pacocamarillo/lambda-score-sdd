import { defineField, defineType } from "sanity";

const lap = defineType({
  name: "lap",
  title: "Vuelta",
  type: "object",
  fields: [
    defineField({ name: "index", type: "number", title: "Número" }),
    defineField({ name: "time", type: "string", title: "Tiempo" }),
    defineField({ name: "place", type: "number", title: "Lugar en la vuelta" }),
    defineField({ name: "cumulativeTime", type: "string", title: "Tiempo acumulado" }),
    defineField({ name: "cumulativePlace", type: "number", title: "Lugar acumulado" }),
  ],
});

const resultRow = defineType({
  name: "resultRow",
  title: "Fila de resultado",
  type: "object",
  fields: [
    defineField({ name: "place", type: "number", title: "Lugar" }),
    defineField({ name: "bib", type: "string", title: "Dorsal" }),
    defineField({ name: "name", type: "string", title: "Nombre" }),
    defineField({ name: "time", type: "string", title: "Tiempo" }),
    defineField({ name: "gap", type: "string", title: "Diferencia" }),
    defineField({ name: "laps", type: "array", title: "Vueltas", of: [{ type: "lap" }] }),
  ],
});

export const resultSet = defineType({
  name: "resultSet",
  title: "Resultados de prueba",
  type: "document",
  fields: [
    defineField({ name: "year", title: "Año", type: "number", validation: (r) => r.required().min(2021) }),
    defineField({ name: "eventName", title: "Evento", type: "string", validation: (r) => r.required() }),
    defineField({ name: "eventDate", title: "Fecha", type: "date", validation: (r) => r.required() }),
    defineField({ name: "distance", title: "Distancia", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "rows",
      title: "Clasificación",
      type: "array",
      of: [{ type: "resultRow" }],
    }),
  ],
  preview: {
    select: { title: "eventName", subtitle: "distance", year: "year" },
    prepare: ({ title, subtitle, year }) => ({
      title: `${year} · ${title}`,
      subtitle,
    }),
  },
});

export const resultObjects = [lap, resultRow];
