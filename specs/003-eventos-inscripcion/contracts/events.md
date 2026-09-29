# Contract: Eventos e inscripción

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/admin/events` | Equipo con acceso | Lista con búsqueda, estado y fechas. Acciones: editar, participantes, página, estadísticas, resultados y fotos, cronometrar |
| `/admin/events/[id]` | Equipo | Resumen: fecha, cierre, inscripción abierta, medios activos. Pestañas de información, competencias, adicionales, formulario |
| `/eventos/[eventId]` | Visita | Ficha publicada. Sin inscripción si está cerrada, en borrador o cancelada |
| `/eventos/[eventId]/inscripcion` | Visita | Competencia con cupo, formulario, términos. Al enviar, resumen pendiente de pago o confirmación si es gratuito |

## Reglas

- Publicar exige nombre, fecha, lugar y al menos una competencia con precio.
- Competencia llena o cupo no consultable no crea inscripción ni cobra.
- Campos base obligatorios: nombre, apellido, fecha de nacimiento, documento y correo.
- `assignBib(registrationId)` es la única escritura de folio y la llama el pago aprobado o el evento gratuito.
