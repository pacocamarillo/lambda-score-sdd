# Tasks: Portal del participante

**Input**: Design documents from `/specs/006-portal-participante/`

**Prerequisites**: Sesión de 001, inscripción de 003 y pago de 004.

## Phase 1: Setup

- [ ] T001 Crear `src/modules/participant/`

## Phase 2: Foundational

- [ ] T002 Añadir `editable_by_participant` al campo en `src/db/schema/events.ts` y filtrar por correo de sesión en `src/modules/participant/mine.ts`

## Phase 3: User Story 1 - Ver mis eventos (Priority: P1)

**Goal**: Próximas y pasadas propias.

**Independent Test**: Otro correo no ve la lista.

- [ ] T003 [US1] Separar próximas y pasadas en `src/app/(participant)/panel/page.tsx`

## Phase 4: User Story 2 - Detalle y confirmación (Priority: P2)

**Goal**: Estado, folio y confirmación solo con pago aprobado.

**Independent Test**: La inscripción pendiente no abre la confirmación.

- [ ] T004 [US2] Detalle en `src/app/(participant)/panel/[registrationId]/page.tsx`
- [ ] T005 [US2] Confirmación en `src/app/(participant)/panel/[registrationId]/confirmacion/page.tsx` exigiendo pago `approved` y folio

## Phase 5: User Story 3 - Corregir datos permitidos (Priority: P2)

**Goal**: Solo campos editables. Nombre, correo, únicos y archivos bloqueados.

**Independent Test**: El organizador ve el cambio en menos de un minuto y el correo sigue igual.

- [ ] T006 [US3] Guardar respuestas permitidas en `src/modules/participant/edit.ts`

## Phase 6: User Story 4 - Perfil (Priority: P3)

**Goal**: Los datos de cuenta que el portal muestra, sin convertir el perfil del panel de organización.

**Independent Test**: El nombre de la cuenta no se edita desde una inscripción.

- [ ] T007 [US4] Editar datos generales del perfil en `src/app/(participant)/panel/cuenta/page.tsx`, con el correo visible y no editable

## Phase 7: Polish

- [ ] T008 Probar que otro correo recibe no encontrado en `tests/unit/participant/mine.test.ts`

## Dependencies

US1 es el MVP del portal. US2 y US3 dependen de US1. US4 es P3.

## Task counts

Total: 8. US1: 1. US2: 2. US3: 1. US4: 1.
