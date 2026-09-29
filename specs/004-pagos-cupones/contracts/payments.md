# Contract: Pagos

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/eventos/[eventId]/pago` | Participante | Medios activos. Elige uno. Ve el total. No hay forma de partir el monto |
| `/admin/settings/payments` | Propietaria | Conectar o desconectar Stripe y Mercado Pago por separado |
| `/admin/events/[id]/payments` | Equipo | Qué medios de los conectados se muestran |
| `POST /api/webhooks/stripe` | Stripe | Idempotente. Confirma solo si el monto es el total |
| `POST /api/webhooks/mercadopago` | Mercado Pago | Igual que Stripe |
| `/admin/events/[id]/payments/review` | Operador | Aprueba o rechaza transferencia o efectivo |

## Reglas

- Si la compra ya tiene un pago `approved`, cualquier otro medio responde que ya está pagada.
- Si tiene un pago `pending`, no se abre un segundo medio.
- Un cupón vencido, agotado o de otra competencia no cambia el total y explica el motivo.
- Ocultar el cargo del procesador no cambia el total cobrado al participante.
