# Data Model: Comunicaciones y analítica

## PageEvent

Organización, tipo (`view`, `unique`, `registration_visit`, `registration_completed`, `photo_download`, `photo_search`, `results`, `news`), evento opcional, día.

## Contact

Organización, nombre, correo, `unsubscribed_at` nulo si sigue activo.

## Campaign

Nombre interno, audiencia de contactos o de inscritos de un evento con competencia opcional, asunto, contenido, estado `draft` | `sending` | `sent`. Resultado: enviados, omitidos y motivo (sin folio, correo inválido, sin cupo, baja).

## MailQuota

Base mensual, consumo del periodo, fecha de reinicio, saldo comprado.

## ExternalTag

Organización. Identificador de Meta Pixel. Etiqueta y label de conversión de Google Ads. Solo se guardan con la función comercial.
