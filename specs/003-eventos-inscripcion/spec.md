# Feature Specification: Eventos, competencias e inscripción

**Feature Branch**: `003-eventos-inscripcion`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "El organizador crea eventos y competencias; una persona se inscribe, sola o en equipo, con formulario, cupos, folio y adicionales."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar un evento (Priority: P1)

El organizador crea un evento en borrador, carga nombre, fecha, lugar y descripción, agrega al menos una competencia con precio y cupo, y lo publica. El evento publicado aparece en el sitio.

**Why this priority**: Sin evento publicado no hay inscripción. Es el núcleo de la ola 1.

**Independent Test**: Crear un borrador, comprobar que no es público, publicarlo y verlo en el sitio.

**Acceptance Scenarios**:

1. **Given** un borrador con nombre, fecha, lugar y una competencia con precio, **When** lo publica, **Then** pasa a publicado y una visita lo encuentra en el sitio.
2. **Given** un borrador incompleto, **When** intenta publicarlo, **Then** el sistema indica qué falta y lo deja en borrador.
3. **Given** un evento publicado, **When** lo cancela, **Then** deja de ofrecer inscripción y se distingue de un evento solo terminado.
4. **Given** un evento con inscripciones, **When** intenta eliminarlo, **Then** el sistema lo impide y explica por qué. Sin inscripciones, pide confirmación antes de borrar.

---

### User Story 2 - Inscribirse a una competencia (Priority: P1)

Una persona abre el evento, elige competencia, completa sus datos y envía la inscripción. Si hay cupo, queda pendiente de pago o confirmada según el resultado del pago. Recibe constancia de que el registro fue recibido.

**Why this priority**: Es el acto que el sitio existe para lograr.

**Independent Test**: Con un evento publicado de una sola competencia con cupo, una persona sin cuenta previa completa la inscripción hasta la pantalla de espera de pago.

**Acceptance Scenarios**:

1. **Given** una competencia con lugares disponibles, **When** la persona completa los datos obligatorios y acepta términos y renuncia, **Then** se crea su inscripción y ve el resumen.
2. **Given** campos obligatorios vacíos o términos sin aceptar, **When** intenta continuar, **Then** no se crea la inscripción y ve qué falta.
3. **Given** una competencia llena, **When** intenta elegirla, **Then** no puede inscribirse y ve que no hay cupo.
4. **Given** la disponibilidad no se puede consultar en ese momento, **When** va a elegir competencia, **Then** se le pide reintentar antes de continuar, y no se le cobra ni se le anota de forma dudosa.

---

### User Story 3 - Configurar competencias (Priority: P1)

Dentro del evento, el organizador define competencias: nombre, precio, cupo o cupo ilimitado, y si la inscripción es individual o por equipo.

**Why this priority**: Un evento de cronometraje casi siempre tiene varias distancias. Forma parte del mismo flujo de publicación.

**Independent Test**: Crear dos competencias, una con cupo 2, y comprobar que la tercera inscripción a esa distancia es rechazada mientras la otra sigue abierta.

**Acceptance Scenarios**:

1. **Given** el editor del evento, **When** guarda una competencia con nombre y precio, **Then** aparece como opción en la inscripción pública.
2. **Given** una competencia con cupo alcanzado, **When** otra persona intenta inscribirse, **Then** el sistema la marca llena y no crea otra inscripción.
3. **Given** cambios de competencias sin guardar, **When** el organizador intenta salir, **Then** se le advierte antes de perderlos.

---

### User Story 4 - Inscribir un equipo (Priority: P2)

Para una competencia de equipo, quien inscribe indica el nombre del equipo si es obligatorio y carga a cada integrante. El equipo debe cumplir el mínimo de personas. El precio puede ser por persona o por equipo, según la competencia.

**Why this priority**: Relevantes en ciclismo y relevos, pero el primer evento puede ser individual.

**Independent Test**: Inscribir un equipo con el mínimo de integrantes y verlos agrupados bajo el mismo equipo en el panel del evento.

**Acceptance Scenarios**:

1. **Given** una competencia de equipo con mínimo de integrantes, **When** se envía con menos personas, **Then** no se confirma y se explica el mínimo.
2. **Given** el nombre de equipo obligatorio, **When** falta, **Then** no se puede continuar.
3. **Given** un equipo inscrito, **When** el organizador lo consulta, **Then** ve el nombre y la lista de integrantes.

---

### User Story 5 - Formulario, renuncia y folio (Priority: P2)

