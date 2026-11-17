import { defineField, defineType } from "sanity";

export const featuredVideo = defineType({
  name: "featuredVideo",
  title: "Video destacado",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "URL de YouTube",
      type: "url",
      description:
        "Pega el enlace para compartir, un Short o un watch. Ejemplo: https://youtube.com/shorts/JdgUdPQvbK8",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
      type: "number",
      description: "Menor número aparece primero.",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "youtubeUrl" },
  },
});
