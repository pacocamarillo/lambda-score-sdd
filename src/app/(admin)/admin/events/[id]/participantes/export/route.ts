import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOwnedEvent } from "@/modules/events/crud";
import { buildParticipantsExcel } from "@/modules/events/participants-export";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.organizationId) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  if (session.role !== "owner" && session.role !== "admin" && session.role !== "staff") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  const { id } = await context.params;
  const event = await getOwnedEvent(id, session.organizationId);
  if (!event) {
    return NextResponse.json({ message: "No se encontró el evento." }, { status: 404 });
  }

  const exportResult = await buildParticipantsExcel(id, session.organizationId);
  if (!exportResult.ok) {
    return NextResponse.json({ message: exportResult.message }, { status: 400 });
  }

  return new NextResponse(exportResult.body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
