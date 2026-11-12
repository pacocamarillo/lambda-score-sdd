import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildCouponsExcel } from "@/modules/coupons/export";

export async function GET() {
  const session = await auth();
  if (!session?.organizationId || (session.role !== "owner" && session.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await buildCouponsExcel(session.organizationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return new NextResponse(result.body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  });
}
