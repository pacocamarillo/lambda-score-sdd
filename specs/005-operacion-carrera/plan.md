# Implementation Plan: Operación de carrera

**Branch**: `005-operacion-carrera` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-operacion-carrera/spec.md`

## Summary

El equipo busca inscritos, entrega kit solo con pago aprobado, importa tiempos y los publica. La visita ve lugar, folio, nombre, tiempo y diferencia, con vistas de ganadores, top 3 y tabla completa, descarga y certificado imprimible. Las fotos se guardan fuera de Vercel: miniatura en la galería y original solo al descargar. El paquete de procesamiento y el código de cronometraje son funciones aparte.

## Technical Context

**Language/Version**: Next.js 15 del plan 001

**Primary Dependencies**: Cloudflare R2 con subida firmada. Miniaturas generadas en un worker, no en la función que pinta la página. Hoja de cálculo con una librería de escritura en el servidor.

**Storage**: Metadatos en PostgreSQL en Neon, la base acordada en `specs/001-acceso-organizacion/plan.md`. El archivo de la foto en Cloudflare R2, no en la base. Tope 15 MB por archivo, 5.000 fotos o 25 GB por evento.

**Testing**: Vitest para kit sin pago, folio inexistente que no crea participante, y certificado oculto si no está publicado.

**Target Platform**: Vercel para la app. R2 para objetos. El procesamiento de fotos, si se contrata, corre en Vercel Workflows por lotes, fuera del request de la página.

**Project Type**: Módulo `src/modules/race`

**Performance Goals**: Encontrar un folio entre 1.000 inscritos en menos de 15 segundos (SC-001). Importar 200 filas válidas en menos de 2 minutos (SC-003). Localizar un folio público en menos de 30 segundos (SC-004).

**Constraints**: Resultados ocultos hasta publicar. JPG o PNG. Galería de miniaturas sin mínimo de 50 participantes. El procesamiento pide 50 participantes activos, un solo recorrido y aviso de hasta 24 horas. El escáner y el modo sin conexión son función de pago.

**Scale/Scope**: Eventos de hasta 5.000 fotos. La clasificación automática no es obligatoria.

## Constitution Check

| Principio | Resultado |
| --- | --- |
| I | Pasa. R2 y el worker están en este plan. |
| II | Pasa. Inscritos son P1. Check-in y resultados son P2. Categorías, fotos y código son P3. |
| III | Pasa. |
| IV | Pasa. Kit y check-in exigen pago `approved`. |
| V | Pasa. El original no se sirve en el listado. |
| VI | Pasa. El certificado usa el nombre de la organización. |
| VII | Pasa. |

Revisión posterior al diseño: la página pública no descarga originales ni proxies de 15 MB. Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/005-operacion-carrera/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/modules/race/
src/app/(admin)/admin/events/[id]/athletes/
src/app/(admin)/admin/events/[id]/results/
src/app/(public)/eventos/[eventId]/resultados/
src/app/(public)/eventos/[eventId]/fotos/
workers/photos/
```

**Structure Decision**: La galería lee miniaturas. El original sale por una URL firmada de corta vida al pulsar descargar. El worker de fotos no bloquea la ola 2.

## Complexity Tracking

El worker de fotos es un proceso aparte dentro del mismo producto. Hace falta porque la función de Vercel no debe recibir ni transformar miles de imágenes. No es una segunda aplicación de negocio.
