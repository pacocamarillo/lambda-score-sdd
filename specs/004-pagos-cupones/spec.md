# Feature Specification: Pagos del participante y cupones

**Feature Branch**: `004-pagos-cupones`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Cobrar la inscripción con varias formas de pago a la vez, como Stripe, Mercado Pago y transferencia bancaria, verificar comprobantes, y aplicar cupones de descuento."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir un medio y pagar en línea (Priority: P1)

Durante la inscripción, la persona ve los medios activos del evento y elige uno. Si elige Stripe o Mercado Pago, paga el total en ese momento. Si el pago se aprueba, la inscripción queda confirmada. Si falla, no queda confirmada y puede reintentar con el mismo medio o con otro que el evento ofrezca.

**Why this priority**: Es el cierre de la ola 1 junto con la inscripción. El participante necesita pagar y quedar confirmado, y el organizador necesita ofrecer más de una forma de cobro.

**Independent Test**: Con Stripe y Mercado Pago activos en el mismo evento, completar un pago de prueba en cada uno y ver la inscripción confirmada por el mismo total.

**Acceptance Scenarios**:

1. **Given** un evento con Stripe y Mercado Pago activos, **When** la persona abre el pago, **Then** ve ambos, elige uno y paga el total con ese medio. No puede dividir el monto entre los dos.
2. **Given** el medio elegido aprueba el pago, **When** termina, **Then** la inscripción queda confirmada por el total mostrado antes de pagar, sin importar si el medio fue Stripe o Mercado Pago.
3. **Given** un pago rechazado o cancelado, **When** vuelve al evento, **Then** la inscripción no queda confirmada y puede intentar de nuevo, incluso con el otro medio.
4. **Given** el resumen antes de pagar, **When** hay varios participantes o adicionales, **Then** ve el desglose y el total, y ese total es el que se cobra.
5. **Given** un pago ya confirmado, **When** intenta pagarlo otra vez, **Then** el sistema informa que ya está pagado y no genera un segundo cobro.

---

### User Story 2 - Pagar por transferencia y verificar el comprobante (Priority: P1)

Si el evento acepta transferencia, la persona ve las instrucciones, declara el pago y adjunta el comprobante. La inscripción queda pendiente. El organizador aprueba o rechaza. Al aprobar, la inscripción queda confirmada y la persona recibe aviso.

**Why this priority**: En el sitio de referencia la transferencia es un camino real de inscripción, no un extra. Muchos eventos locales cobran así.

**Independent Test**: Enviar un comprobante, ver la inscripción pendiente, aprobarla desde el panel y comprobar que pasa a confirmada.

**Acceptance Scenarios**:

1. **Given** la transferencia habilitada con instrucciones, **When** la persona envía la inscripción, **Then** ve que está pendiente de verificación y recibe aviso de ese estado.
2. **Given** un comprobante pendiente, **When** el organizador lo aprueba, **Then** la inscripción queda confirmada y la persona es notificada.
3. **Given** un comprobante pendiente, **When** el organizador lo rechaza, **Then** la inscripción no queda confirmada, la persona es notificada y no se asigna folio ni kit.
4. **Given** un equipo que paga por transferencia, **When** el organizador aprueba o rechaza, **Then** la decisión aplica a todos los integrantes y el sistema lo advierte antes de confirmar.
5. **Given** la transferencia activa sin instrucciones de pago, **When** el organizador guarda el evento, **Then** el sistema pide confirmación explícita.

---

### User Story 3 - Ofrecer varios medios en el mismo evento (Priority: P1)

El organizador decide, en cada evento, cuáles medios se ofrecen: Stripe, Mercado Pago, transferencia bancaria o los que estén disponibles. Puede dejar uno, dos o los tres visibles. Cada inscripción usa solo uno de ellos para el total. La inscripción muestra únicamente los activos. El organizador ve un resumen de precios por competencia y de adicionales antes de publicar.

**Why this priority**: Un evento local suele cobrar con transferencia y, a la vez, con tarjeta o con Mercado Pago. Obligar a un solo medio deja fuera a parte de los inscritos.

**Independent Test**: Activar los tres medios, comprobar que la inscripción los lista, apagar Mercado Pago y comprobar que los otros dos siguen disponibles.

**Acceptance Scenarios**:

