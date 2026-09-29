import { auth } from "@/lib/auth";
import { WebsiteScreen } from "./screen";

export default async function WebsitePage() {
  const session = await auth();
  return <WebsiteScreen organizationName={session?.organizationName ?? "la organización"} />;
}
