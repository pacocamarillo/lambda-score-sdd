# Feature Specification: Comunicaciones y analítica

**Feature Branch**: `007-comunicaciones-analitica`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "El organizador mide visitas e inscripciones y envía correos a contactos o a personas inscritas, con cupo de envíos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el resumen del panel (Priority: P2)

Al entrar al panel, el organizador ve eventos activos, inscripciones, ingresos y visitas recientes, y accesos para ir a eventos, sitio o configuración.

**Why this priority**: Orienta el trabajo diario. No es necesario para publicar el primer evento, por eso no es P1 de la ola 1.

**Independent Test**: Con un evento publicado y dos inscripciones pagadas, el resumen muestra esas cifras y el enlace abre el evento correcto.

**Acceptance Scenarios**:

1. **Given** eventos e inscripciones de la organización, **When** la propietaria abre el panel, **Then** ve totales de eventos activos, inscripciones e ingresos, y una lista de eventos recientes.
2. **Given** un staff sin acceso a analítica, **When** abre el panel, **Then** no ve métricas de visitas de toda la organización.
3. **Given** un evento reciente, **When** elige ver inscritos, **Then** llega a la lista de ese evento.

---

### User Story 2 - Medir visitas e inscripciones (Priority: P3)

Con la función de analítica habilitada, el equipo elige 7, 30 o 90 días y, si quiere, un evento. Ve vistas, visitantes distintos, y dos recorridos: de visita a inscripción completada, y de visita a fotos a búsqueda y descarga.

**Why this priority**: Ayuda a decidir promoción. El negocio puede operar sin este tablero.

**Independent Test**: Generar una visita pública, una apertura de inscripción y una inscripción completada, y verlas reflejadas en el período que las contiene.

**Acceptance Scenarios**:

1. **Given** la función habilitada, **When** el equipo filtra los últimos 7 días, **Then** las cifras corresponden solo a ese período y a la organización.
2. **Given** un filtro por evento, **When** se aplica, **Then** no se mezclan visitas de otros eventos.
3. **Given** la función no habilitada, **When** abre analítica, **Then** ve qué obtendría al activarla y no las cifras detalladas.
4. **Given** la ayuda de métricas, **When** la consulta, **Then** distingue visitas a la inscripción, inscripciones completadas y participantes, incluyendo que una compra puede anotar a varias personas.

---

### User Story 3 - Enviar una campaña (Priority: P3)

Con la función de comunicaciones habilitada, el equipo crea una campaña a contactos o a inscritos de un evento, opcionalmente de una sola competencia. Edita asunto y contenido, previsualiza con datos reales (folio, competencia, fecha), envía una prueba y después el envío masivo.

**Why this priority**: Sustituye hojas de cálculo de correos. Es posterior a tener inscritos y contacto público.

**Independent Test**: Crear un borrador a los inscritos de un evento de prueba, enviar una prueba a un correo propio y comprobar que el masivo no sale hasta pedirlo.

**Acceptance Scenarios**:

1. **Given** la función habilitada y cupo disponible, **When** envía una prueba, **Then** llega al correo indicado y consume cupo de prueba.
2. **Given** una campaña a inscritos, **When** previsualiza, **Then** ve valores de ejemplo o reales de folio, evento, fecha, lugar y competencia, sin enviar todavía.
3. **Given** inscritos sin folio en una campaña que lo requiere, **When** se prepara el envío, **Then** esas personas se omiten y el equipo ve el motivo.
4. **Given** cupo insuficiente, **When** intenta el envío masivo, **Then** no envía de más y explica cuántos faltan.
5. **Given** la función no habilitada, **When** abre comunicaciones, **Then** no crea ni envía campañas.

---

### User Story 4 - Administrar contactos y cupo de correo (Priority: P3)

El equipo busca contactos de la organización, los usa como audiencia y compra o consulta el cupo: base mensual que se reinicia y saldo comprado que no vence.

**Why this priority**: Es el soporte de las campañas, no un canal independiente en la ola 1.

**Independent Test**: Guardar dos contactos, crear una campaña solo con ellos y ver el cupo disminuir únicamente por los envíos realizados.

**Acceptance Scenarios**:

1. **Given** contactos de la organización, **When** el equipo busca por nombre o correo, **Then** ve solo los de su organización.
2. **Given** un envío de prueba o masivo, **When** se realiza, **Then** descuenta del cupo disponible.
3. **Given** el inicio del siguiente periodo, **When** se consulta el cupo, **Then** la base mensual se reinicia y el saldo comprado permanece.
4. **Given** un contacto eliminado, **When** se confirma, **Then** deja de estar disponible para campañas nuevas.

---

### User Story 5 - Medir conversiones externas (Priority: P3)

