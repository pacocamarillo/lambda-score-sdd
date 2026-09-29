# Tasks: Cobro al participante y cupones

**Input**: Design documents from `/specs/004-pagos-cupones/`

**Prerequisites**: Inscripción `pending_payment` de la feature 003 y `assignBib`.

## Phase 1: Setup

- [ ] T001 Crear `src/modules/payments/` y añadir los SDK de Stripe y Mercado Pago en `package.json`

## Phase 2: Foundational

- [ ] T002 Crear `payment_account`, `event_payment_method`, `purchase`, `payment` y `coupon` en `src/db/schema/payments.ts` con un solo `method` y estados `pending` | `approved` | `failed` | `rejected`
- [ ] T003 Rechazar un segundo medio si la compra tiene un pago `pending` o `approved` en `src/modules/payments/single-method.ts`

## Phase 3: User Story 1 - Elegir un medio y pagar en línea (Priority: P1)

**Goal**: Stripe o Mercado Pago cobran el total y confirman.

**Independent Test**: La aprobación confirma en menos de un minuto. Un fallo no confirma y permite otro intento por el total.

- [ ] T004 [US1] Crear el cobro del total en `src/modules/payments/checkout.ts` para `stripe` y `mercadopago`
- [ ] T005 [P] [US1] Confirmar idempotente en `src/app/api/webhooks/stripe/route.ts` y `src/app/api/webhooks/mercadopago/route.ts`, llamando a `assignBib` una sola vez
- [ ] T006 [US1] Elegir un medio en `src/app/(public)/eventos/[eventId]/pago/page.tsx` sin control para partir el monto

## Phase 4: User Story 2 - Transferencia (Priority: P1)

**Goal**: Comprobante, aprobación o rechazo, aviso.

**Independent Test**: El rechazo no confirma ni habilita kit. La aprobación avisa.

- [ ] T007 [US2] Guardar instrucciones y comprobante privado en `src/modules/payments/transfer.ts`
- [ ] T008 [US2] Aprobar o rechazar en `src/app/(admin)/admin/events/[id]/payments/review/page.tsx`, y al aprobar un equipo confirmar a todos sus integrantes

## Phase 5: User Story 3 - Varios medios, uno por compra (Priority: P1)

**Goal**: La organización conecta proveedores y el evento elige cuáles se ven.

**Independent Test**: Stripe y Mercado Pago se conectan por separado. El efectivo no completa un pago empezado en línea.

- [ ] T009 [US3] Conectar y desconectar en `src/app/(admin)/admin/settings/payments/page.tsx`, con los fondos hacia la cuenta de ese proveedor
- [ ] T010 [US3] Activar medios del evento en `src/app/(admin)/admin/events/[id]/payments/page.tsx`, tratando `cash_on_event` como medio exclusivo del total

## Phase 6: User Story 4 - Cupón (Priority: P2)

**Goal**: Porcentaje o monto, sin partir el resto entre medios.

**Independent Test**: Dos compras simultáneas con un uso disponible solo descuentan una.

- [ ] T011 [US4] Reservar el uso en la misma transacción del pago en `src/modules/payments/coupons.ts`, sin cambiar tipo ni modalidad después del primer uso
- [ ] T012 [US4] Administrar cupones en `src/app/(admin)/admin/coupons/page.tsx`

## Phase 7: User Story 5 - Lotes (Priority: P3)

**Goal**: Crear y exportar lotes solo con la función comercial.

**Independent Test**: Sin la función, la pantalla no crea códigos.

- [ ] T013 [US5] Generar el lote en `src/modules/payments/coupon-batches.ts` y exportarlo desde `src/app/(admin)/admin/coupons/batches/page.tsx`

## Phase 8: Polish

- [ ] T014 Cubrir un solo medio y el cupón de un uso en `tests/unit/payments/single-method.test.ts`
- [ ] T015 Permitir ocultar el cargo del procesador en el resumen de `src/modules/payments/checkout.ts` sin cambiar el total

## Dependencies

US1–US3 cierran la ola 1 junto con 001–003. US4 es P2. US5 es P3 y depende de US4.

## Task counts

Total: 15. US1: 3. US2: 2. US3: 2. US4: 2. US5: 1.
