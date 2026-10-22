import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { competitions, events, registrations, teams } from "@/db/schema/events";
import { registrationIsOpen } from "@/modules/events/crud";
import { registerParticipant } from "@/modules/events/register";
import type { ActionResult, ParticipantInput } from "@/modules/events/types";

export type TeamRegisterInput = {
  eventId: string;
  competitionId: string;
  teamName: string;
  members: ParticipantInput[];
  acceptedTerms: boolean;
  acceptedWaiver: boolean;
  addOnSelections?: Array<{ addOnId: string; option?: string }>;
};

export async function registerTeam(
  input: TeamRegisterInput,
): Promise<ActionResult<{ teamId: string; registrationIds: string[]; status: string }>> {
  if (!input.acceptedTerms || !input.acceptedWaiver) {
    return { ok: false, message: "Debes aceptar los términos y la renuncia de responsabilidad." };
  }

  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
  if (!event) return { ok: false, message: "No se encontró el evento." };
  if (!registrationIsOpen(event)) {
    return { ok: false, message: "La inscripción de este evento está cerrada." };
  }

  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, input.competitionId))
    .limit(1);
  if (!competition || competition.eventId !== input.eventId) {
    return { ok: false, message: "No se encontró la competencia." };
  }
  if (competition.mode !== "team") {
    return { ok: false, message: "Esta competencia no es de equipo." };
  }

  const teamName = input.teamName.trim();
  if (competition.teamNameRequired && !teamName) {
    return { ok: false, message: "El nombre del equipo es obligatorio." };
  }

  const minSize = competition.teamMinSize ?? 2;
  if (input.members.length < minSize) {
    return { ok: false, message: `El equipo necesita al menos ${minSize} integrantes.` };
  }

  const [team] = await db
    .insert(teams)
    .values({ competitionId: competition.id, name: teamName })
    .returning({ id: teams.id });
  if (!team) return { ok: false, message: "No se pudo crear el equipo." };

  const registrationIds: string[] = [];
  let status = "pending_payment";

  for (const [index, member] of input.members.entries()) {
    const result = await registerParticipant({
      eventId: input.eventId,
      competitionId: input.competitionId,
      participant: member,
      acceptedTerms: input.acceptedTerms,
      acceptedWaiver: input.acceptedWaiver,
      teamId: team.id,
      addOnSelections: index === 0 ? input.addOnSelections : [],
    });
    if (!result.ok) {
      // Best-effort: leave partial team; caller sees the error for the failing member.
      return { ok: false, message: `Integrante ${index + 1}: ${result.message}` };
    }
    registrationIds.push(result.registrationId);
    status = result.status;
  }

  return { ok: true, teamId: team.id, registrationIds, status };
}

export async function getTeamWithMembers(teamId: string) {
  const db = getDb();
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  if (!team) return null;
  const members = await db.select().from(registrations).where(eq(registrations.teamId, teamId));
  return { team, members };
}