El organizador arma el formulario con campos propios, la renuncia de responsabilidad y los datos de emergencia. Al aprobarse el pago, el sistema puede asignar el folio de forma automática. El folio no se repite dentro de la competencia.

**Why this priority**: El folio es la pieza operativa del cronometraje, y llega en cuanto hay inscripciones pagadas. El formulario básico de la historia 2 cubre nombre y contacto.

**Independent Test**: Activar la asignación automática, aprobar un pago y ver un folio único en esa inscripción.

**Acceptance Scenarios**:

1. **Given** un campo marcado obligatorio, **When** el participante lo deja vacío, **Then** no puede enviar la inscripción.
2. **Given** la asignación automática activa, **When** el pago queda aprobado, **Then** la inscripción recibe un folio no usado en esa competencia.
3. **Given** un folio ya asignado, **When** alguien intenta usar el mismo en otra inscripción de la competencia, **Then** el sistema lo rechaza.
4. **Given** la renuncia obligatoria, **When** no se acepta, **Then** no hay inscripción.

---

### User Story 6 - Vender adicionales (Priority: P3)

El organizador ofrece adicionales (por ejemplo playera) con opciones, precio, stock y si son obligatorios. Puede limitarlos a ciertas competencias y ocultarlos para inscripciones nuevas sin borrarlos del historial.

**Why this priority**: Aumenta el ingreso del evento, pero no es necesario para correr la primera carrera.

**Independent Test**: Crear un adicional con stock 1, inscribir a dos personas y comprobar que la segunda ya no puede elegirlo.

**Acceptance Scenarios**:

1. **Given** un adicional obligatorio, **When** el participante no lo elige, **Then** no puede terminar la inscripción.
2. **Given** un adicional oculto, **When** una persona nueva abre la inscripción, **Then** no lo ve. Quien ya lo tenía sigue viéndolo en su inscripción.
3. **Given** un evento que ya tiene inscritos, **When** el organizador edita un adicional, **Then** el sistema advierte que el cambio afecta reportes e historial antes de guardar.
4. **Given** precio cero sin marcarlo como incluido en la competencia, **When** va a guardarlo, **Then** el sistema pide confirmación.

---

### User Story 7 - Personalizar la página del evento (Priority: P3)

El organizador configura la página pública del evento: patrocinadores y mapa o indicaciones de lugar, además de la ficha general.

**Why this priority**: Mejora la ficha, que ya existe al publicar el evento.

**Independent Test**: Agregar un patrocinador del evento y verlo solo en esa página, no en el inicio de la organización, salvo que también esté configurado ahí.

**Acceptance Scenarios**:

1. **Given** la configuración de la página del evento, **When** guarda patrocinadores y lugar, **Then** la ficha pública muestra esos datos.
2. **Given** un error al guardar, **When** ocurre, **Then** el organizador ve el fallo y puede reintentar sin perder lo ya escrito en la sesión.

---

### Edge Cases

