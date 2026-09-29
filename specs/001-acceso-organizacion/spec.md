# Feature Specification: Acceso, organización y permisos

**Feature Branch**: `001-acceso-organizacion`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Plataforma similar al panel de un organizador de eventos deportivos. Primera capacidad: quién entra, a qué organización pertenece y qué puede hacer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar con correo y contraseña (Priority: P1)

El propietario abre el acceso del panel, escribe su correo y su contraseña, y llega al inicio de su organización. Puede mostrar u ocultar la contraseña mientras escribe.

**Why this priority**: Sin sesión no existe panel. Es el camino diario del organizador.

**Independent Test**: Con una cuenta de propietario ya creada, iniciar sesión y ver el nombre de su organización. Cerrar sesión y comprobar que el panel vuelve a pedir acceso.

**Acceptance Scenarios**:

1. **Given** un propietario con correo y contraseña válidos, **When** envía el formulario de acceso, **Then** entra al panel de su organización.
2. **Given** un correo o contraseña incorrectos, **When** intenta entrar, **Then** permanece en el acceso y ve un mensaje de credenciales inválidas, sin indicar cuál de los dos falló.
3. **Given** una persona sin sesión, **When** abre cualquier dirección del panel, **Then** se le pide iniciar sesión y, tras hacerlo, vuelve a la dirección que intentaba abrir.
4. **Given** el campo de contraseña oculto, **When** elige mostrarla, **Then** ve el texto y puede volver a ocultarlo.

---

### User Story 2 - Entrar con enlace de correo (Priority: P1)

La persona indica su correo y pide un enlace de acceso. Al abrirlo desde el mismo correo, entra sin escribir contraseña. El enlace caduca y no puede reutilizarse.

**Why this priority**: El sitio de referencia ofrece este camino junto al de contraseña, y evita bloquear a quien no recuerda la clave.

**Independent Test**: Solicitar el enlace, abrirlo una vez con éxito y comprobar que un segundo uso del mismo enlace falla.

**Acceptance Scenarios**:

1. **Given** un correo de una cuenta existente, **When** pide el enlace, **Then** recibe un mensaje con un enlace de un solo uso y ve una confirmación de que fue enviado.
2. **Given** un enlace vigente, **When** lo abre, **Then** inicia sesión en su organización.
3. **Given** un enlace vencido o ya usado, **When** lo abre, **Then** ve que el enlace no es válido y puede pedir otro.
4. **Given** un correo sin cuenta, **When** pide el enlace, **Then** la pantalla no revela si ese correo existe.

---

### User Story 3 - Recuperar la contraseña (Priority: P1)

Quien olvidó su contraseña pide un correo de restablecimiento, elige una contraseña nueva y entra con ella.

**Why this priority**: Es el desbloqueo mínimo cuando el enlace mágico no basta o la persona prefiere contraseña.

**Independent Test**: Completar el restablecimiento y entrar solo con la contraseña nueva.

**Acceptance Scenarios**:

1. **Given** una cuenta existente, **When** pide restablecer la contraseña, **Then** recibe un enlace de un solo uso.
2. **Given** un enlace vigente, **When** define una contraseña de al menos 8 caracteres y la confirma, **Then** la contraseña anterior deja de servir y la nueva permite entrar.
3. **Given** dos contraseñas que no coinciden o una más corta que 8 caracteres, **When** intenta guardar, **Then** no cambia la contraseña y ve el motivo.

---

### User Story 4 - Crear la organización (Priority: P1)

Una persona nueva crea su organización: nombre, subdominio y sus datos como propietaria. Al terminar, es propietaria y puede entrar al panel de esa organización.

**Why this priority**: El producto es multi-organización. Sin este alta no hay un segundo organizador.

**Independent Test**: Crear una organización con un subdominio libre y ver su sitio y su panel asociados solo a ella.

**Acceptance Scenarios**:

1. **Given** un subdominio libre y con formato válido, **When** completa nombre de organización, subdominio, nombre, correo y contraseña, **Then** queda como propietaria de esa organización.
2. **Given** un subdominio ya usado o reservado, **When** intenta crearlo, **Then** se le pide otro y no se crea la organización.
3. **Given** dos organizaciones, **When** la propietaria de la primera entra, **Then** no ve eventos, equipo ni participantes de la segunda.

---

### User Story 5 - Invitar al equipo (Priority: P2)

