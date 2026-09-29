# Implementation Plan: Cobro al participante y cupones

**Branch**: `004-pagos-cupones` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-pagos-cupones/spec.md`

## Summary

El evento puede ofrecer Stripe, Mercado Pago, transferencia y otros medios a la vez. Cada compra paga el total con uno solo. Un intento fallido se puede reemplazar por otro medio; el intento anterior no queda como abono. La transferencia y el efectivo del día esperan confirmación del equipo. Los fondos de Stripe y Mercado Pago van a la cuenta conectada de la organización.

## Technical Context

**Language/Version**: Next.js 15 del plan 001

**Primary Dependencies**: Stripe Connect (cuenta estándar) y Mercado Pago (OAuth). Webhooks con idempotencia.

**Storage**: PostgreSQL en Neon, la base acordada en `specs/001-acceso-organizacion/plan.md`, para el pago y el cupón. El comprobante de transferencia en Cloudflare R2.

**Testing**: Vitest para “un solo medio”, “no segundo cobro” y cupón de un uso en carrera. Prueba manual o de sandbox para la aprobación en menos de un minuto (SC-001).

**Target Platform**: Vercel. Los webhooks son rutas de Next.js.

**Project Type**: Módulo `src/modules/payments`

**Performance Goals**: Confirmación visible en menos de un minuto tras la aprobación del procesador (SC-001). Aviso de transferencia aprobada en menos de 5 minutos (SC-005).

**Constraints**: El monto cobrado es el total del resumen. No se combinan medios. El cupón solo reduce ese total. El cargo del procesador se puede ocultar. El cargo de servicio propio y las cuentas por evento son funciones de pago.

**Scale/Scope**: Ola 1 cobra una inscripción individual. Equipos, cupones y lotes siguen en P2 y P3.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. Stripe y Mercado Pago están en la spec porque son la oferta visible, y este plan fija cómo se conectan. |
| II | Pasa. Elegir un medio, transferencia y configurar medios son P1. El cupón es P2. Los lotes son P3. |
| III | Pasa. El pago cuelga de la organización de la inscripción. |
| IV | Pasa. Solo `approved` llama a `assignBib` y pasa la inscripción a `confirmed`. |
| V | Pasa. El comprobante no es público. |
| VI | Pasa. |
| VII | Pasa. MXN. |

Revisión posterior al diseño: una compra tiene una fila de pago activa. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/004-pagos-cupones/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/payments/
src/app/(public)/eventos/[eventId]/pago/
src/app/api/webhooks/stripe/
src/app/api/webhooks/mercadopago/
src/app/(admin)/admin/settings/payments/
```

**Structure Decision**: La conexión de cuentas es de la organización. El evento solo elige qué medios de esa conexión están activos.

## Complexity Tracking

Sin violaciones. Stripe y Mercado Pago son dos conexiones, no dos aplicaciones.
