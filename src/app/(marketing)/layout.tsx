import { MarketingChrome } from "@/marketing/marketing-chrome";
import { site } from "@/marketing/content/site";

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "LambdaScore | Meta, chip, kit e inscripción para tu carrera",
    template: "%s | LambdaScore",
  },
  description:
    "Cronometraje RFID, arcos, vallas, kits e inscripción en un solo proveedor en el centro de México.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
