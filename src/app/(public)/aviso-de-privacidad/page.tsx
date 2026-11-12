import { PRIVACY_NOTICE } from "@/modules/legal/content";
import { LegalDocument } from "../legal-doc";

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_NOTICE} />;
}
