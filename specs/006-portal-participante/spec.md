# Feature Specification: Portal del participante

**Feature Branch**: `006-portal-participante`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "La persona inscrita consulta sus eventos, folio, pago y confirmación, y corrige solo los datos que el organizador permite."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver mis eventos (Priority: P1)

Después de inscribirse, la persona entra y ve sus eventos, separados en próximos y pasados. En cada uno ve competencia, folio si ya existe, lugar, estado de pago y el nombre con el que se inscribió.

**Why this priority**: Es la prueba de que la inscripción sirvió. Reduce mensajes de "¿ya quedé anotado?".

**Independent Test**: Con una inscripción confirmada y una pendiente, la persona distingue ambos estados y ve el folio solo en la confirmada.

**Acceptance Scenarios**:

1. **Given** una persona con inscripciones, **When** abre su portal, **Then** ve solo las suyas, con evento, competencia y estado de pago.
2. **Given** un pago aprobado y folio asignado, **When** abre el evento, **Then** ve el folio y la confirmación.
3. **Given** un pago pendiente o rechazado, **When** abre el evento, **Then** ve ese estado y no una confirmación de participación.
4. **Given** una persona sin inscripciones, **When** abre el portal, **Then** ve un estado vacío que le indica que ahí aparecerán sus eventos.

---

### User Story 2 - Consultar el detalle y la confirmación (Priority: P2)

Dentro del evento ve descripción, datos de inscripción, adicionales elegidos y, si el pago está aprobado, la confirmación para presentarla el día de la carrera.

**Why this priority**: La lista de la historia 1 ya responde si está inscrita. La confirmación es lo que lleva a la entrega de kit.

**Independent Test**: Abrir una inscripción pagada y obtener la confirmación; abrir una pendiente y comprobar que la confirmación no está disponible.

**Acceptance Scenarios**:

1. **Given** un pago aprobado, **When** pide la confirmación, **Then** obtiene un comprobante con su nombre, evento, competencia y folio.
2. **Given** un pago no aprobado, **When** pide la confirmación, **Then** el sistema explica que estará disponible al aprobarse el pago.
3. **Given** adicionales elegidos, **When** ve el detalle, **Then** aparecen con talla o variante y cantidad. Si no eligió ninguno, ve que no hay adicionales.
4. **Given** el detalle, **When** busca cambiar adicionales, **Then** se le indica que debe pedirlo al organizador.

---

### User Story 3 - Corregir datos permitidos (Priority: P2)

La persona actualiza datos personales y respuestas del formulario que el organizador marcó como editables. No cambia su nombre, su correo ni los campos de uso único.

**Why this priority**: Evita que un teléfono mal escrito solo se pueda arreglar escribiendo al organizador, sin abrir la puerta a cambiar la identidad de la inscripción.

**Independent Test**: Editar un campo permitido y comprobar que nombre, correo y un campo de uso único siguen iguales.

**Acceptance Scenarios**:

1. **Given** un campo editable, **When** lo corrige y guarda, **Then** el organizador ve el valor nuevo en la inscripción.
2. **Given** nombre, correo o un campo de uso único, **When** intenta cambiarlos, **Then** permanecen bloqueados y se explica que debe contactar al organizador para nombre y correo.
3. **Given** un archivo ya cargado, **When** intenta reemplazarlo desde el portal, **Then** no puede y ve el archivo actual.
4. **Given** un campo obligatorio que deja vacío, **When** guarda, **Then** no se aplican los cambios y ve el error.

---

### User Story 4 - Actualizar el perfil (Priority: P3)

La persona actualiza los datos generales de su perfil. El correo se muestra y no se edita ahí.

**Why this priority**: El detalle de cada inscripción ya cubre la necesidad operativa.

**Independent Test**: Cambiar un dato editable del perfil y verlo al volver a entrar.

**Acceptance Scenarios**:

1. **Given** el perfil, **When** guarda un cambio válido, **Then** el dato queda actualizado.
2. **Given** el correo del perfil, **When** intenta modificarlo, **Then** el campo no se puede editar.

---

### Edge Cases

- Si la misma persona tiene varias inscripciones en un evento (por ejemplo, inscribió a otra y a sí misma con el mismo correo de cuenta), ve cada inscripción por separado y solo edita aquellas en las que es la titular de la cuenta.
- Una inscripción de otra persona, aunque comparta el evento, no aparece.
- Si el organizador cierra la edición de un campo después de la inscripción, el portal lo muestra como lectura.
- La confirmación no incluye datos de pago completos de la tarjeta, solo el estado y el monto pagado cuando corresponde.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Una persona autenticada MUST ver únicamente sus inscripciones, separadas en próximas y pasadas.
- **FR-002**: Cada inscripción MUST mostrar evento, competencia, estado de pago, lugar y folio cuando exista.
- **FR-003**: La confirmación MUST estar disponible solo con pago aprobado, e MUST incluir nombre, evento, competencia y folio.
- **FR-004**: El portal MUST mostrar los adicionales elegidos y MUST indicar que los cambios de adicionales se piden al organizador.
- **FR-005**: La persona MUST poder editar solo los campos que el organizador dejó editables.
- **FR-006**: Nombre, correo y campos de uso único MUST NOT ser editables por la persona en el portal.
- **FR-007**: Los archivos cargados en la inscripción MUST verse y MUST NOT reemplazarse desde el portal.
- **FR-008**: El portal MUST NOT mostrar inscripciones de otras personas ni de otras organizaciones ajenas a esa cuenta.

### Key Entities

- **Cuenta del participante**: La misma identidad de acceso de la plataforma, usada aquí para ver inscripciones propias.
- **Inscripción propia**: Vista de una inscripción cuyo correo titular coincide con la cuenta, con estado de pago, folio, respuestas y adicionales.
- **Confirmación**: Comprobante descargable o imprimible de una inscripción con pago aprobado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona con al menos una inscripción encuentra su estado de pago en menos de 30 segundos después de entrar.
- **SC-002**: En la prueba, ninguna cuenta ve inscripciones cuyo correo titular no es el suyo.
- **SC-003**: El 100% de las inscripciones con pago no aprobado de la prueba ocultan la confirmación de participación.
- **SC-004**: Un cambio en un campo editable es visible para el organizador en menos de un minuto, y nombre y correo permanecen iguales.

## Assumptions

- Entrar al portal usa el mismo acceso de `001-acceso-organizacion`. Quien se inscribió con un correo y no tiene contraseña puede usar el enlace de acceso.
- "Sus inscripciones" significa las registradas con el correo de la cuenta. Inscribir a un tercero con otro correo no le da a la cuenta la edición de esa tercera persona.
- Depende de `003-eventos-inscripcion`, `004-pagos-cupones` y, para el folio visible, de la asignación definida en esas specs.
- No hay mensajes entre participante y organizador dentro del portal. El contacto es el publicado en el sitio.
