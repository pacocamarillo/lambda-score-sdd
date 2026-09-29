# Research: Cobro y cupones

## Decision: Una fila `payment` por compra, un solo `method`

**Rationale**: La spec prohíbe combinar medios. El estado `pending` de un medio bloquea abrir otro. Si el procesador rechaza, esa fila pasa a `failed` y se puede crear otra por el total, no por el resto.

**Alternatives considered**: Varias filas abiertas sumando el total (es pago combinado), un saldo a favor del intento fallido.

## Decision: Stripe Connect estándar y Mercado Pago OAuth, por separado

**Rationale**: Los fondos van a la cuenta del organizador. Conectar uno no exige el otro. Cuentas distintas por evento solo con la función comercial; si no, el evento usa la conexión de la organización.

**Alternatives considered**: Una cuenta de la plataforma que luego reparte (cambia quién cobra y el cumplimiento), un solo procesador.

## Decision: Webhook idempotente que confirma el total

**Rationale**: Se guarda el id del procesador. Un segundo aviso del mismo pago no vuelve a confirmar ni asigna otro folio. El monto del aviso tiene que coincidir con el total guardado.

**Alternatives considered**: Confirmar en el retorno del navegador (el participante puede cerrar la pestaña).

## Decision: Transferencia y efectivo no llaman al procesador

**Rationale**: Transferencia: instrucciones, comprobante, `pending` hasta que un operador aprueba o rechaza. Efectivo del día: el mismo flujo sin comprobante bancario, y no se ofrece si ya hay un pago en línea pendiente o aprobado.

**Alternatives considered**: Marcar la transferencia como pagada al subir el archivo (confirma sin revisión).

## Decision: Cupón aplicado antes de crear el pago

**Rationale**: El descuento cambia el total y ese total se cobra con un medio. El uso del cupón se reserva en la misma transacción que el pago para que dos compras simultáneas no gasten el último uso.
