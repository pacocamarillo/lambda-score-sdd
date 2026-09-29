# Research: Acceso, organización y permisos

## Decision: Monolito modular en Next.js 15 sobre Vercel

**Rationale**: Sitio público, inscripción, panel y portal comparten organización, evento, inscripción y pago. Separarlos ahora duplica sesión y permisos. El usuario ya eligió Next.js en Vercel.

**Alternatives considered**: Un servicio por spec (ocho despliegues) y un backend aparte del frontend. Se rechazan hasta que un segundo equipo opere la plataforma.

## Decision: PostgreSQL en Neon y Drizzle

**Rationale**: Acuerdo del 2026-09-29. El aislamiento por organización es una columna y una restricción, no un filtro en el cliente. Drizzle mantiene el esquema en TypeScript junto a las migraciones. Una sola base Neon sirve a las ocho features. El archivo de una foto o de un comprobante no entra en esa base: vive en Cloudflare R2 y aquí solo se guarda su clave.

**Alternatives considered**: SQLite (no sirve para varias instancias de Vercel), Prisma (más pesado para el mismo resultado), una base por organización (costo y migraciones innecesarios en el piloto).

## Decision: Auth.js con sesión en base de datos

**Rationale**: Contraseña, enlace mágico y cierre de sesión encajan en proveedores de Auth.js. La sesión en base permite invalidarla al cerrar sesión o al quitar la membresía. La contraseña se guarda con Argon2id.

**Alternatives considered**: Sesión solo en cookie cifrada (no se revoca al eliminar al miembro hasta que expire), inicio de sesión social (fuera de esta spec).

## Decision: Tokens de un solo uso en tabla propia

**Rationale**: Enlace mágico, restablecimiento e invitación comparten caducidad de 24 horas, un solo uso y revocación. Un registro con propósito (`magic`, `reset`, `invite`) cubre los tres.

**Alternatives considered**: JWT sin estado (no se puede revocar ni marcar como usado).

## Decision: Correo transaccional con Resend

**Rationale**: Los correos de acceso, restablecimiento e invitación son pocos y deben salir en español de México. Resend encaja con Vercel y no exige un servidor de correo propio.

**Alternatives considered**: SMTP de la organización (cada organizador configuraría el suyo antes de poder invitar), cola propia en la ola 1 (el volumen no lo justifica).

## Decision: Organización por subdominio

**Rationale**: El host elige la organización antes de pintar el sitio. El dominio propio es un campo opcional detrás de la función de pago; mientras no esté, se usa el subdominio. Subdominio, país y moneda no se editan después del alta.

**Alternatives considered**: Un path `/org/{slug}` (peor para el sitio público de cada marca), un despliegue por organización (costo).

## Decision: Pruebas

**Rationale**: Vitest para “no revelar si el correo existe”, “no guardar staff sin la función” y “no borrar a la última propietaria”. Playwright para el recorrido de alta, entrada y rechazo de credenciales.

**Alternatives considered**: Solo pruebas manuales (no cubren SC-003 ni SC-005 de forma repetible).
