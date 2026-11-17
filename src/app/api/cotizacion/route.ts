import { NextResponse } from "next/server";
import { quoteSchema, sendQuoteEmail } from "@/marketing/lib/submissions";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, fields: { form: "JSON inválido" } },
      { status: 400 },
    );
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ ok: false, fields }, { status: 400 });
  }

  const result = await sendQuoteEmail(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "unavailable" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
