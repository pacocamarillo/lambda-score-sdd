# Research: Sitio público

## Decision: Páginas públicas como Server Components con revalidación de 300 segundos

**Rationale**: La spec pide que un cambio pueda tardar hasta 5 minutos. `revalidateTag('site:{organizationId}')` al guardar cumple el tope y evita pegarle a la base en cada visita.

**Alternatives considered**: Caché de CDN de horas (incumple SC-003), sin caché (de más para una portada).

## Decision: Imágenes de portada y patrocinadores como URL, no como binario en la base

**Rationale**: Son pocos archivos. Se suben directo al almacenamiento de objetos. El pipeline de miniaturas de carrera (feature 005) no se usa aquí.

**Alternatives considered**: Guardar el archivo en PostgreSQL, pasar la subida por la función de Vercel.

## Decision: Páginas como lista ordenada de bloques JSON

**Rationale**: Los tipos son párrafo, título, lista, imagen, enlaces, llamado a la acción y separador. Cada bloque tiene `enabled` y `position`. No hace falta un editor de HTML libre.

**Alternatives considered**: Un solo campo HTML (rompe los bloques activables), un CMS externo.

## Decision: El próximo evento se lee del módulo de eventos

**Rationale**: Hasta que exista `003`, el inicio muestra el hueco “sin eventos publicados”. El contrato de lectura es “próximo evento publicado de esta organización”, sin duplicar la ficha.
