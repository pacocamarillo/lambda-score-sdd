# Tasks: Eventos, competencias e inscripción

**Input**: Design documents from `/specs/003-eventos-inscripcion/`

**Prerequisites**: App de 001 y sitio de 002.

## Phase 1: Setup

- [ ] T001 Crear `src/modules/events/`

## Phase 2: Foundational

- [ ] T002 Crear `event`, `competition`, `registration`, `team`, `form_field` y `add_on` en `src/db/schema/events.ts` con estados `draft` | `published` | `cancelled` y `pending_payment` | `confirmed` | `cancelled`
- [ ] T003 Exportar `assignBib` desde `src/modules/events/bib.ts`: único en alcance `event` o `competition`, con inicio y prefijo, sin llamarlo en inscripciones de pago

## Phase 3: User Story 1 - Publicar un evento (Priority: P1)

**Goal**: Borrador, publicado y cancelado. No se borra si hay inscripciones.

**Independent Test**: El borrador no es público. El publicado sí. Cancelar deja de ofrecer inscripción.

- [ ] T004 [US1] Validar mínimos de publicación en `src/modules/events/publish.ts`
- [ ] T005 [US1] Editar en `src/app/(admin)/admin/events/[id]/page.tsx` y listar en `src/app/(admin)/admin/events/page.tsx`

## Phase 4: User Story 2 - Inscribirse (Priority: P1)

**Goal**: Formulario base hasta pendiente de pago, con cupo.

**Independent Test**: Cupo 1 acepta una inscripción y rechaza la siguiente. No se cobra si el cupo no se puede leer.

- [ ] T006 [US2] Reservar cupo en transacción en `src/modules/events/register.ts`
- [ ] T007 [US2] Formulario público en `src/app/(public)/eventos/[eventId]/inscripcion/page.tsx` con nombre, apellido, nacimiento, documento `ine` | `curp` | `rfc` | `other` y correo

## Phase 5: User Story 3 - Configurar competencias (Priority: P1)

**Goal**: Nombre, precio MXN, cupo o ilimitado, individual o equipo.

**Independent Test**: Una competencia guardada permite publicar. Sin ella, no.

- [ ] T008 [US3] Guardar competencia en `src/modules/events/competitions.ts`, incluido `cash_on_event` como dato, sin cobrarlo aquí
- [ ] T009 [US3] Editor de competencias en `src/app/(admin)/admin/events/[id]/competitions/page.tsx`

## Phase 6: User Story 4 - Inscribir un equipo (Priority: P2)

**Goal**: Mínimo de integrantes y nombre de equipo según la competencia.

**Independent Test**: Falta un integrante o el nombre obligatorio y no se crea el equipo.

- [ ] T010 [US4] Crear el equipo y sus inscripciones en `src/modules/events/teams.ts`
- [ ] T011 [US4] Paso de equipo en `src/app/(public)/eventos/[eventId]/inscripcion/team/page.tsx`

## Phase 7: User Story 5 - Formulario, renuncia y folio (Priority: P2)

**Goal**: Campos propios y folio al confirmar.

**Independent Test**: Un campo obligatorio vacío no envía. Dos confirmadas no comparten folio.

- [ ] T012 [US5] Tipos `text`, `number`, `select`, `radio`, `textarea`, `file`, `heading` en `src/modules/events/form.ts`, con obligatorio, único en el evento y competencias aplicables
- [ ] T013 [US5] Exigir términos y renuncia en `src/modules/events/register.ts` y asignar folio solo en evento gratuito

## Phase 8: User Story 6 - Vender adicionales (Priority: P3)

**Goal**: Opciones, precio, stock y visibilidad sin borrar historial.

**Independent Test**: Ocultar un adicional deja la elección de quien ya lo compró.

- [ ] T014 [US6] Persistir elecciones en `src/modules/events/add-ons.ts` aunque el adicional pase a oculto

## Phase 9: User Story 7 - Página del evento (Priority: P3)

**Goal**: Ficha pública con competencias y camino a inscripción si sigue abierta.

**Independent Test**: Inscripción cerrada muestra la ficha y no el alta.

- [ ] T015 [US7] Ficha en `src/app/(public)/eventos/[eventId]/page.tsx` respetando `registration_open`

## Phase 10: Polish

- [ ] T016 Probar cupo N+1 y folio único en `tests/unit/events/capacity.test.ts`

## Dependencies

US1–US3 son el MVP junto con el pago de 004. US4 y US5 son ola 2. US6 y US7 son P3. `assignBib` lo invoca 004 al aprobar el pago.

## Task counts

Total: 16. US1: 2. US2: 2. US3: 2. US4: 2. US5: 2. US6: 1. US7: 1.
