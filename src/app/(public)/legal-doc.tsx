import type { LegalDoc } from "@/modules/legal/content";

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="stack register-page legal-page">
      <header>
        <h1>{doc.title}</h1>
        <p className="lede">Última actualización: {doc.updated}</p>
      </header>
      {doc.sections.map((section, index) => (
        <section key={section.heading ?? index} className="card stack">
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
