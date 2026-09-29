# Implementation Plan: Eventos, competencias e inscripción

**Branch**: `003-eventos-inscripcion` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-eventos-inscripcion/spec.md`

## Summary

El organizador publica un evento con competencias y abre la inscripción por separado. Una persona elige competencia, completa el formulario y deja la inscripción lista para el pago. El cupo se reserva en una transacción. El folio se asigna cuando el pago queda aprobado (feature 004), salvo evento gratuito, que se confirma sin pago. Equipos, formulario avanzado, adicionales y ficha pública amplían esa base.

## Technical Context

**Language/Version**: Next.js 15 y TypeScript del plan 001

**Primary Dependencies**: Drizzle en transacción serializable para el cupo, Zod para el formulario

**Storage**: PostgreSQL en Neon, la base acordada en `specs/001-acceso-organizacion/plan.md`. Archivos de campos tipo archivo en Cloudflare R2, solo la clave en la fila.

**Testing**: Vitest del cupo N+1 y del folio único. Playwright del alta hasta la pantalla de espera de pago.

**Target Platform**: Vercel

**Project Type**: Módulo `src/modules/events`

**Performance Goals**: Publicar un evento simple en menos de 15 minutos de uso (SC-001). Inscripción básica en menos de 5 minutos (SC-002).

**Constraints**: Publicar y abrir inscripción son banderas distintas. Borrador y cancelado no se inscriben. Folio único en el alcance elegido (evento o competencia). Efectivo del día, si la competencia lo ofrece, es un medio exclusivo y lo cobra la feature 004.

**Scale/Scope**: Eventos de hasta miles de inscripciones. El piloto puede ser un solo evento.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. |
| II | Pasa. Publicar, inscribir y competencias son P1. Equipo y formulario son P2. Adicionales y ficha son P3. |
| III | Pasa. Evento y inscripción cuelgan de `organization_id`. |
| IV | Pasa. El estado inicial de una inscripción de pago es pendiente. Solo el evento gratuito o un pago aprobado la confirman. Esta feature no marca pagada una inscripción con precio. |
| V | Pasa. La visita solo crea la propia inscripción. |
| VI | Pasa. |
| VII | Pasa. Precios en MXN. |

Revisión posterior al diseño: la confirmación y el folio viven detrás del pago. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/003-eventos-inscripcion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/events/
src/app/(admin)/admin/events/
src/app/(public)/eventos/[eventId]/
```

**Structure Decision**: El editor y la ficha pública comparten el módulo. El cobro lo llama `src/modules/payments` en la feature 004 mediante `confirmRegistration`.

## Complexity Tracking

Sin violaciones.
