import { COOKIES_POLICY } from "@/modules/legal/content";
import { LegalDocument } from "../legal-doc";

export default function CookiesPage() {
  return <LegalDocument doc={COOKIES_POLICY} />;
}
