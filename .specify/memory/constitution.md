# Constitución de la Plataforma de Eventos Deportivos

## Core Principles

### I. Especificar el valor, no la implementación

Cada capacidad se describe por lo que la persona puede lograr y cómo se comprueba. Los documentos de especificación no fijan lenguajes, frameworks, bases de datos ni contratos internos. Esas decisiones pertenecen al plan técnico de cada feature.

### II. Historias independientes y priorizadas

Toda historia debe poder demostrarse sola. La prioridad P1 es el mínimo que entrega valor a un organizador y a un participante. P2 completa la operación diaria. P3 acerca la paridad con la plataforma de referencia (planes comerciales, analítica avanzada, facturación de la plataforma y herramientas internas). No se implementa una historia P3 antes de que las P1 de las que depende estén aceptadas.

### III. Aislamiento por organización

Cada organizador es una organización con su propio sitio público, eventos, participantes, pagos y equipo. Un miembro de una organización no ve datos de otra. El participante solo ve sus propias inscripciones.

### IV. El pago confirma la inscripción

Una inscripción no queda confirmada hasta que el pago correspondiente está aprobado, salvo que el organizador registre una excepción explícita (alta manual o confirmación en efectivo). Folio, confirmación descargable y entrega de kit dependen de ese estado.

### V. Privacidad y mínimo privilegio

Los datos del participante (identidad, contacto, emergencia, comprobantes de pago y fotos asociadas a un folio) se usan solo para operar el evento. Los permisos se otorgan por rol de organización y, en el caso del staff, por evento. Solo el propietario administra al equipo.

### VI. Paridad por capacidades, no por marca

Estas especificaciones recogen capacidades observadas en un sitio público de cronometraje y gestión de eventos (septiembre 2026). No se copia nombre comercial, identidad visual, textos, imágenes ni precios de ese sitio. El producto nuevo debe poder operarse con su propia marca por organización.

### VII. Idioma y mercado por defecto

La experiencia por defecto es español de México y montos en pesos mexicanos. La organización puede mostrar su nombre, logo, colores y datos de contacto. Otros países o monedas quedan fuera hasta una especificación posterior.

## Alcance por olas

| Ola | Specs | Resultado demostrable |
| --- | --- | --- |
| 1 | 001, 002, 003 y el pago de 004 | Un organizador publica un evento y una persona se inscribe y paga |
| 2 | resto de 004, 005 y 006 | El organizador opera inscritos, resultados y el participante consulta su folio |
| 3 | 007 y 008 | Comunicación, analítica y cobro de la plataforma al organizador |

Planes y tareas generados el 2026-09-29. El stack acordado ese día (Next.js en Vercel, PostgreSQL en Neon, archivos en Cloudflare R2) está en `specs/001-acceso-organizacion/plan.md`. Las historias no lo repiten. La implementación empieza por `specs/001-acceso-organizacion`.

| Directorio | Capacidad |
| --- | --- |
| `specs/001-acceso-organizacion` | Acceso, organización y permisos del equipo |
| `specs/002-sitio-publico` | Sitio público del organizador |
| `specs/003-eventos-inscripcion` | Eventos, competencias e inscripción |
| `specs/004-pagos-cupones` | Cobro al participante y cupones |
| `specs/005-operacion-carrera` | Inscritos, cronometraje, resultados y fotos |
| `specs/006-portal-participante` | Portal del participante |
| `specs/007-comunicaciones-analitica` | Correos, medición y etiquetas de conversión |
| `specs/008-facturacion-plataforma` | Facturación al organizador y operación interna |

## Calidad de la especificación

- Cada requisito funcional es comprobable con un escenario de aceptación.
- Los criterios de éxito se miden desde la persona o el negocio, sin detalles de implementación.
- Como máximo tres marcadores de aclaración por spec. Si hay un default razonable, se documenta en Assumptions.
- Una spec no se planifica mientras su checklist `checklists/requirements.md` tenga ítems sin cumplir.

## Governance

Esta constitución prevalece sobre una spec en conflicto. Cambiar un principio exige actualizar esta versión, la fecha de enmienda y las specs afectadas antes de planificar trabajo nuevo.

El flujo de cada feature es: especificar, revisar el checklist, aclarar si hace falta, planificar, desglosar tareas e implementar. No se escribe código de producto para una feature sin spec aceptada.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-29
