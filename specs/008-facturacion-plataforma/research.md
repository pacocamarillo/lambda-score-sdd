# Research: Facturación de la plataforma

## Decision: Stripe Billing distinto de Stripe Connect

**Rationale**: Connect cobra al participante y liquida al organizador. Billing cobra a la organización por usar la plataforma. Mezclarlos haría que el participante pagara la factura del organizador o al revés.

**Alternatives considered**: Un cargo manual fuera del producto para siempre (válido en el piloto, no cumple esta spec cuando se encienda), usar la misma cuenta Connect.

## Decision: Cierre de mes por trabajo programado

**Rationale**: El día de cierre cuenta inscripciones `confirmed` del periodo, emite la factura, pone vencimiento a las 72 horas y avisa. Un débito guardado se intenta entonces. Si falla, la factura queda pendiente y corre el mismo plazo.

**Alternatives considered**: Emitir la factura en el primer acceso del mes (se retrasa si nadie entra).

## Decision: Funciones como filas, no como un solo plan rígido

**Rationale**: La spec distingue “incluida en el plan” de “habilitada”. Cada función (`analytics`, `communications`, `photo_processing`, `advanced_roles`, `private_events`, `coupon_batches`, `per_event_payment_accounts`, `custom_service_fee`, `custom_domain`, `timing`) tiene las dos marcas. El equipo interno puede apagar una aunque el plan la incluya.

**Alternatives considered**: Un enum de plan que enciende un paquete cerrado (no permite el apagado manual).

## Decision: Reasignar folios solo en la consola interna

**Rationale**: Orden de creación, único, una competencia, con el usuario interno que confirmó. La pantalla de la organización no ofrece deshacer.
