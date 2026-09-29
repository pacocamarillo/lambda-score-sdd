# Contract: Acceso

Rutas de la aplicación. Las respuestas de error de credenciales usan un solo mensaje: “Correo o contraseña incorrectos.” Pedir un enlace o un restablecimiento responde lo mismo exista o no la cuenta.

## Pantallas

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/login` | Sin sesión | Correo, contraseña con mostrar/ocultar, enlace mágico, olvidé contraseña |
| `/login/magic` | Sin sesión | Pide correo y confirma el envío sin revelar si existe |
| `/auth/magic/[token]` | Sin sesión | Inicia sesión o informa que el enlace no sirve |
| `/reset` | Sin sesión | Pide correo |
| `/reset/[token]` | Sin sesión | Nueva contraseña, mínimo 8, debe coincidir |
| `/signup` | Sin sesión | Nombre de organización, subdominio, nombre, correo, contraseña |
| `/invite/[token]` | Invitada | Crea contraseña y entra con el rol |
| `/admin` | Con sesión | Panel de la membresía activa. Sin sesión redirige a `/login?next=` |
| `/admin/settings/team` | Propietaria | Lista nombre, correo, rol y estado |
| `/admin/profile` | Con sesión | Contraseña editable. Nombre y correo solo lectura |

## Reglas

- Cualquier ruta bajo `/admin` sin sesión vuelve a esa ruta después de entrar.
- El subdominio repetido o reservado no crea organización.
- `POST` de staff con la función de roles avanzados apagada responde rechazo y no inserta membresía.
- Eliminar la última propietaria responde rechazo.
