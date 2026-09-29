# Research: Eventos, competencias e inscripción

## Decision: Cupo con transacción y bloqueo de la fila de competencia

**Rationale**: Dos inscripciones simultáneas no pueden pasar el cupo. Se cuenta las inscripciones no canceladas dentro de la transacción y se rechaza la N+1.

**Alternatives considered**: Reservar en memoria, comprobar el cupo solo en la interfaz.

## Decision: Publicar e inscribir son columnas distintas

**Rationale**: `status` es `draft`, `published` o `cancelled`. `registration_open` es booleano. Un evento publicado con inscripción cerrada sigue en el sitio y no acepta registros.

**Alternatives considered**: Un solo estado que mezcle visibilidad y venta.

## Decision: El folio no se asigna en esta feature si hay precio

**Rationale**: El principio IV exige pago aprobado. `assignBib` se exporta para que la feature 004 lo llame al aprobar. El evento gratuito llama `assignBib` al enviar el formulario.

**Alternatives considered**: Asignar el folio al enviar el formulario y liberarlo si el pago falla (deja huecos y folios en inscripciones no confirmadas).

## Decision: Respuestas del formulario en JSON y definición de campos en filas

**Rationale**: Los tipos son texto, número, lista, opción única, texto largo, archivo y separador. Un campo puede ser obligatorio, único en el evento y aplicar a todas las competencias o a una lista.

**Alternatives considered**: Una columna física por campo (no cabe en un formulario variable).
