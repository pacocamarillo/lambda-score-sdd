# Data Model: Portal del participante

No hay entidad nueva de cuenta. Se usa `User` de la feature 001.

## Registration (vista)

Filtro: `email` normalizado igual al de la sesión. Muestra evento, competencia, estado de pago, lugar y folio si existe. Se separa en próxima o pasada por la fecha del evento.

## FormField.editable_by_participant

Booleano. El portal ignora la bandera en nombre, correo, campos de valor único y tipo archivo.

## Confirmation

No es una fila. Es la inscripción `confirmed` con folio, renderizada para imprimir.