La propietaria invita por correo a otra persona como administradora o como staff. La invitada crea su contraseña desde el correo y entra con el rol asignado.

**Why this priority**: Una organización real no la opera una sola persona, pero el primer evento puede publicarlo la propietaria sola.

**Independent Test**: Invitar a un correo nuevo, aceptar la invitación y comprobar que el menú coincide con el rol.

**Acceptance Scenarios**:

1. **Given** la propietaria, **When** invita a un correo que no está en la organización, **Then** esa persona recibe un correo para crear su contraseña y unirse con el rol elegido.
2. **Given** un administrador, **When** entra, **Then** puede operar eventos y el sitio, y no puede invitar, editar ni eliminar miembros.
3. **Given** un correo que ya pertenece a la organización, **When** se le invita de nuevo, **Then** no se duplica el miembro y se informa que ya existe.
4. **Given** una invitación pendiente, **When** la propietaria la elimina, **Then** el enlace deja de servir.

---

### User Story 6 - Limitar al staff por evento (Priority: P2)

Al invitar o editar a alguien de staff, la propietaria define si no tiene eventos, si tiene todos, si tiene solo algunos, o si tiene todos con excepciones. En cada evento el permiso es solo lectura, operador o administrador de evento.

**Why this priority**: Evita que personal de un evento vea facturación, configuración u otros eventos. No bloquea el alta del primer evento.

**Independent Test**: Un staff con un solo evento y permiso de solo lectura abre ese evento y no puede modificarlo ni abrir otro.

**Acceptance Scenarios**:

1. **Given** staff sin eventos asignados, **When** entra, **Then** no ve datos de eventos.
2. **Given** staff con un evento en solo lectura, **When** abre ese evento, **Then** consulta participantes y resultados y no puede cambiarlos ni entregar kits.
3. **Given** staff operador en un evento, **When** trabaja ese evento, **Then** puede hacer check-in, entregar kit y verificar pagos, y no puede cambiar la configuración del evento.
4. **Given** staff administrador de un evento, **When** abre ese evento, **Then** configura y opera ese evento, y sigue sin acceso a facturación de la plataforma, configuración de la organización, sitio web ni analítica.
5. **Given** un administrador o la propietaria, **When** consultan permisos, **Then** tienen acceso general a todos los eventos. Solo la propietaria guarda cambios de miembros.
6. **Given** la propietaria explorando el formulario de staff sin la función de roles avanzados habilitada, **When** intenta guardar un staff, **Then** puede ver las opciones y el sistema rechaza el guardado hasta habilitar esa función.

---

### User Story 7 - Actualizar la propia contraseña (Priority: P3)

Dentro del panel, la persona cambia su contraseña indicando la actual y la nueva dos veces. El nombre y el correo se muestran y no se editan ahí.

**Why this priority**: Mejora la cuenta ya creada; el restablecimiento por correo cubre el caso urgente.

**Independent Test**: Cambiar la contraseña desde el perfil y entrar de nuevo con la nueva.

**Acceptance Scenarios**:

1. **Given** la contraseña actual correcta y una nueva válida repetida, **When** guarda, **Then** la siguiente entrada exige la nueva contraseña.
2. **Given** el perfil, **When** intenta cambiar nombre o correo, **Then** esos campos no se pueden editar.

---

### Edge Cases

