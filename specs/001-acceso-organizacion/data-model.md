# Data Model: Acceso, organización y permisos

## User

Correo único en la plataforma, en minúsculas. Nombre. Hash Argon2id de la contraseña, nulo hasta que la persona define una. TOTP opcional: secreto cifrado (`totp_secret_enc`) y `totp_enabled_at` cuando está confirmado. El nombre se edita en el perfil; el correo no.

## Organization

Nombre. Subdominio único, minúsculas, 3–63 caracteres, sin reservados (`www`, `admin`, `api`, `app`). País `MX` y moneda `MXN`, ambos inmutables. Dominio propio opcional, solo si la función comercial está activa. Descripción y logo se editan en configuración; no cambian el subdominio.

## Membership

Usuario + organización, únicos en pareja. Rol: `owner`, `admin`, `staff`. Estado: `active`, `disabled`. Una organización puede tener varias filas `owner`. No se desactiva ni se borra la última `owner` activa.

## Invitation

Correo, organización, rol, estado `pending` o `revoked`. Caduca a las 24 horas. Aceptarla crea o reutiliza el usuario y una membresía. Un correo que ya es miembro activo no genera otra membresía.

## AccessToken

Propósito `magic`, `reset`, `invite` o `login_2fa`. Hash del secreto, no el secreto en claro. Un solo uso. `magic`, `reset` e `invite` caducan a las 24 horas; `login_2fa` caduca a los 5 minutos tras contraseña válida. Se invalida si la invitación o la membresía se elimina.

## BackupCode

Usuario, hash del código de respaldo, `used_at` opcional. Se emiten al confirmar TOTP; cada código sirve una vez para entrar o desactivar 2FA.

## StaffAssignment

Solo para rol `staff`. Modo: `none`, `all`, `specific`, `all_except`. Si el modo es `all`, los eventos creados después entran solos. Guardar esta fila exige la función comercial de roles avanzados; si está apagada, el alta de staff se rechaza.

## EventPermission

Evento + nivel `viewer`, `operator` o `event_admin`. Aplica solo a staff. Lo que cada nivel puede abrir está en la tabla de roles, permisos y accesos de `spec.md`. Ninguno abre facturación de plataforma, configuración de la organización, sitio ni analítica.

## Session

Identificador de usuario y membresía activa. Si hay varias membresías activas y ninguna elegida, la entrada muestra el selector. Cerrar sesión o quitar la membresía borra las sesiones de ese par.

## Transitions

- Invitación `pending` → membresía `active`, o `revoked` sin membresía.
- Token vigente → usado. Un segundo uso falla.
- Contraseña restablecida invalida la anterior en el mismo paso.
