# Implementation Plan: Sitio público

**Branch**: `002-sitio-publico` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-sitio-publico/spec.md`

## Summary

Cada organización tiene un sitio con su marca: inicio, próximos y pasados, noticias, contacto y, cuando se habilitan, menú y páginas de bloques. Los cambios públicos pueden tardar hasta 5 minutos. Depende de la organización creada en `001-acceso-organizacion` y enlaza al evento que publicará `003-eventos-inscripcion`.

## Technical Context

**Language/Version**: El mismo Next.js 15 y TypeScript de `specs/001-acceso-organizacion/plan.md`

**Primary Dependencies**: Server Components, `revalidateTag` de 300 segundos, Zod para colores y URLs

**Storage**: Filas de sitio, noticia, página y menú en PostgreSQL en Neon, la base acordada en `specs/001-acceso-organizacion/plan.md`. Imagen de portada y logos de patrocinador en Cloudflare R2, solo como URL. No se optimizan con el pipeline de fotos de carrera.

**Testing**: Vitest para borrador invisible y slug. Playwright para encontrar el próximo evento desde el inicio.

**Target Platform**: Vercel, host de la organización resuelto en `src/lib/tenant.ts`

**Project Type**: Módulo `src/modules/site` dentro del monolito

**Performance Goals**: El inicio muestra el próximo evento y un camino a la inscripción en menos de 30 segundos de uso (SC-001). Un cambio de título se ve en el público en como máximo 5 minutos (SC-003).

**Constraints**: Español de México. El pie muestra el contacto de la organización y un crédito de la plataforma, sin la marca de otra organización. Dominio propio sigue siendo función de pago de la feature 001.

**Scale/Scope**: Una portada, listado de eventos, noticias y páginas por organización.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. La tecnología vive en este plan. |
| II | Pasa. Inicio y portada son P1. Noticias, menú y páginas son P2. |
| III | Pasa. Todo contenido lleva `organization_id` del host. |
| IV | No aplica. Este módulo no confirma inscripciones. |
| V | Pasa. Solo propietaria y administrador editan el sitio. |
| VI | Pasa. Colores, logo y textos son de la organización. |
| VII | Pasa. |

Revisión posterior al diseño: la caché de 5 minutos no cruza organizaciones. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/002-sitio-publico/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/site/
src/app/(public)/
src/app/(admin)/admin/website/
```

**Structure Decision**: Páginas públicas en el host de la organización. El editor vive en el panel ya creado por la feature 001.

## Complexity Tracking

Sin violaciones.
