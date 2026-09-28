# Feature Specification: Operación de carrera

**Feature Branch**: `005-operacion-carrera`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Operar inscritos el día del evento: lista, check-in, kit, cronometraje, resultados públicos y fotos por folio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar y corregir inscritos (Priority: P1)

El equipo abre un evento y ve a los inscritos por competencia, con nombre, correo, estado de pago y folio. Puede buscar por nombre o folio, dar de alta a alguien de forma manual y corregir datos o competencia.

**Why this priority**: Antes de cronometrar hay que saber quién está anotado y poder corregir un error de mostrador.

**Independent Test**: Con tres inscripciones, buscar por folio, editar el nombre de una y crear otra manual que aparece en la misma lista.

**Acceptance Scenarios**:

1. **Given** inscripciones del evento, **When** el equipo abre la lista, **Then** ve persona, competencia, estado de pago y folio, y puede filtrar por competencia.
2. **Given** un folio o un nombre, **When** busca, **Then** la lista se reduce a las coincidencias de ese evento.
3. **Given** un alta manual completa, **When** la guarda, **Then** la persona aparece en la competencia elegida.
4. **Given** un folio duplicado en la misma competencia, **When** intenta guardarlo, **Then** no se guarda y se indica que ya está asignado.
5. **Given** un permiso de solo lectura, **When** abre la lista, **Then** consulta y no puede editar, borrar ni dar de alta.

---

### User Story 2 - Hacer check-in y entregar el kit (Priority: P2)

El día del evento, el operador marca la llegada y la entrega de kit. No entrega kit si la transferencia sigue pendiente o fue rechazada.

**Why this priority**: Es la operación de la mañana de la carrera. La lista de la historia 1 ya permite trabajar el primer evento con una planilla externa si hiciera falta, pero el producto debe cubrirlo en la ola 2.

**Independent Test**: Intentar entregar kit a un pago pendiente y comprobar que se bloquea; aprobar el pago y completar la entrega.

**Acceptance Scenarios**:

1. **Given** una inscripción confirmada, **When** el operador marca el check-in y entrega el kit, **Then** ambos quedan registrados con la persona que los hizo.
2. **Given** una transferencia pendiente o rechazada, **When** intenta entregar el kit, **Then** el sistema lo impide y explica el motivo.
3. **Given** un equipo, **When** el operador consulta el equipo, **Then** ve a los integrantes y puede registrar la entrega de cada uno según su pago.

---

### User Story 3 - Publicar resultados (Priority: P2)

El equipo importa un archivo con folios y tiempos para una competencia. El sistema muestra una vista previa, indica folios que no coinciden y publica los tiempos encontrados. La visita consulta los resultados públicos por competencia.

**Why this priority**: Publicar tiempos es la promesa de un servicio de cronometraje, inmediatamente después de la carrera.

**Independent Test**: Importar un archivo de tres folios válidos y uno inexistente, publicar los tres y verlos en la página pública de resultados.

**Acceptance Scenarios**:

1. **Given** un archivo con folio y tiempo, **When** el equipo elige la competencia y confirma, **Then** los folios encontrados quedan con su tiempo y los no encontrados se listan sin inventar un participante.
2. **Given** un tiempo con formato no reconocido, **When** se importa, **Then** esa fila se señala y no se publica un tiempo ambiguo.
3. **Given** resultados publicados, **When** una visita abre los resultados del evento, **Then** ve folio, nombre y tiempo de las competencias publicadas.
4. **Given** una reimportación, **When** el equipo confirma que sobrescribe, **Then** los tiempos de los folios incluidos se actualizan y el resto no se borra.

---

### User Story 4 - Agrupar resultados (Priority: P3)

El equipo define categorías a partir de un campo del formulario, o une varias competencias en una sola tabla pública con un título.

**Why this priority**: Mejora la lectura de resultados. La tabla simple de la historia 3 ya es publicable.

**Independent Test**: Unir dos competencias bajo un título y ver una sola tabla pública con participantes de ambas.

**Acceptance Scenarios**:

1. **Given** un campo del formulario, **When** el equipo agrupa resultados por ese campo, **Then** la vista pública separa las tablas según sus valores.
2. **Given** dos competencias y un título, **When** las une, **Then** la página pública muestra una tabla combinada con ese título.
3. **Given** un grupo sin título o con menos de dos competencias, **When** intenta guardarlo, **Then** el sistema no lo publica.

---

### User Story 5 - Subir fotos y buscarlas por folio (Priority: P3)

El equipo sube fotos del evento y pide procesarlas. La visita filtra la galería por folio y descarga las fotos encontradas. El procesamiento se pide una sola vez y puede tardar hasta 24 horas.

**Why this priority**: Es un servicio valorado y costoso de operar. No bloquea inscripciones ni resultados.

**Independent Test**: Subir fotos ya asociadas a un folio de prueba, publicarlas y encontrarlas al buscar ese folio. Una búsqueda de un folio sin fotos muestra vacío.

**Acceptance Scenarios**:

1. **Given** archivos de imagen dentro del tamaño permitido, **When** el equipo los sube, **Then** quedan en el evento pendientes de publicarse.
2. **Given** fotos listas, **When** el equipo confirma el procesamiento, **Then** el sistema avisa que puede tardar hasta 24 horas y que no se puede repetir.
3. **Given** una galería publicada, **When** una visita busca un folio, **Then** ve solo las fotos de ese folio y puede descargarlas.
4. **Given** la función de fotos no habilitada para la organización, **When** el equipo intenta usarla, **Then** ve que es una función de pago y no procesa imágenes.

