# Contract: Sitio público

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/` | Visita | Portada, próximo evento publicado, accesos a eventos e inscripción |
| `/eventos` | Visita | Próximos y pasados, con fecha y lugar |
| `/noticias` y `/noticias/[slug]` | Visita | Solo publicadas |
| `/paginas/[slug]` | Visita | Solo páginas publicadas y bloques activos |
| `/admin/website` | Propietaria o administrador | Portada y noticias. Menú y páginas cuando esa capacidad está encendida |
| `/admin/website/preview` | Equipo | Misma navegación que verá la visita |

Guardar portada, noticia o página invalida la etiqueta `site:{organizationId}`. El público puede seguir viendo la versión anterior como máximo 5 minutos. Colores que no son hex y URLs mal formadas se rechazan antes de guardar.
