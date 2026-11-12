import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Legal">
        <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
        <Link href="/terminos">Términos y condiciones</Link>
        <Link href="/cookies">Política de cookies</Link>
      </nav>
      <p className="hint">Lambda Score · Plataforma de inscripción y cronometraje</p>
    </footer>
  );
}