- Varios intentos fallidos de contraseña no revelan si el correo está registrado.
- Una sesión abierta en el panel deja de servir cuando la persona cierra sesión o cuando su membresía es eliminada.
- Si la propietaria es la única miembro, no puede eliminarse a sí misma ni dejar la organización sin propietaria.
- Un enlace de acceso o de invitación abierto después de eliminada la cuenta o la invitación no otorga sesión.
- Staff asignado a "todos los eventos futuros" recibe los eventos creados después de la asignación, sin un paso manual por evento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir entrar con correo y contraseña, y MUST mostrar u ocultar la contraseña a petición de la persona.
- **FR-002**: El sistema MUST rechazar credenciales inválidas con un mensaje único que no distinga correo inexistente de contraseña incorrecta.
- **FR-003**: El sistema MUST impedir el uso del panel sin sesión y MUST devolver a la persona a la pantalla solicitada después de entrar.
- **FR-004**: El sistema MUST enviar un enlace de acceso de un solo uso al correo indicado, sin revelar si ese correo tiene cuenta.
- **FR-005**: El sistema MUST permitir restablecer la contraseña mediante un enlace de un solo uso. La contraseña nueva MUST tener al menos 8 caracteres y MUST coincidir con su confirmación.
- **FR-006**: El sistema MUST permitir crear una organización con nombre y subdominio único, y MUST asignar a quien la crea el rol de propietaria.
- **FR-007**: El sistema MUST aislar los datos de cada organización: eventos, equipo, participantes, pagos y sitio público.
- **FR-008**: El sistema MUST ofrecer los roles de organización propietaria, administrador y staff, con los límites descritos en las historias 5 y 6.
- **FR-009**: Solo la propietaria MUST poder invitar, editar y eliminar miembros e invitaciones pendientes.
- **FR-010**: Para staff, el sistema MUST permitir asignación de ningún evento, todos los eventos actuales y futuros, eventos específicos, o todos con excepciones por evento.
- **FR-011**: En cada evento asignado a staff, el permiso MUST ser uno de: solo lectura, operador o administrador de evento.
- **FR-012**: Los permisos por evento MUST aplicarse solo a staff. Propietaria y administrador conservan acceso general a los eventos de su organización.
- **FR-013**: El sistema MUST impedir guardar un usuario staff cuando la función de roles avanzados no está habilitada para la organización.
- **FR-014**: Desde el perfil, la persona MUST poder cambiar su contraseña y MUST NOT poder cambiar ahí su nombre ni su correo.
- **FR-015**: El sistema MUST invalidar enlaces de acceso, restablecimiento e invitación ya usados, vencidos o revocados.
- **FR-016**: Una organización MUST poder tener más de una propietaria. El equipo se administra dentro de la configuración de la organización, con nombre, correo, rol y estado.
- **FR-017**: Después de crear la organización, el subdominio, el país y la moneda MUST NOT poder cambiarse.
- **FR-018**: El dominio propio de la organización es una función de pago. Mientras no esté habilitada, el sitio sigue en el subdominio de la plataforma.

### Key Entities

- **Usuario**: Persona con correo único en la plataforma, nombre y credencial de acceso. El correo es el identificador de entrada.
- **Organización**: Organizador con nombre y subdominio único. Es el límite de visibilidad de eventos, sitio, equipo y participantes.
- **Membresía**: Vínculo de un usuario con una organización y un rol (propietaria, administrador o staff).
- **Invitación**: Correo, rol y asignación de eventos pendientes de aceptación. Se puede revocar antes de aceptarse.
- **Permiso de evento**: Para un staff, el evento y el nivel (solo lectura, operador o administrador de evento), incluido el modo de asignación (ninguno, todos, específicos o todos con excepciones).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una propietaria con credenciales válidas entra al panel de su organización en menos de un minuto.
- **SC-002**: El 95% de los restablecimientos de contraseña iniciados con un enlace vigente se completan en el primer intento, sin asistencia.
- **SC-003**: En una prueba con dos organizaciones, ninguna persona ve datos de la organización a la que no pertenece.
- **SC-004**: Un staff de solo lectura, en una revisión de cinco tareas prohibidas (editar evento, invitar usuarios, abrir facturación, abrir otro evento, entregar kit), no completa ninguna.
- **SC-005**: Los enlaces de un solo uso dejan de otorgar acceso después de su primer uso exitoso o de su revocación, en el 100% de los casos probados.

## Assumptions

- El mercado inicial es español de México. Los correos de acceso, restablecimiento e invitación se envían en ese idioma.
- Una persona puede pertenecer a más de una organización; al entrar elige, o se le lleva a la última organización usada si solo tiene una membresía activa.
- El enlace mágico y el de restablecimiento caducan a las 24 horas.
- "Roles avanzados" es una función comercial de la organización. En la ola 1 la propietaria opera sola; el staff con permisos por evento llega en la ola 2, cuando esa función esté habilitada.
- No se exige inicio de sesión social ni verificación en dos pasos en esta spec.
- El nombre comercial del producto no forma parte de esta spec. Cada organización muestra su propio nombre en el acceso.
- El menú del panel ofrece inicio, contactos, eventos, cupones, sitio, comunicaciones, analítica, facturación, configuración y perfil. Comunicaciones y analítica se marcan como función de pago cuando no están incluidas.
