# Tasks: Acceso, organización y permisos

**Input**: Design documents from `/specs/001-acceso-organizacion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth.md, quickstart.md

**Tests**: Incluidas solo donde el quickstart exige un resultado repetible (aislamiento, enlace de un solo uso, staff sin función).

**Organization**: Tareas por historia para poder demostrar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

**Purpose**: Esqueleto Next.js que el resto de features reutiliza.

- [x] T001 Crear `package.json` con Next.js 15, React, TypeScript, Drizzle, Auth.js, Argon2, Zod, Resend, Vitest y Playwright
- [x] T002 [P] Crear `src/app/layout.tsx` con `lang="es-MX"` y el título tomado del nombre de la organización cuando ya hay host
- [x] T003 [P] Crear `drizzle.config.ts` y `src/db/client.ts` leyendo `DATABASE_URL`
- [x] T004 [P] Crear `vitest.config.ts` y `playwright.config.ts` apuntando a `tests/unit` y `tests/e2e`

---

## Phase 2: Foundational

**Purpose**: Sesión, tenant y correo. Ninguna historia entra al panel sin esto.

- [x] T005 Crear tablas `user`, `organization`, `membership` y `session` en `src/db/schema/access.ts` según `data-model.md`: correo único en minúsculas, subdominio único, país `MX` y moneda `MXN` inmutables, rol `owner` | `admin` | `staff`
- [x] T006 [P] Resolver organización por host en `src/lib/tenant.ts`, rechazando datos de otra organización
- [x] T007 [P] Enviar correos en español de México desde `src/lib/email.ts` (enlace mágico, restablecimiento, invitación)
- [x] T008 Configurar Auth.js con sesión en base en `src/lib/auth.ts` y `src/app/api/auth/[...nextauth]/route.ts`
- [x] T009 Exigir sesión en `src/middleware.ts` para `/admin` y conservar la ruta pedida en `next`

**Checkpoint**: Hay aplicación, base y una sesión vacía. Pueden empezar las historias P1.

---

## Phase 3: User Story 1 - Entrar con correo y contraseña (Priority: P1)

**Goal**: La propietaria entra al panel y puede mostrar u ocultar la contraseña.

**Independent Test**: Credenciales válidas muestran la organización. Credenciales inválidas dejan un solo mensaje. Cerrar sesión vuelve a pedir acceso.

- [x] T010 [US1] Verificar contraseña con Argon2id en `src/modules/access/login.ts` y devolver siempre “Correo o contraseña incorrectos” si falla
- [x] T011 [US1] Construir `src/app/(auth)/login/page.tsx` con mostrar/ocultar contraseña, sin indicar cuál campo falló
- [x] T012 [US1] Tras entrar, redirigir a `next` o a `src/app/(admin)/admin/page.tsx`, que muestra el nombre de la organización activa

---

## Phase 4: User Story 2 - Entrar con enlace de correo (Priority: P1)

**Goal**: Enlace de un solo uso, 24 horas, sin revelar si el correo existe.

**Independent Test**: El primer uso entra. El segundo muestra enlace inválido. Un correo sin cuenta ve la misma confirmación de envío.

- [x] T013 [P] [US2] Crear `access_token` en `src/db/schema/access-token.ts` con propósito `magic` | `reset` | `invite`, hash del secreto, un uso y caducidad de 24 horas
- [x] T014 [US2] Emitir y consumir el enlace en `src/modules/access/magic-link.ts` con la misma respuesta exista o no la cuenta
- [x] T015 [US2] Añadir `src/app/(auth)/login/magic/page.tsx` y `src/app/auth/magic/[token]/route.ts`

---

## Phase 5: User Story 3 - Recuperar la contraseña (Priority: P1)

**Goal**: Enlace de un solo uso, clave nueva de al menos 8 caracteres que coincide con la confirmación.

**Independent Test**: La clave anterior deja de servir. Dos claves distintas o una de menos de 8 caracteres no se guardan.

- [x] T016 [US3] Restablecer en `src/modules/access/reset-password.ts`: mínimo 8 caracteres, confirmación igual, token de un uso
- [x] T017 [US3] Añadir `src/app/(auth)/reset/page.tsx` y `src/app/(auth)/reset/[token]/page.tsx` con el motivo cuando la clave no cumple

---

## Phase 6: User Story 4 - Crear la organización (Priority: P1)

**Goal**: Alta con nombre, subdominio y propietaria. Datos aislados de cualquier otra organización.

**Independent Test**: Subdominio libre crea la organización. Uno usado o reservado no. La propietaria no ve el equipo de otra.

- [x] T018 [US4] Crear la organización en `src/modules/access/create-organization.ts`: subdominio 3–63, reservados `www`, `admin`, `api`, `app`, país `MX`, moneda `MXN`, primera membresía `owner`
- [x] T019 [US4] Construir `src/app/(auth)/signup/page.tsx` y bloquear la edición posterior de subdominio, país y moneda en `src/app/(admin)/admin/settings/details/page.tsx`
- [x] T020 [US4] Cubrir el aislamiento de dos organizaciones en `tests/unit/access/isolation.test.ts`

---

## Phase 7: User Story 5 - Invitar al equipo (Priority: P2)

**Goal**: Solo la propietaria invita. Administrador opera y no administra miembros.

**Independent Test**: El correo nuevo acepta y ve el menú de su rol. Un miembro existente no se duplica. Revocar invalida el enlace.

- [x] T021 [US5] Gestionar invitaciones en `src/modules/access/invitations.ts`: un miembro activo no se duplica, revocar pasa el token a inválido, la última propietaria no se elimina
- [x] T022 [US5] Listar nombre, correo, rol y estado en `src/app/(admin)/admin/settings/team/page.tsx`, visible para escribir solo si el rol es `owner`, y mostrar ahí la tabla de roles, permisos y accesos de `spec.md` (FR-019)
- [x] T023 [US5] Aceptar en `src/app/invite/[token]/page.tsx` creando la contraseña y la membresía con el rol elegido

---

## Phase 8: User Story 6 - Limitar al staff por evento (Priority: P2)

**Goal**: Staff con modo ninguno, todos, específicos o todos con excepciones, y nivel por evento.

**Independent Test**: Sin la función comercial no se guarda el staff. Con solo lectura no edita ni abre otro evento ni facturación.

- [x] T024 [P] [US6] Crear `staff_assignment` y `event_permission` en `src/db/schema/staff-assignment.ts` con modos `none`, `all`, `specific`, `all_except` y niveles `viewer`, `operator`, `event_admin`
- [x] T025 [US6] Rechazar el guardado de staff si la función de roles avanzados está apagada en `src/modules/access/permissions.ts`
- [x] T026 [US6] Aplicar el permiso al abrir rutas de evento en `src/modules/access/event-guard.ts`, dejando facturación, configuración, sitio y analítica fuera del staff

---

## Phase 9: User Story 7 - Actualizar la propia contraseña (Priority: P3)

**Goal**: Cambiar la clave indicando la actual. Nombre y correo no se editan.

**Independent Test**: La siguiente entrada exige la clave nueva. Nombre y correo siguen igual.

- [x] T027 [US7] Cambiar la clave en `src/modules/access/change-password.ts` exigiendo la actual y una nueva de al menos 8 caracteres repetida
- [x] T028 [US7] Mostrar nombre y correo deshabilitados en `src/app/(admin)/admin/profile/page.tsx`

---

## Phase 10: Polish

- [x] T029 Recorrer los seis escenarios de `specs/001-acceso-organizacion/quickstart.md` en `tests/e2e/access/quickstart.spec.ts`
- [x] T030 Dejar el menú del panel en `src/app/(admin)/admin/nav.tsx` con inicio, contactos, eventos, cupones, sitio, comunicaciones, analítica, facturación, configuración y perfil, marcando comunicaciones y analítica como función de pago

## Phase 11: User Story 8 — 2FA opcional

- [x] T031 Migración `drizzle/0001_two_factor.sql` y columnas en `src/db/schema/access.ts` (`totp_secret_enc`, `totp_enabled_at`, `backup_code`)
- [x] T032 Módulos TOTP y ticket `login_2fa` en `src/modules/access/totp*.ts`, `login-2fa.ts`, `two-factor.ts`
- [x] T033 Flujo de acceso: `login/page.tsx`, `login/verify-2fa/page.tsx` y credenciales en `src/lib/auth.ts`
- [x] T034 UI en `src/app/(admin)/admin/profile/page.tsx` (activar, confirmar, códigos de respaldo, desactivar)
- [x] T035 Pruebas unitarias TOTP en `tests/unit/access/totp.test.ts`

---

## Dependencies

- Phase 1 y 2 bloquean el resto.
- US2 y US3 dependen del token de T013.
- US5 depende de US4 (existe una propietaria).
- US6 depende de US5.
- US1, US2 y US3 pueden avanzar en paralelo después de Phase 2, salvo el archivo de tokens compartido.

## Parallel example (User Story 2)

- T013 crea la tabla mientras se diseña la pantalla, y T014 espera esa tabla.

## Implementation strategy

MVP: Phase 1–6 (entrar, enlace, restablecer y crear la organización). Invitar y staff entran en la ola 2. El perfil puede esperar.

## Task counts

- Setup: 4
- Foundational: 5
- US1: 3
- US2: 3
- US3: 2
- US4: 3
- US5: 3
- US6: 3
- US7: 2
- Polish: 2
- US8 (2FA): 5
- Total: 35
