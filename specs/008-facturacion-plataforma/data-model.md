# Data Model: Facturación de la plataforma

## BillingPeriod

Organización, inicio, fin, inscripciones contadas (solo pago aprobado), precio unitario en centavos MXN, total.

## PlatformInvoice

Periodo, estado `pending` | `paid`, emitida en, vence a las 72 horas, id de cobro en Stripe. Un pago aplicado no genera otro. Datos fiscales y medio de pago efectivos son los vigentes al emitir; un cambio posterior no reescribe la fila.

## FeatureFlag

Organización, clave de función, `included_in_plan`, `enabled`. El uso exige `enabled`.

## PlatformOperator

Usuario con acceso a `/superadmin`. No es `owner`, `admin` ni `staff` de una organización cliente.

## BibReassignment

Competencia, operador, momento. Los folios nuevos siguen el orden de creación y no tocan otras competencias.

## Site block

Si existe una factura `pending` con vencimiento pasado, el host público responde sitio no disponible. `/admin/billing` sigue. Al pasar a `paid`, el sitio vuelve sin borrar datos.
