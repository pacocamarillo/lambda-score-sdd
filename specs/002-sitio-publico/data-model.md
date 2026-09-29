# Data Model: Sitio público

## Site

Una fila por organización. Activo o inactivo. Título, descripción e imagen de portada. Colores de marca validados como hex. Patrocinadores (nombre, logo, enlace). Correo, teléfono y redes. Si `active` es falso, el host responde que el sitio no está publicado, salvo el panel.

## NewsPost

Título, slug único en la organización de hasta 255 caracteres, extracto, contenido, imagen, estado `draft` o `published`, fecha de publicación. Solo `published` se ve sin sesión de equipo. Publicar exige título, contenido, slug y fecha válida.

## Page

Título, slug, estado `draft` o `published`. Bloques ordenados: `paragraph`, `heading`, `list`, `image`, `links`, `cta`, `divider`. Cada bloque se puede desactivar sin borrarlo.

## NavItem

Orden, etiqueta y destino: ruta de sistema, página propia o URL externa. La vista previa usa los mismos ítems que verá la visita.

## Reglas

- Nada de este modelo se lee con un `organization_id` distinto del host.
- El pie usa el contacto de `Site` y un crédito fijo de la plataforma.
