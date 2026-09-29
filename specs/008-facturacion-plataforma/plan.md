# Implementation Plan: Facturación de la plataforma

**Branch**: `008-facturacion-plataforma` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-facturacion-plataforma/spec.md`

## Summary

Cada mes la plataforma factura a la organización las inscripciones con pago aprobado, con vencimiento a las 72 horas. Si vence, el sitio público se apaga y la propietaria conserva la facturación. Un equipo interno, distinto de los roles de la organización, concilia, enciende funciones y reasigna folios. El piloto de la ola 1 puede cobrar este concepto fuera del producto.

## Technical Context

**Language/Version**: Next.js 15 del plan 001

**Primary Dependencies**: Stripe Billing en una cuenta de la plataforma, separada de Stripe Connect de los participantes. Trabajo programado el día 1 para cerrar el mes.

**Storage**: PostgreSQL en Neon, la misma base del plan 001, para periodo, factura y funciones. El medio de pago de la plataforma vive en Stripe, no en la base.

**Testing**: Vitest para “20 pagadas y 3 no pagadas cuentan 20”, vencimiento a 72 horas y reasignación que no toca otra competencia.

**Target Platform**: Vercel, más un cron

**Project Type**: Módulo `src/modules/billing` y consola `src/app/(internal)/superadmin`

**Performance Goals**: El sitio vuelve en menos de 10 minutos después de registrar el pago (SC-003).

**Constraints**: Precio por inscripción del periodo. Cambios fiscales aplican a facturas futuras. El bloqueo no borra inscripciones ni resultados.

**Scale/Scope**: Una factura por organización y mes. Funciones comerciales independientes del plan.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. |
| II | Pasa. Toda la feature es P3. No se implementa antes de las P1 de 001–004. |
| III | Pasa. La consola interna es otro rol, no una membresía de cliente. |
| IV | Pasa. Solo inscripciones con pago aprobado entran en la factura. |
| V | Pasa. Una propietaria no abre `/superadmin`. |
| VI | Pasa. El precio unitario es configuración, no se copia de un sitio. |
| VII | Pasa. MXN. |

Revisión posterior al diseño: Connect de participantes y Billing de la plataforma no comparten cuenta. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/008-facturacion-plataforma/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/billing/
src/app/(admin)/admin/billing/
src/app/(internal)/superadmin/
```

**Structure Decision**: El bloqueo del sitio es una comprobación en `src/lib/tenant.ts`: si hay factura vencida, el host público no sirve el sitio y `/admin/billing` sigue abierto.

## Complexity Tracking

Sin violaciones. La consola interna vive en el mismo despliegue hasta que un segundo equipo opere la plataforma.
