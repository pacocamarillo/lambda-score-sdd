# Research: Operación de carrera

## Decision: Importación con vista previa y sin altas implícitas

**Rationale**: El archivo trae folio y tiempo. El folio que no existe se lista y no crea inscripción. Un tiempo ilegible no se publica. Reimportar actualiza solo los folios presentes.

**Alternatives considered**: Crear al participante desde la fila del tiempo.

## Decision: Lugar y diferencia se calculan al publicar, por categoría

**Rationale**: La visita ve lugar, folio, nombre, tiempo y diferencia contra el primer tiempo de esa categoría. Ganadores es el primer lugar de cada categoría. Top 3 son los tres primeros. La hoja descargada repite la vista elegida.

**Alternatives considered**: Guardar el lugar a mano, calcularlo en el navegador de cada visita.

## Decision: Certificado como HTML imprimible de la organización

**Rationale**: Incluye evento, categoría, lugar, folio, nombre y tiempo. No se enlaza si los resultados siguen sin publicar. No se copia el diseño de un sitio de referencia.

**Alternatives considered**: Un PDF generado con plantilla ajena, un certificado aunque el evento no haya publicado.

## Decision: R2, miniatura previa y original bajo demanda

**Rationale**: La subida va firmada del navegador a R2. La página no usa el optimizador de imágenes de Next para miles de fotos. Asociar un folio puede ser el número en el nombre del archivo o una edición manual. El paquete de procesamiento es opcional, un solo run, y no es requisito de la galería.

**Alternatives considered**: Guardar originales en Vercel Blob y servirlos al recorrer la galería (el egreso crece con cada visita), OCR obligatorio.

## Decision: Código de cronometraje como token de un evento

**Rationale**: Quien lo presenta lee participantes y sube tiempos de ese evento. Revocarlo corta el acceso en el siguiente intento, antes de un minuto. No sustituye la importación de archivo.
