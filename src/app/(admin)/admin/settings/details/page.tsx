import { redirect } from "next/navigation";

export default function OrganizationDetailsRedirect() {
  redirect("/admin/settings");
}
