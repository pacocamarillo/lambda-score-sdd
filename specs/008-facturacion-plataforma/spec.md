# Feature Specification: Facturación de la plataforma y operación interna

**Feature Branch**: `008-facturacion-plataforma`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "La plataforma cobra al organizador por las inscripciones del mes, y un equipo interno opera organizaciones, finanzas y herramientas de soporte."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender y pagar la factura mensual (Priority: P3)

La propietaria abre facturación y ve el periodo en curso: inscripciones contadas, precio por inscripción y total estimado. Al inicio del mes siguiente recibe la factura del mes cerrado, con vencimiento a las 72 horas. Puede pagarla y guardar un medio de pago para los meses siguientes.

**Why this priority**: Es el modelo de negocio de la plataforma, pero la ola 1 puede operar con un acuerdo comercial fuera del producto. Por eso no bloquea inscripciones.

**Independent Test**: Con inscripciones aprobadas en un mes de prueba, ver el estimado; cerrar el periodo y comprobar que la factura coincide con esas inscripciones y no con las del mes siguiente.

**Acceptance Scenarios**:

1. **Given** inscripciones con pago aprobado en el mes en curso, **When** la propietaria abre facturación, **Then** ve cuántas son, desde qué fecha, el precio por inscripción y el total estimado.
2. **Given** el cierre de mes, **When** se emite la factura, **Then** incluye solo las inscripciones de ese periodo, indica el vencimiento a las 72 horas y avisa a la organización.
3. **Given** una factura ya pagada, **When** alguien intenta pagarla de nuevo, **Then** ve que el ciclo ya fue pagado y no se genera otro cobro.
4. **Given** un medio de pago guardado para débito, **When** se emite la siguiente factura, **Then** se cobra automáticamente y la propietaria ve que el débito está activo.
5. **Given** un cambio de datos fiscales o de medio de pago, **When** se guarda, **Then** aplica a facturas futuras y no modifica las ya emitidas.

---

### User Story 2 - Bloquear por falta de pago (Priority: P3)

Si la factura no se paga en 72 horas, el sitio público de la organización deja de ofrecerse hasta que se regularice. El equipo de la organización sigue pudiendo entrar a facturación para pagar.

**Why this priority**: Es la consecuencia del modelo de cobro. Solo tiene sentido cuando la historia 1 está activa.

**Independent Test**: Dejar una factura de prueba vencida y comprobar que el sitio público no se ofrece, y que al pagarla vuelve.

**Acceptance Scenarios**:

1. **Given** una factura vencida sin pago, **When** una visita abre el sitio de esa organización, **Then** no puede inscribirse ni ver el sitio operativo.
2. **Given** ese mismo estado, **When** la propietaria entra, **Then** puede abrir facturación y pagar.
3. **Given** el pago de la factura vencida, **When** se confirma, **Then** el sitio público vuelve a estar disponible.

---

### User Story 3 - Operar la plataforma por dentro (Priority: P3)

El equipo interno de la plataforma ve organizaciones, usuarios, facturación, finanzas y herramientas de soporte. No es un rol de las organizaciones cliente.

**Why this priority**: Hace operable el negocio multi-organización. Un solo cliente piloto puede atenderse sin esta consola.

**Independent Test**: Con dos organizaciones, el equipo interno lista ambas y una propietaria cliente no encuentra esa consola.

**Acceptance Scenarios**:

1. **Given** un operador interno, **When** abre la consola, **Then** puede buscar organizaciones y ver su estado de sitio, plan y facturas.
2. **Given** una propietaria de organización, **When** intenta abrir la consola interna, **Then** no entra.
3. **Given** un pago de factura por transferencia registrado por el equipo interno, **When** lo concilia, **Then** la factura queda pagada y el sitio puede reactivarse.
4. **Given** la herramienta de reasignar folios, **When** el operador la confirma sobre una competencia, **Then** los folios se regeneran en el orden de creación de las inscripciones, se advierte que sobrescribe los actuales y no afecta otras competencias.

---

### User Story 4 - Activar funciones de pago (Priority: P3)

El equipo interno habilita para una organización las funciones de pago: analítica, comunicaciones, fotos, roles avanzados, eventos privados, cupones por lote y cargo por servicio. La organización ve la función activa o el aviso de que debe solicitarla.

**Why this priority**: Las specs 001, 004, 005 y 007 ya definen el comportamiento cuando la función está apagada. Esta historia es el interruptor.

**Independent Test**: Habilitar comunicaciones en una organización y comprobar que puede crear una campaña, mientras otra organización sigue viendo el aviso.

**Acceptance Scenarios**:

