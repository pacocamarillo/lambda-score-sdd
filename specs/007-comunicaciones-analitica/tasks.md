# Tasks: Comunicaciones y analítica

**Input**: Design documents from `/specs/007-comunicaciones-analitica/`

**Prerequisites**: Panel de 001, eventos de 003, aviso de pago de 004.

## Phase 1: Setup

- [ ] T001 Crear `src/modules/comms/` y `workers/email/`

## Phase 2: Foundational

- [ ] T002 Crear `page_event`, `contact`, `campaign` y `mail_quota` en `src/db/schema/comms.ts`

## Phase 3: User Story 1 - Resumen del panel (Priority: P2)

**Goal**: Eventos recientes y accesos, más funciones de pago pendientes.

**Independent Test**: El inicio no muestra visitas ni ingresos.

- [ ] T003 [US1] Listar eventos recientes en `src/app/(admin)/admin/page.tsx` con fecha, inscripciones, estado y accesos a crear evento, sitio y configuración

## Phase 4: User Story 2 - Analítica (Priority: P3)

**Goal**: 7, 30 y 90 días con filtro de evento.

**Independent Test**: Una inscripción completada no aparece en otro evento.

- [ ] T004 [US2] Registrar y consultar métricas en `src/modules/comms/analytics.ts`
- [ ] T005 [US2] Pantalla en `src/app/(admin)/admin/analytics/page.tsx`, cerrada si la función está apagada o el rol es staff

## Phase 5: User Story 3 - Campaña (Priority: P3)

**Goal**: Audiencia, prueba y envío hasta el cupo.

**Independent Test**: La prueba no dispara el masivo. Doce destinatarios con cupo 10 envían diez.

- [ ] T006 [US3] Descontar cupo y omitir correos inválidos o sin folio en `src/modules/comms/send.ts`
- [ ] T007 [US3] Editor en `src/app/(admin)/admin/communications/page.tsx` y worker en `workers/email/campaign.ts`

## Phase 6: User Story 4 - Contactos y cupo (Priority: P3)

**Goal**: Base mensual que se reinicia y saldo comprado que no vence.

**Independent Test**: Al reiniciar el mes, el saldo comprado sigue.

- [ ] T008 [US4] Reiniciar solo `monthly_remaining` en `src/modules/comms/quota.ts`
- [ ] T009 [US4] Baja en `src/app/baja/[token]/route.ts` sin afectar el aviso de pago de `src/modules/payments`

## Phase 7: User Story 5 - Conversión externa (Priority: P3)

**Goal**: Guardar Meta Pixel y Google Ads solo con la función.

**Independent Test**: Sin la función, el formulario no persiste los identificadores.

- [ ] T010 [US5] Guardar etiquetas en `src/modules/comms/external-tags.ts` y pintarlas en el sitio público solo si existen

## Phase 8: Polish

- [ ] T011 Probar cupo y baja en `tests/unit/comms/quota.test.ts`

## Dependencies

US1 puede ir en la ola 2. US2–US5 esperan la función comercial y no bloquean el cobro de inscripciones.

## Task counts

Total: 11. US1: 1. US2: 2. US3: 2. US4: 2. US5: 1.
