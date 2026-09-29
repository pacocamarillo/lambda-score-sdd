# Implementation Plan: Acceso, organización y permisos

**Branch**: `001-acceso-organizacion` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-acceso-organizacion/spec.md`

## Summary

Una persona entra con contraseña o enlace de correo, recupera su clave y crea una organización aislada de la que es propietaria. El equipo se invita después, con staff limitado por evento cuando la función comercial está activa. El producto es un monolito modular en Next.js sobre Vercel: un solo código para sitio público, panel, portal y consola interna, con PostgreSQL como fuente de datos y el identificador de organización en cada consulta.

## Acuerdos de stack

Acordados el 2026-09-29 para desplegar en Vercel. Las specs de historias no los repiten. El resto de planes usa esta misma base y este mismo despliegue.

| Pieza | Acuerdo |
| --- | --- |
| Aplicación | Next.js 15 (App Router), TypeScript 5, Node.js 22, un solo proyecto en Vercel |
| Base de datos | PostgreSQL en Neon. Esquema y migraciones con Drizzle. Una sola base para todas las organizaciones |
| Acceso | Auth.js, sesión en esa base, contraseñas con Argon2id. TOTP opcional (`otpauth`), secreto cifrado con `AUTH_SECRET`, ticket `login_2fa` de 5 minutos |
| Correo | Resend, en español de México |
| Validación | Zod |
| Fotos y comprobantes | Cloudflare R2. En Neon solo queda el registro (clave, tamaño, folio). El archivo no se guarda en PostgreSQL |
| Cobro al participante | Stripe Connect y Mercado Pago, cuentas separadas |
| Cobro de la plataforma | Stripe Billing, en una cuenta distinta de Connect |
| Trabajos largos | Vercel Workflows (campañas y, si se contrata, procesamiento de fotos) |
| Pruebas | Vitest y Playwright |

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), Node.js 22

**Primary Dependencies**: Auth.js (sesión en base de datos), Drizzle ORM, Argon2id, otpauth (TOTP opcional), Resend para correos transaccionales, Zod

**Storage**: PostgreSQL en Neon. Sesiones y tokens de un solo uso en esa misma base. Los archivos van a Cloudflare R2.

**Testing**: Vitest para reglas de rol y tokens; Playwright para los recorridos de `quickstart.md`

**Target Platform**: Vercel. El sitio de cada organización se resuelve por subdominio del host.

**Project Type**: Aplicación web monolítica (panel, sitio público y portal en el mismo despliegue)

**Performance Goals**: Entrada al panel en menos de un minuto en condiciones normales de red (SC-001). La resolución de organización por host no añade una ida extra a la base en cada petición de página ya autenticada: la membresía activa viaja en la sesión.

**Constraints**: Español de México. País `MX` y moneda `MXN` fijos al crear la organización. Subdominio, país y moneda inmutables. Mensaje único ante credenciales inválidas. Enlaces de un solo uso caducan a las 24 horas.

**Scale/Scope**: Ola 1 con una organización piloto y su propietaria. El modelo admite muchas organizaciones desde el primer esquema. Esta feature cubre acceso, alta de organización, equipo y perfil.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Resultado |
| --- | --- |
| I. El plan, no la spec, fija la tecnología | Pasa. `spec.md` sigue sin frameworks. |
| II. Historias independientes | Pasa. P1 es entrar y crear la organización. Invitar y limitar staff es P2. El perfil es P3. |
| III. Aislamiento por organización | Pasa. Toda fila de negocio lleva `organization_id`. La sesión guarda la membresía activa. |
| IV. El pago confirma la inscripción | No aplica en esta feature. No se confirma ninguna inscripción aquí. |
| V. Mínimo privilegio | Pasa. Solo el rol propietaria escribe miembros. Staff no ve facturación, configuración, sitio ni analítica. Varias propietarias pueden coexistir; la última no se elimina. |
| VI. Sin clonar marca | Pasa. El acceso muestra el nombre de la organización, no una marca de referencia. |
| VII. es-MX y MXN | Pasa. Alta con país y moneda fijos. |

Revisión posterior al diseño: los contratos exigen `organization_id` y no exponen si un correo existe. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-acceso-organizacion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   ├── (admin)/
│   └── api/auth/
├── modules/access/
├── db/
└── lib/
    ├── tenant.ts
    └── email.ts
tests/
├── unit/access/
└── e2e/access/
```

**Structure Decision**: Un solo proyecto Next.js. Esta feature crea el esqueleto (`src/app`, `src/db`, `src/lib`) y el módulo `src/modules/access`. Las features 002–008 agregan módulos en el mismo árbol; no crean otra aplicación.

## Complexity Tracking

Sin violaciones. El correo, el procesamiento de fotos y el cronometraje en pista quedan como trabajos en segundo plano dentro del mismo producto, no como servicios aparte en esta feature.