La organización configura identificadores de medición de visitas y de conversiones de inscripción. Sin la función correspondiente, no puede guardarlos.

**Why this priority**: Sirve a quien ya anuncia el evento. No afecta el cobro ni la inscripción.

**Independent Test**: Guardar un identificador válido y comprobar que una inscripción completada de prueba queda marcada como conversión según la configuración. Sin la función, el guardado se rechaza.

**Acceptance Scenarios**:

1. **Given** la función habilitada, **When** guarda los identificadores, **Then** quedan asociados a la organización.
2. **Given** la función no habilitada, **When** intenta guardarlos, **Then** el sistema informa que es una función de pago y no los activa.
3. **Given** identificadores vacíos, **When** guarda, **Then** la medición externa queda apagada sin error.

---

### Edge Cases

- Las cifras de una organización no incluyen tráfico de otra.
- Una campaña en envío no se edita como borrador; se puede consultar el resultado (enviada, parcial con errores, fallida o cancelada).
- Quien se da de baja de comunicaciones no recibe campañas masivas posteriores. Los correos de su propia inscripción (confirmación y estado de pago) sí se siguen enviando.
- El cupo incluye pruebas y envíos masivos, para que las pruebas no sean ilimitadas.
- Si el procesamiento de una campaña falla a la mitad, el estado lo indica y no reenvía en silencio a quienes ya lo recibieron.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel de la propietaria y del administrador MUST mostrar eventos activos, inscripciones, ingresos y eventos recientes de su organización.
- **FR-002**: La analítica detallada MUST estar disponible solo con la función comercial habilitada, para 7, 30 o 90 días, con filtro opcional por evento.
- **FR-003**: La analítica MUST separar vistas, visitantes, visitas a la inscripción, inscripciones completadas, participantes, y el recorrido de fotos (vista, búsqueda, descarga).
- **FR-004**: Las campañas MUST poder dirigirse a contactos elegidos o a inscritos de un evento, con filtro opcional de una competencia.
- **FR-005**: El equipo MUST poder previsualizar y enviar una prueba antes del envío masivo.
- **FR-006**: El sistema MUST omitir destinatarios sin los datos que la campaña exige, e MUST informar el motivo, incluyendo folio ausente o correo inválido.
- **FR-007**: El sistema MUST impedir envíos que superen el cupo disponible.
- **FR-008**: El cupo MUST distinguir una base mensual que se reinicia y un saldo comprado que no vence. Pruebas y envíos masivos MUST descontar cupo.
- **FR-009**: Una persona MUST poder darse de baja de campañas. Esa baja MUST NOT cancelar los avisos de su propia inscripción y pago.
- **FR-010**: Los identificadores de medición externa MUST guardarse solo con la función comercial correspondiente.
- **FR-011**: Staff sin acceso a analítica, sitio o configuración MUST NOT ver estas secciones.

### Key Entities

- **Métrica**: Conteo de una acción pública (vista, visita a inscripción, inscripción completada, búsqueda o descarga de foto) en un periodo y, si aplica, un evento.
- **Contacto**: Nombre y correo de la organización, distinto de una inscripción, usable como audiencia.
- **Campaña**: Nombre interno, audiencia, asunto, contenido, estado y resultado de envío.
- **Cupo de correo**: Base mensual, consumo del periodo, fecha de reinicio y saldo comprado.
- **Medición externa**: Identificadores opcionales para registrar visitas y conversiones de inscripción.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una organización de prueba, una inscripción completada dentro de los últimos 7 días aparece en ese periodo y no en un filtro de otro evento.
- **SC-002**: El 100% de los envíos de prueba de la campaña llegan solo al correo de prueba indicado, sin disparar el masivo.
- **SC-003**: Una campaña con cupo para 10 envíos y audiencia de 12 no envía más de 10, e informa el faltante.
- **SC-004**: Una persona dada de baja no recibe la siguiente campaña masiva y sí recibe el aviso de confirmación de su propio pago.
- **SC-005**: Un staff sin permiso de analítica no accede a las cifras detalladas en una revisión de los accesos del panel.

## Assumptions

- Toda esta spec es ola 3, salvo que el resumen simple del panel (historia 1) se muestre en cuanto existan eventos, sin esperar la analítica de pago.
- "Ingresos" del resumen son pagos aprobados de inscripciones y adicionales, no la factura que la plataforma cobra al organizador.
- El contenido de ejemplo de una campaña puede mencionar folio, evento, fecha, lugar y competencia. No incluye datos de pago ni comprobantes.
- Comprar más cupo de correo es un pago de la organización a la plataforma; el mecanismo de cobro se detalla junto con `008-facturacion-plataforma` si se prioriza. Esta spec exige que el saldo comprado no venza.
- No se incluye mensajería instantánea ni campañas a quien no es contacto ni inscrito.
