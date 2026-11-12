import { TERMS } from "@/modules/legal/content";
import { LegalDocument } from "../legal-doc";

export default function TermsPage() {
  return <LegalDocument doc={TERMS} />;
}