1. **Given** Stripe, Mercado Pago y transferencia activos, **When** una persona va a pagar, **Then** ve las tres opciones, elige una y cubre el total con esa sola. Si intenta completar el resto con otro medio, el sistema no lo permite.
2. **Given** un evento, **When** el organizador deja solo un medio activo, **Then** la inscripción pública ofrece únicamente ese medio.
3. **Given** ningún medio activo y un precio mayor a cero, **When** intenta publicar, **Then** el sistema no publica hasta que haya forma de pagar o el precio sea cero.
4. **Given** la organización sin Stripe conectado, **When** intenta activarlo en un evento, **Then** se le indica que primero debe conectar Stripe en la configuración. Lo mismo aplica a Mercado Pago, de forma independiente.
5. **Given** un medio nuevo agregado más adelante, **When** el organizador lo activa en un evento, **Then** aparece junto a los que ya estaban, sin reemplazarlos.

---

### User Story 4 - Aplicar un cupón (Priority: P2)

El participante ingresa un código y ve el nuevo total antes de pagar. El organizador crea cupones de porcentaje o monto fijo, sobre la inscripción, los adicionales o ambos, por participante o por compra, con límite de usos y vencimiento, para todos los eventos o para competencias concretas.

**Why this priority**: Los cupones son habituales, pero se puede correr el primer evento al precio de lista.

**Independent Test**: Crear un cupón del 10% para una competencia, aplicarlo en la inscripción y pagar el total ya descontado. El uso queda contado.

**Acceptance Scenarios**:

1. **Given** un cupón vigente y aplicable, **When** el participante lo aplica, **Then** ve el descuento y el total nuevo, y el cobro usa ese total.
2. **Given** un código vencido, agotado, de otra competencia o inexistente, **When** lo aplica, **Then** no cambia el total y ve el motivo.
3. **Given** un cupón por compra, **When** una compra inscribe a varias personas, **Then** el descuento se aplica una vez y consume un uso.
4. **Given** un cupón por participante, **When** la compra incluye varias personas, **Then** cada participante elegible consume un uso.
5. **Given** un cupón ya usado al menos una vez, **When** el organizador intenta cambiar el tipo o la modalidad, **Then** el sistema no lo permite y le indica crear otro cupón.
6. **Given** un cupón compartido entre eventos, **When** se edita, **Then** el sistema advierte que el cambio afecta a todos esos eventos.

---

### User Story 5 - Crear muchos cupones y exportarlos (Priority: P3)

Con la función comercial correspondiente, el organizador genera un lote de códigos aleatorios o numerados, los copia o descarga, y exporta el listado filtrado.

**Why this priority**: Útil para patrocinadores que reparten códigos. No hace falta para un cupón de lanzamiento.

**Independent Test**: Generar un lote de 5 códigos y comprobar que cada uno descuenta según las mismas reglas y tiene su propio límite de usos.

**Acceptance Scenarios**:

1. **Given** la función de lotes deshabilitada, **When** intenta crear varios códigos, **Then** el sistema explica que requiere esa función y no crea el lote.
2. **Given** un lote válido, **When** lo crea, **Then** obtiene los códigos, puede copiarlos o descargarlos, y cada código respeta descuento, alcance y límite propios.
3. **Given** códigos que ya existen, **When** el lote los repetiría, **Then** no crea duplicados e informa cuáles chocan.

---

### Edge Cases

