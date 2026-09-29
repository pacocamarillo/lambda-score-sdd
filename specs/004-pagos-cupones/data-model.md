# Data Model: Cobro y cupones

## PaymentAccount

Organización, proveedor `stripe` o `mercadopago`, identificador de la cuenta conectada, cargos habilitados. Desconectar no borra pagos ya aprobados.

## EventPaymentMethod

Evento y medio `stripe` | `mercadopago` | `transfer` | `cash_on_event`. Varios pueden estar activos. `cash_on_event` solo si la competencia lo ofrece.

## Purchase

Una o más inscripciones, total en centavos MXN, desglose de competencia, adicionales y descuento. Cupón opcional.

## Payment

Una compra, un `method`, monto igual al total de la compra, estado `pending` | `approved` | `failed` | `rejected`. Id del procesador, único. Como máximo un pago `pending` o `approved` por compra. El comprobante acompaña a `transfer`.

## Coupon

Código, `percent` o `fixed`, aplica a `registration`, `addons` o `both`, consumo `per_participant` o `per_purchase`, límite, usos, vencimiento, eventos y competencias. Tras el primer uso no cambian tipo ni modalidad.

## CouponBatch

Solo con la función comercial. Códigos con las mismas condiciones y límites independientes.

## Transitions

- Aprobado en Stripe o Mercado Pago: inscripción `confirmed`, `assignBib`, aviso.
- `failed`: la compra sigue impaga y admite otro intento de un solo medio por el total.
- Transferencia o efectivo aprobados por el equipo: igual que un pago en línea aprobado.
- Rechazo de comprobante: inscripción no confirmada, sin kit.
- Aprobar el pago de un equipo confirma a todos sus integrantes.
