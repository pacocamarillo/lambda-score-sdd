import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createNewsPost, listNewsPosts } from "@/modules/site/news";
import {
  addSponsor,
  deleteSponsor,
  getSiteSettings,
  saveContact,
  saveCover,
  saveNetworks,
  saveThemeColors,
  setSiteActive,
  updateSponsor,
} from "@/modules/site/settings";
import { WebsiteScreen } from "./screen";

async function requireEditor() {
  const current = await auth();
  if (!current?.organizationId || (current.role !== "owner" && current.role !== "admin")) {
    redirect("/admin");
  }
  return current;
}

export default async function WebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.organizationId) redirect("/admin/elegir");
  const query = await searchParams;
  const [settings, newsPosts] = await Promise.all([
    getSiteSettings(session.organizationId),
    listNewsPosts(session.organizationId),
  ]);

  async function toggleActive(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const active = String(formData.get("active") ?? "") === "1";
    const result = await setSiteActive(current.organizationId!, active);
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function saveTheme(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const result = await saveThemeColors(current.organizationId!, {
      colorPrimary: String(formData.get("colorPrimary") ?? ""),
      colorSecondary: String(formData.get("colorSecondary") ?? ""),
      colorAccent: String(formData.get("colorAccent") ?? ""),
      colorSuccess: String(formData.get("colorSuccess") ?? ""),
      colorWarning: String(formData.get("colorWarning") ?? ""),
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function saveCoverAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const file = formData.get("coverImage");
    const bytes =
      file instanceof File && file.size > 0 ? new Uint8Array(await file.arrayBuffer()) : null;
    const result = await saveCover(current.organizationId!, {
      coverEnabled: formData.get("coverEnabled") === "on",
      coverTitle: String(formData.get("coverTitle") ?? ""),
      coverDescription: String(formData.get("coverDescription") ?? ""),
      coverImageBytes: bytes,
      clearImage: formData.get("clearImage") === "on",
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function saveNetworksAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const result = await saveNetworks(current.organizationId!, {
      facebookUrl: String(formData.get("facebookUrl") ?? ""),
      xUrl: String(formData.get("xUrl") ?? ""),
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      youtubeUrl: String(formData.get("youtubeUrl") ?? ""),
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function saveContactAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const result = await saveContact(current.organizationId!, {
      contactPhone: String(formData.get("contactPhone") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function addSponsorAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const file = formData.get("logo");
    const bytes = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array();
    const result = await addSponsor(current.organizationId!, {
      name: String(formData.get("name") ?? ""),
      siteUrl: String(formData.get("siteUrl") ?? ""),
      logoBytes: bytes,
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function updateSponsorAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const file = formData.get("logo");
    const bytes =
      file instanceof File && file.size > 0 ? new Uint8Array(await file.arrayBuffer()) : null;
    const result = await updateSponsor(current.organizationId!, String(formData.get("sponsorId") ?? ""), {
      name: String(formData.get("name") ?? ""),
      siteUrl: String(formData.get("siteUrl") ?? ""),
      logoBytes: bytes,
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function deleteSponsorAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const result = await deleteSponsor(current.organizationId!, String(formData.get("sponsorId") ?? ""));
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  async function createNewsAction(formData: FormData) {
    "use server";
    const current = await requireEditor();
    const file = formData.get("image");
    const bytes = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array();
    const result = await createNewsPost(current.organizationId!, {
      title: String(formData.get("title") ?? ""),
      contentHtml: String(formData.get("contentHtml") ?? ""),
      imageBytes: bytes,
      publish: true,
    });
    if (!result.ok) redirect(`/admin/website?error=${encodeURIComponent(result.message)}`);
    redirect("/admin/website?saved=1");
  }

  return (
    <WebsiteScreen
      organizationName={session.organizationName ?? "la organización"}
      settings={settings}
      newsPosts={newsPosts.map((post) => ({
        id: post.id,
        title: post.title,
        status: post.status,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
      }))}
      notice={query.saved ? "Cambios guardados." : undefined}
      error={query.error}
      actions={{
        toggleActive,
        saveTheme,
        saveCover: saveCoverAction,
        saveNetworks: saveNetworksAction,
        saveContact: saveContactAction,
        addSponsor: addSponsorAction,
        updateSponsor: updateSponsorAction,
        deleteSponsor: deleteSponsorAction,
        createNews: createNewsAction,
      }}
    />
  );
}
