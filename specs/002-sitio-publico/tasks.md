# Tasks: Sitio público

**Input**: Design documents from `/specs/002-sitio-publico/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/site.md. La app de `001` ya existe.

## Phase 1: Setup

- [ ] T001 Crear el módulo `src/modules/site/` sin inicializar otro proyecto

## Phase 2: Foundational

- [ ] T002 Crear `site`, `news_post`, `page`, `page_block` y `nav_item` en `src/db/schema/site.ts` con `organization_id` obligatorio y slug único por organización de hasta 255 caracteres
- [ ] T003 [P] Invalidar la etiqueta `site:{organizationId}` al guardar, con tope de 300 segundos, en `src/modules/site/revalidate.ts`

## Phase 3: User Story 1 - Ver el inicio y el próximo evento (Priority: P1)

**Goal**: La visita ve portada y el próximo evento publicado.

**Independent Test**: Abrir `/` sin sesión y encontrar el próximo evento o el estado vacío.

- [ ] T004 [US1] Leer portada y próximo evento de la organización del host en `src/modules/site/home.ts`
- [ ] T005 [US1] Pintar `src/app/(public)/page.tsx` con título, descripción, imagen y accesos a eventos e inscripción

## Phase 4: User Story 2 - Recorrer eventos, noticias y contacto (Priority: P1)

**Goal**: Listados públicos y pie con el contacto de la organización.

**Independent Test**: Próximos y pasados se separan. El pie no muestra datos de otra organización.

- [ ] T006 [P] [US2] Separar próximos y pasados en `src/app/(public)/eventos/page.tsx`
- [ ] T007 [P] [US2] Mostrar contacto y crédito de la plataforma en `src/app/(public)/footer.tsx`

## Phase 5: User Story 3 - Administrar el inicio (Priority: P1)

**Goal**: El equipo edita marca, patrocinadores y contacto.

**Independent Test**: Un color o una URL inválidos no se guardan. Un título nuevo se ve en el público en 5 minutos o menos.

- [ ] T008 [US3] Validar hex y URLs en `src/modules/site/settings.ts`
- [ ] T009 [US3] Editar la portada en `src/app/(admin)/admin/website/page.tsx`, solo propietaria o administrador

## Phase 6: User Story 4 - Publicar noticias (Priority: P2)

**Goal**: Borrador oculto. Publicar exige título, contenido, slug y fecha.

**Independent Test**: El borrador no aparece en `/noticias` sin sesión de equipo.

- [ ] T010 [US4] Publicar solo con título, contenido, slug ≤ 255 y fecha válida en `src/modules/site/news.ts`
- [ ] T011 [US4] Listar y editar en `src/app/(admin)/admin/website/news/page.tsx` y servir `src/app/(public)/noticias/[slug]/page.tsx` solo si el estado es `published`

## Phase 7: User Story 5 - Armar menú y páginas (Priority: P2)

**Goal**: Enlaces de sistema, de página y externos. Bloques reordenables.

**Independent Test**: La vista previa coincide con lo que ve la visita. Un bloque desactivado no se pinta.

- [ ] T012 [US5] Guardar ítems y bloques en `src/modules/site/pages.ts` con tipos `paragraph`, `heading`, `list`, `image`, `links`, `cta`, `divider`
- [ ] T013 [US5] Editar en `src/app/(admin)/admin/website/pages/page.tsx` y previsualizar en `src/app/(admin)/admin/website/preview/page.tsx`

## Phase 8: Polish

- [ ] T014 Cubrir borrador invisible y slug duplicado en `tests/unit/site/publish.test.ts`

## Dependencies

US1–US3 son el MVP del sitio. US4 y US5 esperan el esquema de T002. El próximo evento real llega con la feature 003; hasta entonces el inicio usa el estado vacío.

## Task counts

Total: 14. US1: 2. US2: 2. US3: 2. US4: 2. US5: 2.