- Un cupón reduce el total, y ese total se paga con un solo medio. No parte el resto entre Stripe, Mercado Pago, transferencia o efectivo.
- Quitar el cupón antes de pagar restaura el total original.
- El límite de usos se reserva al confirmar el pago, no al teclear el código, para que un intento abandonado no agote el cupón.
- Aprobar dos veces el mismo comprobante no confirma dos veces ni duplica el folio.
- Los montos se muestran en pesos mexicanos, con el total que la persona va a pagar visible antes de confirmar.
- El organizador conecta Stripe y Mercado Pago una vez en la organización y después elige, en cada evento, cuáles de esos medios y la transferencia quedan visibles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La inscripción de precio mayor a cero MUST ofrecer al menos un medio de pago activo del evento antes de publicarse.
- **FR-002**: Un pago aprobado en Stripe o en Mercado Pago MUST confirmar la inscripción por el total aceptado en el resumen. Un pago fallido MUST NOT confirmarla.
- **FR-003**: El sistema MUST impedir un segundo cobro de una inscripción ya pagada.
- **FR-004**: La transferencia MUST dejar la inscripción pendiente hasta que un operador la apruebe o la rechace, y MUST notificar a la persona en ambos casos.
- **FR-005**: El participante MUST poder adjuntar el comprobante y MUST ver las instrucciones de transferencia cuando ese medio está activo.
- **FR-006**: Aprobar o rechazar el pago de un equipo MUST aplicar a todos sus integrantes, con confirmación previa al organizador.
- **FR-007**: El sistema MUST ofrecer al menos Stripe, Mercado Pago y transferencia bancaria, y MUST permitir tener más de uno activo en el mismo evento. Cada inscripción o compra MUST pagarse por completo con un solo medio. El sistema MUST NOT combinar medios ni aceptar un pago parcial en uno y el resto en otro. Incorporar otro medio MUST NOT obligar a quitar los existentes.
- **FR-008**: El sistema MUST mostrar el desglose de competencia, adicionales y descuento antes del pago, y MUST cobrar ese total.
- **FR-009**: Un cupón MUST ser de porcentaje o monto fijo, MUST aplicar a inscripción, adicionales o ambos, y MUST consumirse por participante o por compra, según su configuración.
- **FR-010**: El sistema MUST rechazar cupones vencidos, agotados, no aplicables a la competencia o con código inválido, e informar el motivo.
- **FR-011**: Después del primer uso, el tipo y la modalidad del cupón MUST NOT cambiarse.
- **FR-012**: Los lotes de cupones y su exportación MUST estar disponibles solo cuando la función comercial de lotes está habilitada.
- **FR-013**: El organizador MUST poder consultar usos y ahorro de los cupones de su organización, filtrar por código, evento, competencia, estado y tipo, y administrarlos también desde el evento.
- **FR-014**: La organización MUST poder conectar y desconectar Stripe y Mercado Pago por separado. Los fondos de cada uno van a la cuenta conectada de ese medio. Cada evento usa esas cuentas, salvo que la función de medios de pago por evento permita otra cuenta para ese evento.
- **FR-015**: El organizador MUST poder ocultar al participante el cargo del procesador. El cargo por servicio propio, sumado por participante, solo está disponible con la función comercial correspondiente.
- **FR-016**: Si el efectivo el día del evento está disponible, MUST ser un medio exclusivo: cubre el total de esa inscripción y no se suma a Stripe, Mercado Pago ni a la transferencia. La inscripción no queda saldada hasta que el equipo confirme ese pago.
- **FR-017**: La gestión de cupones MUST mostrar cuántos hay, cuántas veces se usaron y el ahorro acumulado. MUST filtrar por código o descripción, evento y estado (disponible, agotado o vencido) y, aparte, por competencia, tipo de descuento y concepto. Cada fila MUST mostrar código, descuento, dónde se usa, a qué aplica, usos, vencimiento y estado, y MUST permitir editar y eliminar. La exportación MUST permanecer bloqueada sin la función de lotes.

### Key Entities

- **Pago**: Monto total, un solo medio (Stripe, Mercado Pago, transferencia bancaria u otro medio habilitado) y estado (pendiente, aprobado, rechazado). Pertenece a una inscripción o a una compra. El comprobante acompaña a la transferencia. Una compra no tiene dos medios.
- **Compra**: Una o más inscripciones pagadas juntas, con un total y, si aplica, un cupón.
- **Cupón**: Código, beneficio, conceptos a los que aplica, modalidad, eventos y competencias, límite de usos, usos realizados y vencimiento.
- **Lote de cupones**: Conjunto de códigos creados juntos con las mismas condiciones y límites independientes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona que paga con Stripe o con Mercado Pago y recibe la aprobación ve su inscripción confirmada en menos de un minuto desde que autoriza el pago.
- **SC-002**: El monto cobrado coincide con el total mostrado en el resumen en el 100% de las compras de prueba, incluidos descuentos y adicionales.
- **SC-003**: Ningún comprobante rechazado de la prueba deja la inscripción confirmada ni permite entrega de kit.
- **SC-004**: Un cupón con límite de un uso, aplicado en dos compras simultáneas, confirma el descuento en una sola de ellas.
- **SC-005**: El organizador aprueba un comprobante pendiente y la persona recibe el aviso de confirmación en menos de 5 minutos.

## Assumptions

- Stripe y Mercado Pago son medios de cobro en línea con confirmación inmediata. La organización conecta cada uno por su cuenta. La transferencia bancaria es un tercer medio, manual. Otros medios pueden sumarse sin sustituir a estos tres.
- La transferencia es manual: la persona paga fuera de la plataforma y el equipo verifica el comprobante. No hay conciliación bancaria automática en esta spec.
- La moneda es el peso mexicano.
- Un precio cero confirma la inscripción sin pago, si el organizador publicó la competencia así.
- Depende de `003-eventos-inscripcion` para la inscripción y de `001-acceso-organizacion` para quién puede aprobar pagos (propietaria, administrador o staff operador y administrador de evento).
- El efectivo del día del evento, si el organizador lo ofrece, es un medio más y excluye a los demás en esa inscripción. La confirmación la hace el equipo. No completa un pago empezado con Stripe, Mercado Pago o transferencia.
