# Contract: Portal

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/panel` | Sesión | Próximas y pasadas del correo de la sesión |
| `/panel/[registrationId]` | Dueña | Estado de pago, folio, adicionales de solo lectura, campos editables |
| `/panel/[registrationId]/confirmacion` | Dueña | Solo si el pago está aprobado y hay folio |

Una ruta con inscripción de otro correo responde como no encontrada, sin filtrar datos.
