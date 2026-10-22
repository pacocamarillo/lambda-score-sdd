import Link from "next/link";

const links = [
  { suffix: "", label: "Información" },
  { suffix: "/competitions", label: "Competencias" },
  { suffix: "/formulario", label: "Formulario" },
  { suffix: "/adicionales", label: "Adicionales" },
  { suffix: "/participantes", label: "Participantes" },
] as const;

export function EventNav({ eventId, current }: { eventId: string; current: string }) {
  return (
    <nav className="tabs" aria-label="Secciones del evento">
      {links.map((link) => {
        const href = `/admin/events/${eventId}${link.suffix}`;
        const active = current === link.suffix;
        return (
          <Link key={link.suffix} href={href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
