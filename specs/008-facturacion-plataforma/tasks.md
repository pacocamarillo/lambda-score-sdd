# Tasks: Facturación de la plataforma

**Input**: Design documents from `/specs/008-facturacion-plataforma/`

**Prerequisites**: Inscripciones confirmadas de 003 y 004. No empezar antes de que esas P1 estén aceptadas.

## Phase 1: Setup

- [ ] T001 Crear `src/modules/billing/` usando la cuenta de Stripe Billing, distinta de la conexión Connect de `src/modules/payments`

## Phase 2: Foundational

- [ ] T002 Crear `billing_period`, `platform_invoice`, `feature_flag` y `platform_operator` en `src/db/schema/billing.ts`

## Phase 3: User Story 1 - Factura mensual (Priority: P3)

**Goal**: Estimado, cierre, 72 horas, un solo cobro.

**Independent Test**: 20 aprobadas y 3 no aprobadas facturan 20. Una factura pagada no se cobra otra vez.

- [ ] T003 [US1] Contar solo pago aprobado en `src/modules/billing/estimate.ts`
- [ ] T004 [US1] Emitir con vencimiento a las 72 horas en `src/modules/billing/close-period.ts` y mostrar en `src/app/(admin)/admin/billing/page.tsx`

## Phase 4: User Story 2 - Bloqueo (Priority: P3)

**Goal**: Sitio apagado si la factura venció. Facturación sigue abierta.

**Independent Test**: Al pagar, el sitio vuelve en menos de 10 minutos.

- [ ] T005 [US2] Consultar factura vencida en `src/lib/tenant.ts` y dejar pasar `/admin/billing`

## Phase 5: User Story 3 - Consola interna (Priority: P3)

**Goal**: Operadores ven todas las organizaciones. El cliente no entra.

**Independent Test**: La propietaria recibe rechazo en `/superadmin`. Conciliar marca la factura pagada.

- [ ] T006 [US3] Exigir `platform_operator` en `src/app/(internal)/superadmin/page.tsx`
- [ ] T007 [US3] Conciliar en `src/modules/billing/reconcile.ts` y reasignar folios en `src/modules/billing/reassign-bibs.ts` en orden de creación, una competencia

## Phase 6: User Story 4 - Funciones de pago (Priority: P3)

**Goal**: `included_in_plan` y `enabled` por separado.

**Independent Test**: Encender comunicaciones en una organización no la enciende en otra.

- [ ] T008 [US4] Leer `enabled` desde `src/modules/billing/features.ts` en analítica, campañas, fotos, roles, eventos privados, lotes de cupones, cuentas por evento, cargo de servicio, dominio y cronometraje

## Phase 7: Polish

- [ ] T009 Probar el conteo y la reasignación aislada en `tests/unit/billing/invoice.test.ts`

## Dependencies

US1 antes de US2. US3 puede ir en paralelo con US1 después del esquema. US4 es el interruptor que las features 001, 004, 005 y 007 ya consultan.

## Task counts

Total: 9. US1: 2. US2: 1. US3: 2. US4: 1.

## Implementation strategy

No forma parte del MVP. El primer incremento demostrable sigue siendo 001, 002, 003 y el pago de 004.