---

### User Story 6 - Cronometrar con un código para el staff (Priority: P3)

El organizador genera un código de un solo evento para el staff de cronometraje. Quien lo presenta descarga los participantes, elige la competencia y sube tiempos. El organizador puede revocar el código. Compartir ese código es solo para ese staff.

**Why this priority**: Acerca la toma de tiempos a la pista. La importación de archivo cubre el cierre de la carrera.

**Independent Test**: Generar el código, usarlo para ver participantes de una competencia y comprobar que deja de funcionar al revocarlo.

**Acceptance Scenarios**:

1. **Given** un evento sin código activo, **When** el organizador genera uno, **Then** el staff puede consultar participantes y cargar tiempos de una competencia de ese evento.
2. **Given** un código revocado o vencido, **When** el staff intenta usarlo, **Then** no obtiene participantes ni puede subir tiempos.
3. **Given** un código de un evento, **When** se intenta usar en otro, **Then** no da acceso.

---

### Edge Cases

- Borrar una inscripción pide confirmación y no borra el resultado público ya asociado sin una acción distinta de quitar ese resultado.
- El alta manual de una inscripción pagada en el momento sigue las mismas reglas de folio que un pago aprobado.
- La búsqueda por folio no muestra participantes de otro evento u otra organización.
- Un archivo de resultados vacío o de otra competencia no publica tiempos.
- El escáner de folio y el trabajo sin conexión son funciones de pago: si no están habilitadas, el equipo ve el aviso y sigue pudiendo buscar y editar en línea.
- Las fotos se aceptan como imagen y con un máximo de 15 MB por archivo. Un archivo que no cumple se rechaza con el motivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El equipo autorizado MUST poder listar, buscar, crear, editar y eliminar inscripciones del evento, respetando el permiso de solo lectura.
- **FR-002**: La búsqueda MUST cubrir nombre y folio, y MUST limitarse al evento actual.
- **FR-003**: El sistema MUST rechazar folios duplicados dentro de la misma competencia.
- **FR-004**: El operador MUST poder registrar check-in y entrega de kit solo si el pago está aprobado.
- **FR-005**: El equipo MUST poder importar resultados por folio y tiempo para una competencia, con vista previa y lista de folios sin coincidencia.
- **FR-006**: Los resultados publicados MUST ser consultables sin sesión de equipo, mostrando folio y tiempo de las competencias publicadas.
- **FR-007**: El equipo MUST poder agrupar resultados por un campo del formulario y MUST poder unir dos o más competencias en una tabla pública titulada.
- **FR-008**: El equipo MUST poder subir fotos del evento y solicitar un procesamiento único, con aviso de espera de hasta 24 horas.
- **FR-009**: Una visita MUST poder filtrar las fotos publicadas por folio y descargar las coincidencias.
- **FR-010**: El organizador MUST poder emitir y revocar un código de cronometraje de un evento para que el staff consulte participantes y cargue tiempos.
- **FR-011**: Fotos, escáner de folio y operación sin conexión MUST requerir la función comercial correspondiente. Sin ella, el listado en línea sigue disponible.
- **FR-012**: Las acciones de esta spec MUST respetar el aislamiento por organización y los permisos de `001-acceso-organizacion`.

### Key Entities

- **Registro operativo**: Check-in y entrega de kit de una inscripción, con momento y responsable.
- **Resultado**: Folio, tiempo y competencia, visible según lo publicado. Puede agruparse por categoría o tabla combinada.
- **Archivo de resultados**: Carga con filas de folio y tiempo, asociada a una competencia, con filas aceptadas y rechazadas.
- **Foto**: Imagen del evento, estado de proceso y folios con los que se puede encontrar.
- **Código de cronometraje**: Acceso temporal y revocable del staff a un solo evento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El equipo encuentra a un inscrito por folio en menos de 15 segundos dentro de un evento de hasta 1,000 inscripciones.
- **SC-002**: En la prueba, el 100% de los intentos de entregar kit con pago pendiente o rechazado son bloqueados.
- **SC-003**: Una importación de 200 filas válidas queda lista para revisión en menos de 2 minutos, y ninguna fila de folio inexistente crea un participante.
- **SC-004**: Una visita sin cuenta abre los resultados publicados y localiza un folio conocido en menos de 30 segundos.
- **SC-005**: Un código de cronometraje revocado deja de dar acceso en menos de un minuto.

## Assumptions

- Depende de inscripciones y folios de `003-eventos-inscripcion` y de estados de pago de `004-pagos-cupones`.
- El cronometraje en pista puede ser manual (archivo) en la ola 2. El código para el staff es P3 y no exige un dispositivo concreto en esta spec.
- Asociar una foto a un folio puede hacerse durante el procesamiento. El detalle de reconocimiento automático se decide en el plan; la spec exige que la visita busque por folio y solo vea coincidencias publicadas.
- Los nombres públicos de resultados muestran el nombre del participante. Quien necesite ocultar nombres deberá quedar para una spec posterior; no se promete anonimato en esta versión.
- La reasignación masiva de folios de toda una competencia es una herramienta interna y se especifica en `008-facturacion-plataforma`, no aquí.
