# Quickstart: Acceso, organización y permisos

## Prerequisites

- Node.js 22
- Una base PostgreSQL y `DATABASE_URL`
- `AUTH_SECRET` y una clave de Resend en el entorno local, o el adaptador de correo de prueba que escribe el enlace en el log

## Setup

```bash
npm install
npm run db:migrate
npm run dev
```

## Escenarios

1. Abrir `/signup`, crear una organización con subdominio libre y entrar a `/admin` viendo ese nombre.
2. Cerrar sesión, entrar con la contraseña equivocada y leer un único mensaje que no dice si el correo existe.
3. Pedir restablecimiento, abrir el enlace del log o del correo, guardar una clave de 8 o más caracteres y entrar solo con esa clave. La anterior falla.
4. Pedir el enlace mágico, abrirlo una vez y comprobar que el segundo uso muestra enlace inválido.
5. Con dos organizaciones, entrar en cada una y comprobar que el equipo de la otra no aparece.
6. Invitar un staff con la función de roles avanzados apagada y comprobar que no se guarda. Encender la función, asignar un evento en solo lectura y comprobar que no abre facturación ni otro evento.

El detalle de columnas está en [data-model.md](./data-model.md). Las rutas están en [contracts/auth.md](./contracts/auth.md).
