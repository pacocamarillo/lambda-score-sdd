# Contract: Operación y resultados

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/admin/events/[id]/athletes` | Equipo | Búsqueda por nombre, correo, documento y folio. Filtros de kit, origen y cupón. Exportar. Vista general o por competencia |
| `/admin/events/[id]/results` | Equipo | Importar, vista previa, publicar. Enlace externo de resultados o de fotos si se configura |
| `/eventos/[eventId]/resultados` | Visita | Solo publicados. Vistas ganadores, top 3 y completos. Expandir o contraer. Descargar la vista. Certificado imprimible |
| `/eventos/[eventId]/fotos` | Visita | Miniaturas. El original se pide al descargar. Filtro de folio opcional |
| `/timing/[code]` | Staff con código | Participantes y carga de tiempos de un evento |

Kit y check-in responden rechazo si el pago no está `approved`. Un archivo vacío no publica. La subida que pasa de 15 MB, de 5.000 fotos o de 25 GB se rechaza con el motivo.
