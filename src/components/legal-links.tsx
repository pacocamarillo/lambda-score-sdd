import Link from "next/link";

export function LegalIntroLinks() {
  return (
    <p className="lede legal-intro">
      Antes de continuar, consulta el{" "}
      <Link href="/aviso-de-privacidad">aviso de privacidad</Link> y los{" "}
      <Link href="/terminos">términos y condiciones</Link>.
    </p>
  );
}