1. **Given** una función deshabilitada, **When** el equipo de la organización intenta usarla, **Then** ve cómo solicitarla y no accede al uso.
2. **Given** el equipo interno habilita la función, **When** el equipo de la organización vuelve a entrar, **Then** puede usarla según su spec.
3. **Given** una función incluida en el plan pero apagada a mano, **When** se consulta, **Then** se distingue "incluida en el plan" de "habilitada".

---

### Edge Cases

- Una inscripción rechazada o no pagada no entra en la factura al organizador.
- Cambiar el precio por inscripción aplica al periodo siguiente, no recalcula facturas ya emitidas.
- Si el débito automático falla, la factura queda pendiente, se avisa a la organización y corre el mismo plazo de 72 horas.
- Reasignar folios es irreversible desde la pantalla de la organización; solo el equipo interno lo ejecuta y queda registrado quién lo pidió.
- El bloqueo del sitio no borra inscripciones, resultados ni pagos ya capturados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST calcular un estimado del periodo en curso con las inscripciones de pago aprobado, el precio por inscripción y el total.
- **FR-002**: Al cerrar el mes, el sistema MUST emitir una factura por esas inscripciones y MUST avisar a la organización. El vencimiento MUST ser 72 horas después de la emisión.
- **FR-003**: La propietaria MUST poder pagar la factura y MUST poder guardar un medio de pago para débito de facturas futuras.
- **FR-004**: Un pago ya aplicado a una factura MUST NOT cobrarse de nuevo.
- **FR-005**: Los cambios de datos fiscales o de medio de pago MUST aplicar solo a facturas futuras.
- **FR-006**: Si la factura sigue impaga al vencer, el sistema MUST dejar de ofrecer el sitio público de esa organización hasta el pago, y MUST conservar el acceso de la propietaria a la facturación.
- **FR-007**: El equipo interno MUST poder listar organizaciones, usuarios, facturas y pagos, y MUST poder conciliar un pago externo para marcar una factura como pagada.
- **FR-008**: Una persona que no pertenece al equipo interno MUST NOT entrar a la consola interna.
- **FR-009**: El equipo interno MUST poder habilitar o deshabilitar funciones comerciales por organización, de forma independiente del plan que las incluye.
- **FR-010**: El equipo interno MUST poder reasignar los folios de una competencia en el orden de creación de las inscripciones, con confirmación explícita y sin alterar otras competencias.
- **FR-011**: Las inscripciones sin pago aprobado MUST NOT contar para la factura del organizador.

### Key Entities

- **Periodo de facturación**: Mes cerrado, con inicio, fin, cantidad de inscripciones contadas, precio unitario y total.
- **Factura de la plataforma**: Cargo de la plataforma a una organización, con estado pendiente o pagado, vencimiento y medio de pago.
- **Plan y funciones**: Conjunto de capacidades comerciales habilitadas para una organización, separado de los roles de su equipo.
- **Operador interno**: Persona de la plataforma, distinta de propietaria, administrador y staff de una organización cliente.
- **Reasignación de folios**: Acción de soporte sobre una competencia, con registro de quién la confirmó.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En un mes de prueba con 20 inscripciones pagadas y 3 no pagadas, la factura emitida cuenta 20 y el estimado del mes siguiente no las vuelve a incluir.
- **SC-002**: El 100% de las facturas de prueba muestran un vencimiento a las 72 horas de su emisión.
- **SC-003**: Una organización con factura vencida no ofrece sitio público, y lo recupera en menos de 10 minutos después de que el pago queda registrado.
- **SC-004**: En una revisión de accesos, ninguna cuenta de organización cliente abre la consola interna.
- **SC-005**: Una reasignación de folios de una competencia deja folios únicos, en orden de creación, y no modifica los folios de otra competencia.

## Assumptions

- El precio por inscripción es un acuerdo de la plataforma con la organización. El valor inicial se configura por organización y no se hereda de la marca usada como referencia.
- La moneda de la factura es el peso mexicano.
- "Sitio público deja de ofrecerse" incluye inicio, inscripción y consulta pública. El portal de una persona ya inscrita puede seguir mostrando su confirmación; no se le oculta un folio ya entregado por una deuda del organizador.
- Las funciones comerciales mencionadas viven en las specs 001, 003, 004, 005 y 007. Esta spec solo cubre quién las enciende y cómo se cobran las inscripciones.
- Un piloto de una sola organización puede posponer toda esta spec sin contradecir las olas 1 y 2.
- El medio de débito de la factura es un cobro guardado por la organización. El proveedor se elige en el plan técnico.
