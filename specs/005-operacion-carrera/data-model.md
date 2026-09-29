# Data Model: Operación de carrera

## OpsRecord

Inscripción, `checked_in_at`, `kit_delivered_at`, usuario responsable. Check-in y kit exigen pago `approved`.

## Result

Inscripción o folio de una competencia, tiempo, lugar, diferencia en segundos respecto al primero de la categoría, estado `unpublished` | `published`. La categoría sale del campo de formulario elegido o de la competencia.

## ResultImport

Competencia, filas aceptadas y rechazadas, motivo (`unknown_bib`, `bad_time`). No crea inscripciones.

## ResultGroup

Título obligatorio y al menos dos competencias, o agrupación por un campo del formulario.

## Photo

Evento, clave del original, clave de la miniatura, bytes, tipo JPG o PNG, estado `uploaded` | `published`. Folios asociados, cero o más. Tope del evento: 5.000 fotos o 25 GB.

## TimingCode

Evento, hash, revocado o vencido. No sirve en otro evento.

## Reglas

- Borrar una inscripción no quita el resultado publicado sin una acción aparte.
- El certificado solo existe para un `Result` `published`.
- Sin el paquete de procesamiento, la galería no exige 50 participantes.
