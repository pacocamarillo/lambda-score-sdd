# Data Model: Eventos, competencias e inscripción

## Event

Organización, nombre, fecha, lugar, descripción, aviso en HTML solo durante la inscripción. Estado `draft` | `published` | `cancelled`. `registration_open`. `registration_deadline`. `is_free`. Imagen y miniatura (PNG, JPG o GIF, hasta 3 MB). Secuencia de folio: alcance `event` o `competition`, inicio y prefijo. `show_bib_on_confirmation`. Evento privado con código de acceso solo si la función comercial está activa. No se borra si tiene inscripciones.

## Competition

Evento, nombre, hora de inicio, precio en centavos MXN, cupo nulo si es ilimitado, modo `individual` o `team`. Si es equipo: mínimo de integrantes, nombre de equipo opcional u obligatorio, precio `per_person` o `per_team`. Artículos incluidos, color de folio. `cash_on_event` solo como medio exclusivo (lo aplica la feature 004).

## Registration

Competencia, correo del titular, nombre, apellido, fecha de nacimiento, tipo de documento (`ine`, `curp`, `rfc`, `other`) y número. Estado `pending_payment` | `confirmed` | `cancelled`. Origen `public` o `admin_manual`. Folio nulo hasta asignarse, único en el alcance configurado. Respuestas JSON. Aceptación de términos y renuncia obligatoria en el alta pública.

## Team

Competencia de equipo, nombre, inscripciones hijas. El precio de equipo se cobra una vez en la compra de la feature 004.

## FormField

Tipo `text`, `number`, `select`, `radio`, `textarea`, `file`, `heading`. Obligatorio, único en el evento, competencias aplicables. El archivo guarda la clave privada, no el binario en la base.

## AddOn

Nombre, opciones, precio, stock, obligatorio, visible para inscripciones nuevas, competencias. Ocultarlo no borra las elecciones ya hechas (`registration_add_on`).

## Transitions

- Borrador incompleto no pasa a `published`.
- Envío público con precio crea `pending_payment` y no asigna folio.
- Envío en evento gratuito crea `confirmed` y asigna folio si la secuencia está activa.
- Cancelar el evento cierra la inscripción pública.
