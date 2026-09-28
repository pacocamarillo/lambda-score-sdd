# Feature Specification: Pagos del participante y cupones

**Feature Branch**: `004-pagos-cupones`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Cobrar la inscripción con tarjeta o transferencia, verificar comprobantes, y aplicar cupones de descuento."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pagar con tarjeta y quedar confirmado (Priority: P1)

Durante la inscripción, la persona paga el total con tarjeta. Si el pago se aprueba, la inscripción queda confirmada y ve la confirmación. Si falla, no queda confirmada y puede reintentar.

**Why this priority**: Es el cierre de la ola 1 junto con la inscripción. El participante necesita una forma de pago que confirme al momento.

**Independent Test**: Inscribirse a una competencia de precio conocido, pagar con un medio de prueba aprobado y ver la inscripción confirmada por ese monto.

**Acceptance Scenarios**:

1. **Given** una inscripción lista para pago y el cobro con tarjeta habilitado, **When** el pago se aprueba, **Then** la inscripción queda confirmada por el total mostrado antes de pagar.
2. **Given** un pago rechazado o cancelado, **When** vuelve al evento, **Then** la inscripción no queda confirmada y puede intentar de nuevo.
3. **Given** el resumen antes de pagar, **When** hay varios participantes o adicionales, **Then** ve el desglose y el total, y ese total es el que se cobra.
4. **Given** un pago ya confirmado, **When** intenta pagarlo otra vez, **Then** el sistema informa que ya está pagado y no genera un segundo cobro.

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

### User Story 3 - Elegir medios de pago del evento (Priority: P2)

El organizador activa, por evento, cobro con tarjeta y transferencia. Ve un resumen de precios por competencia y de adicionales antes de publicar.

**Why this priority**: La ola 1 puede operar con ambos medios encendidos por defecto. Elegir por evento evita ofrecer una forma de pago que el organizador no puede conciliar.

**Independent Test**: Desactivar la tarjeta en un evento y comprobar que la inscripción solo ofrece transferencia.

**Acceptance Scenarios**:

1. **Given** un evento, **When** el organizador deja solo un medio activo, **Then** la inscripción pública ofrece únicamente ese medio.
2. **Given** ningún medio activo y un precio mayor a cero, **When** intenta publicar, **Then** el sistema no publica hasta que haya forma de pagar o el precio sea cero.
3. **Given** la organización sin un medio de tarjeta conectado, **When** intenta activar el cobro con tarjeta, **Then** se le indica que primero debe conectar el cobro en la configuración de la organización.

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

- Un cupón que deja un saldo a pagar en efectivo el día del evento debe mostrarse como pendiente de efectivo y no como inscripción ya saldada, salvo que el organizador confirme ese pago.
- Quitar el cupón antes de pagar restaura el total original.
- El límite de usos se reserva al confirmar el pago, no al teclear el código, para que un intento abandonado no agote el cupón.
- Aprobar dos veces el mismo comprobante no confirma dos veces ni duplica el folio.
- Los montos se muestran en pesos mexicanos, con el total que la persona va a pagar visible antes de confirmar.
- El organizador conecta el cobro con tarjeta de la organización una sola vez y luego lo habilita por evento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La inscripción de precio mayor a cero MUST ofrecer al menos un medio de pago activo del evento antes de publicarse.
- **FR-002**: El pago con tarjeta aprobado MUST confirmar la inscripción por el total aceptado en el resumen. Un pago fallido MUST NOT confirmarla.
- **FR-003**: El sistema MUST impedir un segundo cobro de una inscripción ya pagada.
- **FR-004**: La transferencia MUST dejar la inscripción pendiente hasta que un operador la apruebe o la rechace, y MUST notificar a la persona en ambos casos.
- **FR-005**: El participante MUST poder adjuntar el comprobante y MUST ver las instrucciones de transferencia cuando ese medio está activo.
- **FR-006**: Aprobar o rechazar el pago de un equipo MUST aplicar a todos sus integrantes, con confirmación previa al organizador.
- **FR-007**: El organizador MUST poder activar o desactivar tarjeta y transferencia por evento.
- **FR-008**: El sistema MUST mostrar el desglose de competencia, adicionales y descuento antes del pago, y MUST cobrar ese total.
- **FR-009**: Un cupón MUST ser de porcentaje o monto fijo, MUST aplicar a inscripción, adicionales o ambos, y MUST consumirse por participante o por compra, según su configuración.
- **FR-010**: El sistema MUST rechazar cupones vencidos, agotados, no aplicables a la competencia o con código inválido, e informar el motivo.
- **FR-011**: Después del primer uso, el tipo y la modalidad del cupón MUST NOT cambiarse.
- **FR-012**: Los lotes de cupones y su exportación MUST estar disponibles solo cuando la función comercial de lotes está habilitada.
- **FR-013**: El organizador MUST poder consultar usos y ahorro de los cupones de su organización.

### Key Entities

- **Pago**: Monto, medio (tarjeta o transferencia), estado (pendiente, aprobado, rechazado) e inscripción o compra a la que pertenece. El comprobante acompaña a la transferencia.
- **Compra**: Una o más inscripciones pagadas juntas, con un total y, si aplica, un cupón.
- **Cupón**: Código, beneficio, conceptos a los que aplica, modalidad, eventos y competencias, límite de usos, usos realizados y vencimiento.
- **Lote de cupones**: Conjunto de códigos creados juntos con las mismas condiciones y límites independientes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona que paga con tarjeta aprobada ve su inscripción confirmada en menos de un minuto desde que autoriza el pago.
- **SC-002**: El monto cobrado coincide con el total mostrado en el resumen en el 100% de las compras de prueba, incluidos descuentos y adicionales.
- **SC-003**: Ningún comprobante rechazado de la prueba deja la inscripción confirmada ni permite entrega de kit.
- **SC-004**: Un cupón con límite de un uso, aplicado en dos compras simultáneas, confirma el descuento en una sola de ellas.
- **SC-005**: El organizador aprueba un comprobante pendiente y la persona recibe el aviso de confirmación en menos de 5 minutos.

## Assumptions

- "Tarjeta" es un cobro en línea con confirmación inmediata. El proveedor concreto se elige en el plan técnico. La organización conecta ese cobro una vez en su configuración.
- La transferencia es manual: la persona paga fuera de la plataforma y el equipo verifica el comprobante. No hay conciliación bancaria automática en esta spec.
- La moneda es el peso mexicano.
- Un precio cero confirma la inscripción sin pago, si el organizador publicó la competencia así.
- Depende de `003-eventos-inscripcion` para la inscripción y de `001-acceso-organizacion` para quién puede aprobar pagos (propietaria, administrador o staff operador y administrador de evento).
- El saldo "pendiente en efectivo" existe como estado visible, y la confirmación de ese efectivo la hace el equipo. No es un tercer medio de cobro en línea.
