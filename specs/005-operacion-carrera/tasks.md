# Tasks: Operación de carrera

**Input**: Design documents from `/specs/005-operacion-carrera/`

**Prerequisites**: Inscripciones y pagos de 003 y 004.

## Phase 1: Setup

- [ ] T001 Crear `src/modules/race/` y el cliente R2 en `src/lib/r2.ts`

## Phase 2: Foundational

- [ ] T002 Crear `ops_record`, `result`, `result_import`, `photo` y `timing_code` en `src/db/schema/race.ts`

## Phase 3: User Story 1 - Consultar inscritos (Priority: P1)

**Goal**: Buscar, filtrar y exportar sin salir del evento.

**Independent Test**: Un folio de otro evento no aparece. La exportación respeta los filtros.

- [ ] T003 [US1] Buscar por nombre, correo, documento y folio en `src/modules/race/athletes.ts`, con filtros de kit, origen `admin_manual` | `public` y cupón
- [ ] T004 [US1] Listar en `src/app/(admin)/admin/events/[id]/athletes/page.tsx` con vista general y por competencia

## Phase 4: User Story 2 - Check-in y kit (Priority: P2)

**Goal**: Solo con pago aprobado.

**Independent Test**: Pendiente o rechazado no entrega kit.

- [ ] T005 [US2] Registrar check-in y kit en `src/modules/race/check-in.ts` rechazando pago distinto de `approved`

## Phase 5: User Story 3 - Publicar resultados (Priority: P2)

**Goal**: Importar, publicar y mostrar lugar, diferencia, vistas, descarga y certificado.

**Independent Test**: El folio inexistente no crea participante. Sin publicar no hay certificado.

- [ ] T006 [US3] Vista previa en `src/modules/race/import-results.ts` con motivos `unknown_bib` y `bad_time`
- [ ] T007 [US3] Calcular lugar y diferencia por categoría al publicar en `src/modules/race/ranking.ts`
- [ ] T008 [US3] Vistas ganadores, top 3 y completos, más descarga, en `src/app/(public)/eventos/[eventId]/resultados/page.tsx`
- [ ] T009 [US3] Certificado imprimible en `src/app/(public)/eventos/[eventId]/resultados/[bib]/certificado/page.tsx` solo si el resultado está `published`

## Phase 6: User Story 4 - Agrupar (Priority: P3)

**Goal**: Por campo del formulario o uniendo competencias con título.

**Independent Test**: Menos de dos competencias o sin título no se publica.

- [ ] T010 [US4] Guardar el grupo en `src/modules/race/groups.ts`

## Phase 7: User Story 5 - Fotos (Priority: P3)

**Goal**: Miniatura en la galería y original al descargar.

**Independent Test**: Un PNG de más de 15 MB se rechaza. La galería no exige 50 participantes.

- [ ] T011 [US5] Firmar la subida y generar la miniatura en `workers/photos/thumbnail.ts`, con tope de 5.000 fotos o 25 GB en `src/modules/race/photos.ts`
- [ ] T012 [US5] Galería en `src/app/(public)/eventos/[eventId]/fotos/page.tsx`. El original sale por URL firmada solo al descargar

## Phase 8: User Story 6 - Código de cronometraje (Priority: P3)

**Goal**: Token de un evento, revocable.

**Independent Test**: Revocado no entrega participantes. No sirve en otro evento.

- [ ] T013 [US6] Emitir y revocar en `src/modules/race/timing-code.ts` y consultar en `src/app/timing/[code]/page.tsx`

## Phase 9: Polish

- [ ] T014 Probar kit sin pago y folio inexistente en `tests/unit/race/results.test.ts`

## Dependencies

US1 es el MVP operativo. US2 y US3 son la ola 2. US4–US6 son P3. US5 no bloquea US3.

## Task counts

Total: 14. US1: 2. US2: 1. US3: 4. US4: 1. US5: 2. US6: 1.
