# Implementation Plan: Portal del participante

**Branch**: `006-portal-participante` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-portal-participante/spec.md`

## Summary

La misma cuenta de la feature 001 ve solo las inscripciones cuyo correo titular es el suyo. La confirmación existe si el pago está aprobado. Puede corregir los campos que el organizador marcó como editables, nunca el nombre, el correo ni un archivo ya cargado.

## Technical Context

**Language/Version**: Next.js 15 del plan 001

**Storage**: Las inscripciones ya están en PostgreSQL en Neon. Este módulo no abre otra base.

**Primary Dependencies**: La sesión de Auth.js y las inscripciones de `src/modules/events`

**Storage**: Sin tablas nuevas de identidad. Una marca `editable_by_participant` en el campo de formulario.

**Testing**: Vitest para que una cuenta no lea inscripciones de otro correo. Playwright para el estado de pago en menos de 30 segundos de uso.

**Target Platform**: Vercel, ruta `/panel`

**Project Type**: Módulo `src/modules/participant`

**Performance Goals**: Ver el estado de pago en menos de 30 segundos (SC-001). Un campo editable llega al organizador en menos de un minuto (SC-004).

**Constraints**: Sin confirmación si el pago no está aprobado. Los adicionales se muestran y no se cambian aquí.

**Scale/Scope**: Las inscripciones de una persona, próximas y pasadas.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. |
| II | Pasa. Mis eventos es P1. Detalle y corrección son P2. El perfil es P3. |
| III y V | Pasa. La consulta filtra por el correo de la sesión. |
| IV | Pasa. La confirmación exige `approved`. |
| VI y VII | Pasa. |

Revisión posterior al diseño: no hay un listado global de inscripciones en el portal. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/006-portal-participante/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/participant/
src/app/(participant)/panel/
```

**Structure Decision**: Reutiliza `User` y `Registration`. No crea otra cuenta.

## Complexity Tracking

Sin violaciones.
