# Feature Specification: Sitio público del organizador

**Feature Branch**: `002-sitio-publico`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Sitio público de la organización: inicio, eventos, noticias, patrocinadores, contacto, menú y páginas, con la marca del organizador."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el inicio y el próximo evento (Priority: P1)

Una visita abre el sitio de la organización y ve el nombre, una frase principal, la imagen de portada y el próximo evento con fecha y lugar. Desde ahí puede ir al listado de eventos o a inscribirse en ese evento.

**Why this priority**: Es la cara pública que convierte una visita en una inscripción. Sin esto el organizador no tiene a dónde enviar a los corredores.

**Independent Test**: Publicar un evento futuro y comprobar que una visita sin cuenta lo ve en el inicio con fecha, lugar y un camino claro a la inscripción.

**Acceptance Scenarios**:

1. **Given** una organización con sitio habilitado y un evento futuro publicado, **When** alguien abre el inicio, **Then** ve marca de la organización, texto principal y ese evento como próximo.
2. **Given** varios eventos futuros, **When** se muestra el próximo, **Then** es el de fecha más cercana que siga publicado.
3. **Given** ningún evento futuro publicado, **When** alguien abre el inicio, **Then** ve un estado vacío comprensible y no un evento pasado como si fuera el próximo.
4. **Given** el inicio, **When** elige ver eventos o inscribirse, **Then** llega al listado o a la inscripción de ese evento.

---

### User Story 2 - Recorrer eventos, noticias y contacto (Priority: P1)

La visita recorre próximos y pasados, abre una noticia y encuentra correo y teléfono de la organización.

**Why this priority**: El sitio de referencia se organiza en eventos, noticias y contacto. Cubre la decisión de inscribirse y la consulta de carreras ya corridas.

**Independent Test**: Con dos eventos futuros, dos pasados y una noticia publicada, una visita sin cuenta distingue las listas y abre la noticia completa.

**Acceptance Scenarios**:

1. **Given** eventos publicados, **When** la visita abre el listado, **Then** ve próximos y pasados por separado, con fecha y lugar.
2. **Given** una noticia publicada, **When** abre su enlace, **Then** ve título, fecha, imagen si existe y contenido.
3. **Given** una noticia en borrador, **When** una visita sin permisos intenta abrirla, **Then** no la ve.
4. **Given** el pie del sitio, **When** busca contacto, **Then** ve el correo y el teléfono configurados, y los enlaces a redes que la organización haya cargado.

---

### User Story 3 - Administrar el inicio (Priority: P1)

Quien administra el sitio activa o desactiva el inicio, cambia título y descripción principal, imagen de portada, colores, patrocinadores y datos de contacto.

**Why this priority**: Cada organización debe verse como suya, no como una plantilla genérica sin datos.

**Independent Test**: Cambiar el título principal y un color, guardar, y ver el cambio en el sitio público.

**Acceptance Scenarios**:

1. **Given** un administrador del sitio, **When** guarda título, descripción, imagen y colores válidos, **Then** el inicio público usa esos datos.
2. **Given** un color que no es un código de color válido o una dirección web inválida, **When** intenta guardar, **Then** el sistema indica el campo y no publica el valor inválido.
3. **Given** el sitio deshabilitado, **When** una visita abre el inicio, **Then** no ve la página pública de la organización.
4. **Given** patrocinadores cargados, **When** una visita llega a esa sección, **Then** ve nombre e imagen de cada uno en el orden guardado.

---

### User Story 4 - Publicar noticias (Priority: P2)

El equipo crea, edita y publica noticias con título, contenido, imagen, enlace legible y fecha de publicación. Puede dejarlas en borrador.

**Why this priority**: Las noticias sostienen el sitio después del primer evento, pero el inicio y el listado de eventos ya dan valor.

**Independent Test**: Crear un borrador invisible al público, publicarlo y abrirlo por su enlace.

**Acceptance Scenarios**:

1. **Given** un borrador sin título o sin contenido, **When** intenta publicarlo, **Then** el sistema señala los campos y no lo publica.
2. **Given** un título, **When** genera el enlace, **Then** usa minúsculas, números y guiones, con un máximo de 255 caracteres, y rechaza un enlace ya usado.
3. **Given** cambios sin guardar, **When** intenta salir, **Then** puede quedarse editando o descartar los cambios.
4. **Given** una noticia publicada, **When** la elimina, **Then** deja de aparecer en el sitio tras confirmar la eliminación.

---

### User Story 5 - Armar menú y páginas (Priority: P2)

El equipo define el menú con enlaces del sistema (eventos, noticias, patrocinadores, contacto), páginas propias o direcciones externas. Las páginas se componen de bloques: párrafo, título, lista, imagen, enlaces, llamado a la acción y separador.

**Why this priority**: Permite un sitio más completo que el inicio. No es necesario para publicar el primer evento.

**Independent Test**: Crear una página con un título y un párrafo, añadirla al menú y abrirla como visita.

