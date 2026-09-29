# Research: Comunicaciones y analítica

## Decision: El inicio no agrega visitas ni ingresos

**Rationale**: La spec pide eventos recientes con fecha, inscripciones y estado, más accesos a crear evento, sitio y configuración, y el catálogo de funciones de pago. Las cifras viven en analítica.

**Alternatives considered**: Tarjetas de ingresos en el inicio (se descartó al revisar el panel de referencia).

## Decision: Eventos de página propios, periodos de 7, 30 y 90 días

**Rationale**: Se registra vista, visita única, descarga de foto, búsqueda de foto y pasos del recorrido hasta inscripción completada. El filtro por evento es una columna, no un producto aparte.

**Alternatives considered**: Embeber un tablero de un tercero como única fuente (la función pide el desglose concreto).

## Decision: Cupo en dos saldos

**Rationale**: `monthly_remaining` se reinicia en la fecha de la organización. `purchased_remaining` no vence. El envío descuenta primero el mensual. Si la audiencia no cabe, se envía hasta el cupo y se informa el faltante.

**Alternatives considered**: Un solo contador que borra el saldo comprado al cambiar el mes.

## Decision: La baja es de campañas, no de transaccionales

**Rationale**: Una marca `unsubscribed_at` en el contacto o en el correo omite la campaña. El aviso de pago aprobado sale por el correo de la feature 004 y no consulta esa marca.