- Reducir el cupo por debajo de las inscripciones ya hechas no borra esas inscripciones; impide nuevas hasta volver a tener lugar.
- Cambiar el precio no modifica lo ya cobrado en inscripciones anteriores.
- Un evento privado no aparece en listados públicos ni se abre sin autorización. Esta opción depende de la función comercial correspondiente y queda fuera de la ola 1.
- La inscripción se cierra cuando el organizador la cierra o cuando llega el fin de registro, aunque el evento siga publicado para consulta.
- Una persona puede inscribir a varios participantes en la misma compra. Cada uno necesita sus datos obligatorios.
- Si el organizador guarda el evento con transferencia bancaria activa y sin instrucciones, el sistema pide confirmación antes de guardar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El organizador MUST poder crear, editar, publicar, cancelar y, si no hay inscripciones, eliminar eventos de su organización.
- **FR-002**: Un evento MUST tener nombre, fecha, lugar, descripción y estado: borrador, publicado o cancelado.
- **FR-003**: El organizador MUST poder definir una o más competencias con nombre, precio y cupo limitado o ilimitado.
- **FR-004**: La inscripción pública MUST exigir elegir una competencia con cupo, completar los datos obligatorios y aceptar términos y renuncia.
- **FR-005**: El sistema MUST impedir inscripciones que superen el cupo y MUST informar cuando la competencia está llena.
- **FR-006**: El sistema MUST impedir publicar un evento sin los datos mínimos y sin al menos una competencia guardada.
- **FR-007**: Las competencias de equipo MUST exigir el mínimo de integrantes y el nombre del equipo cuando así se configure. El precio MUST poder definirse por participante o por equipo.
- **FR-008**: El organizador MUST poder agregar campos propios al formulario y marcarlos obligatorios.
- **FR-009**: Si la asignación automática está activa, el sistema MUST asignar un folio al aprobarse el pago. El organizador elige si la secuencia es única para todo el evento o independiente por competencia, con número inicial y prefijo. El folio MUST ser único dentro de ese alcance. El organizador MUST poder decidir si el folio aparece en la confirmación.
- **FR-014**: Publicar el evento y abrir la inscripción son acciones distintas. Un evento publicado con la inscripción cerrada MUST seguir visible y MUST NOT aceptar registros nuevos.
- **FR-015**: El organizador MUST poder marcar el evento como gratuito. En ese caso la inscripción se confirma sin pago.
- **FR-016**: El formulario base MUST pedir nombre, apellido, fecha de nacimiento, número de documento y correo. El documento MUST ofrecer al menos identificación oficial, clave de registro de población, registro fiscal u otro.
- **FR-017**: Un campo propio MUST poder ser texto, número, lista, opción única, texto largo, archivo o separador. MUST poder ser obligatorio, de valor único en el evento, y aplicar a todas las competencias o solo a algunas.
- **FR-018**: Una competencia MUST poder guardar hora de inicio, cupo, precio, artículos incluidos, color de folio y la opción de pago parcial en efectivo el día del evento.
- **FR-019**: El editor del evento MUST mostrar un resumen con fecha, cierre de inscripción, si la inscripción está abierta y el medio de pago en uso. Desde el listado, cada evento MUST permitir editar, ver participantes, abrir su página, ver estadísticas, abrir resultados y fotos, y cronometrar.
- **FR-010**: El organizador MUST poder ofrecer adicionales con opciones, precio, stock, carácter obligatorio y visibilidad para inscripciones nuevas, limitados a todas o a algunas competencias.
- **FR-011**: Ocultar o editar un adicional que ya fue elegido MUST NOT borrar el historial de quienes ya lo tienen.
- **FR-012**: La página pública del evento MUST mostrar la información publicada, las competencias disponibles y el camino a la inscripción mientras esta siga abierta.
- **FR-013**: El organizador MUST poder cerrar la inscripción sin despublicar la ficha del evento.

### Key Entities

- **Evento**: Nombre, fecha, lugar, descripción, estado, fin de inscripción y pertenencia a una organización. Puede ser privado cuando esa función está habilitada.
- **Competencia**: Distancia o prueba dentro del evento, con precio, cupo, tipo individual o de equipo y reglas de nombre de equipo.
- **Inscripción**: Participante anotado en una competencia, con estado de pago, datos del formulario, folio si ya fue asignado y adicionales elegidos.
- **Equipo**: Grupo de inscripciones de una competencia de equipo, con nombre opcional u obligatorio.
- **Campo de formulario**: Pregunta definida por el organizador, con obligatoriedad y tipo de respuesta.
- **Adicional**: Producto o servicio extra, con opciones, precio, stock, competencias a las que aplica y visibilidad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un organizador publica un evento de una competencia en menos de 15 minutos la primera vez, sin ayuda.
- **SC-002**: Una persona completa la inscripción individual, hasta dejarla lista para el pago, en menos de 5 minutos cuando el formulario solo pide los datos básicos.
- **SC-003**: En una prueba de cupo de N lugares, la inscripción N+1 es rechazada en el 100% de los intentos.
- **SC-004**: Dos inscripciones confirmadas de la misma competencia no reciben el mismo folio en el 100% de los casos de asignación automática.
- **SC-005**: Un evento en borrador o cancelado no ofrece inscripción pública en una revisión del sitio sin sesión.

## Assumptions

- El cobro en sí está especificado en `004-pagos-cupones`. Esta spec deja la inscripción en espera de ese resultado.
- Los datos base de la inscripción son nombre, apellido, fecha de nacimiento, documento y correo, más la aceptación configurada por el organizador. El evento puede mostrar un aviso en HTML durante el registro.
- La imagen principal y la miniatura del evento aceptan PNG, JPG o GIF de hasta 3 MB. La miniatura es opcional.
- Un evento privado, cuando la función está habilitada, exige un código de acceso para inscribirse.
- El folio se muestra al participante como número de competidor. No se reutiliza aunque una inscripción se cancele, salvo una acción explícita de reasignación que queda en la operación interna de `008-facturacion-plataforma`.
- Los eventos privados y el cargo por servicio al participante son funciones comerciales posteriores y no forman parte de la ola 1.
- La zona horaria de fechas visibles es la de México.