**Acceptance Scenarios**:

1. **Given** una página nueva, **When** agrega y reordena bloques, **Then** la vista pública respeta ese orden y omite los bloques desactivados.
2. **Given** el menú, **When** agrega un enlace externo, **Then** puede elegir abrirlo en una pestaña nueva.
3. **Given** la opción de incluir páginas publicadas automáticamente, **When** está activa, **Then** esas páginas aparecen en el menú sin agregarlas una a una.
4. **Given** una vista previa del menú, **When** el equipo la consulta, **Then** ve solo los ítems que verá la visita.

---

### Edge Cases

- Los cambios públicos pueden tardar hasta 5 minutos en verse. El panel avisa de esa espera al guardar sitio, menú o páginas.
- Una imagen de portada o de patrocinador se puede quitar sin borrar el resto de la configuración.
- El menú no muestra ítems que apunten a páginas en borrador o eliminadas.
- Si faltan correo y teléfono, la sección de contacto no muestra datos vacíos como si fueran válidos.
- El sitio de una organización no muestra eventos ni noticias de otra.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada organización MUST tener un sitio público propio, activable y desactivable, con su nombre y su marca.
- **FR-002**: El inicio MUST mostrar título, descripción, imagen de portada y el próximo evento publicado, con accesos a eventos y a la inscripción.
- **FR-003**: El listado público MUST separar eventos próximos y pasados, y MUST mostrar fecha y lugar.
- **FR-004**: El equipo MUST poder configurar colores de marca, patrocinadores, correo, teléfono y redes. El sistema MUST rechazar colores y direcciones con formato inválido.
- **FR-005**: Las noticias MUST tener borrador y publicado. Solo las publicadas MUST ser visibles sin sesión de equipo.
- **FR-006**: Una noticia MUST tener título y contenido para publicarse, enlace único de hasta 255 caracteres y fecha de publicación válida.
- **FR-007**: El menú MUST admitir enlaces de sistema, de página y externos, con orden definido por el equipo y vista previa de lo que verá la visita.
- **FR-008**: Las páginas MUST componerse de bloques reordenables y activables: párrafo, título, lista, imagen, enlaces, llamado a la acción y separador.
- **FR-009**: El sistema MUST avisar que los cambios del sitio público pueden tardar hasta 5 minutos en reflejarse.
- **FR-010**: El pie MUST mostrar el contacto configurado y el crédito de que el sitio opera sobre la plataforma, sin imponer la marca de otra organización.
- **FR-011**: El editor del sitio MUST caber en una sola pantalla, con el aviso de hasta 5 minutos y un interruptor para habilitar el inicio. MUST ofrecer la pestaña de inicio y la de noticias. El inicio MUST mostrar colores de marca (primario, secundario, acento, éxito y advertencia), la portada activable con imagen, título y descripción, los patrocinadores con logo, nombre y dirección, las redes, el teléfono, el correo y el icono de mensajería. Las noticias MUST listar artículo, fecha, estado y si aparecen en el inicio, con búsqueda, filtro de estado, rango de fechas, alta, edición y eliminación.

### Key Entities

- **Sitio de la organización**: Estado activo, texto e imagen principales, colores, patrocinadores, contacto y redes.
- **Noticia**: Título, enlace, extracto, contenido, imagen, estado y fecha de publicación. Pertenece a una organización.
- **Página**: Título, estado y lista ordenada de bloques activables.
- **Ítem de menú**: Etiqueta, destino (sistema, página o externo), orden y si abre en una pestaña nueva.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una visita sin cuenta encuentra el próximo evento y un camino a la inscripción en menos de 30 segundos desde que abre el inicio.
- **SC-002**: El 100% de las noticias en borrador revisadas en la prueba permanecen invisibles para quien no administra el sitio.
- **SC-003**: Un cambio válido de título principal es visible en el sitio público en un máximo de 5 minutos.
- **SC-004**: Una persona del equipo publica una noticia completa (título, contenido, enlace y fecha) en menos de 10 minutos en el primer intento.

## Assumptions

- Depende de `001-acceso-organizacion` para saber quién puede editar el sitio, y de `003-eventos-inscripcion` para el contenido de eventos y el destino de "inscribirse".
- El menú inicial, si el equipo no lo personaliza, ofrece eventos, noticias, patrocinadores y contacto.
- En el panel, el sitio se edita desde una sola pantalla. Lo mínimo visible es la página de inicio y las noticias. El menú y las páginas propias aparecen cuando esa capacidad está habilitada.
- El dominio propio se configura en la organización y queda descrito en `001-acceso-organizacion`.
- Las redes contempladas al inicio son las que la organización cargue como direcciones públicas; no es obligatorio tener las cuatro.
- El editor de páginas es para contenido informativo. No reemplaza la ficha del evento ni el formulario de inscripción.
- No se incluye tienda en línea ni blog con comentarios en esta spec.
