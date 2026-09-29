# Implementation Plan: Comunicaciones y analítica

**Branch**: `007-comunicaciones-analitica` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-comunicaciones-analitica/spec.md`

## Summary

El inicio del panel lista eventos recientes y accesos, no un tablero de ingresos. La analítica de 7, 30 y 90 días, las campañas y las etiquetas de conversión son funciones de pago. El envío masivo corre en una cola y descuenta cupo. La baja de campañas no cancela los avisos de la propia inscripción.

## Technical Context

**Language/Version**: Next.js 15 del plan 001

**Primary Dependencies**: Resend para el envío. Una cola (Vercel Workflows) para la campaña. Eventos de página en PostgreSQL.

**Storage**: PostgreSQL en Neon, la misma base del plan 001, para métricas, contactos, campañas y cupo. Sin servicio de analítica externo obligatorio.

**Testing**: Vitest para el tope de cupo, la baja que sí recibe el aviso de pago, y el staff sin analítica.

**Target Platform**: Vercel

**Project Type**: Módulo `src/modules/comms`

**Performance Goals**: Una inscripción completada cae en el periodo de 7 días de su evento y no en otro (SC-001).

**Constraints**: Base mensual que se reinicia y saldo comprado que no vence. Prueba y masivo descuentan cupo. Meta Pixel y Google Ads solo con la función comercial. Staff sin permiso no ve estas secciones.

**Scale/Scope**: Cupo inicial de referencia 50 correos al mes por organización, ampliable al comprar saldo.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. |
| II | Pasa. El resumen del panel es P2. El resto es P3 y no se construye antes del pago de la ola 1. |
| III | Pasa. |
| IV | Pasa. El aviso de confirmación de pago no pasa por la baja de campañas. |
| V | Pasa. Staff excluido. |
| VI | Pasa. No se copian cifras de un sitio real. |
| VII | Pasa. |

Revisión posterior al diseño: el inicio no consulta la tabla de métricas. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/007-comunicaciones-analitica/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/comms/
src/app/(admin)/admin/page.tsx
src/app/(admin)/admin/analytics/
src/app/(admin)/admin/communications/
workers/email/
```

**Structure Decision**: El resumen del panel puede entregarse en la ola 2. Analítica y campañas esperan la función comercial de la feature 008.

## Complexity Tracking

La cola de correo es un worker del mismo producto, igual que el de fotos. El volumen de un envío masivo no cabe en el request que pulsa “enviar”.
