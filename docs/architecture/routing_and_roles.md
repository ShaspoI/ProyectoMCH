---
title: "Enrutamiento y Roles"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/overview.md
  - architecture/project_structure.md
  - architecture/state_management.md
---

# Enrutamiento y Roles

Este documento es el propietario del árbol de rutas de la aplicación (URL mapping), la definición de los roles de usuario y los mecanismos de protección de navegación. No documenta los contratos de los contextos de autenticación ni el contenido visual de cada página; esos temas tienen documentos dedicados (ver Ownership Rules en `README.md`).

---

## 1. Roles del Sistema

El sistema opera bajo un modelo de control de acceso basado en roles (RBAC) rígido y mutuamente excluyente. Un usuario posee un único rol activo en un momento dado, almacenado en la entidad de usuario.

| Rol | Valor interno | Espacio de enrutamiento |
|---|---|---|
| Administrador | `"admin"` | `/admin/*` |
| Técnico | `"tecnico"` | `/tecnico/*` |
| Usuario Final | `"usuario"` | `/dashboard/*` |

---

## 2. Árbol de Rutas

Todas las rutas son gestionadas a través del componente `<AppRoutes>`.

### Rutas Públicas

No requieren autenticación. Si un usuario autenticado intenta acceder a la raíz `/`, el mecanismo `RootRedirect` lo envía a su portal privado.

| Ruta | Componente |
|---|---|
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/forgot-password` | `ForgotPasswordPage` |
| `/change-password` | `ChangePasswordPage` |
| `/` | `RootRedirect` |
| `*` | Redirección a `/login` |

### Rutas Privadas: Administrador (`/admin`)

Protegidas por `<ProtectedRoute role="admin">`.

| Ruta | Componente |
|---|---|
| `/admin` (index) | `AdminDashboard` |
| `/admin/tickets` | `AdminTickets` |
| `/admin/users` | `AdminUsers` |
| `/admin/settings` | `AdminSettings` |
| `/admin/profile` | `AdminProfile` |

### Rutas Privadas: Técnico (`/tecnico`)

Protegidas por `<ProtectedRoute role="tecnico">`.

| Ruta | Componente |
|---|---|
| `/tecnico` (index) | `TecnicoTickets` |
| `/tecnico/profile` | `TecnicoProfile` |

### Rutas Privadas: Usuario Final (`/dashboard`)

Protegidas por `<ProtectedRoute role="usuario">`.

| Ruta | Componente |
|---|---|
| `/dashboard` (index)| `DashboardHome` |
| `/dashboard/create-ticket`| `CreateTicketPage` |
| `/dashboard/my-tickets`| `MyTicketsPage` |
| `/dashboard/profile`| `ProfilePage` |

---

## 3. Mecanismos de Protección

La protección de rutas se implementa mediante tres mecanismos de envoltura y redirección que operan en capas. Las validaciones se basan exclusivamente en el estado provisto por el contexto de autenticación.

### 3.1. RequirePasswordChange

Es la barrera de mayor precedencia en la aplicación, envolviendo la totalidad del árbol de rutas.

**Comportamiento:**
1. Ignora a los usuarios no autenticados (deja pasar la ejecución para que las rutas públicas o `ProtectedRoute` actúen).
2. Si el usuario está autenticado y tiene pendiente el cambio obligatorio de contraseña:
   - Bloquea la navegación hacia cualquier ruta distinta a `/change-password`.
   - Redirige forzosamente a `/change-password`.
3. Si el usuario está autenticado y no debe cambiar su contraseña:
   - Bloquea el acceso a `/change-password` (ruta exclusiva para flujo forzado) y redirige a la raíz `/` (que a su vez resolverá mediante `RootRedirect`).

### 3.2. ProtectedRoute

Componente envoltura aplicado a nivel de layout para cada espacio de enrutamiento privado (`/admin`, `/tecnico`, `/dashboard`).

**Comportamiento:**
1. Si no hay usuario autenticado, intercepta y redirige incondicionalmente a `/login`.
2. Si se especifica la prop `role`, compara contra el rol del usuario autenticado.
3. Si existe una discordancia de roles (ej. un técnico intentando acceder a `/admin`), redirige silenciosamente al usuario hacia el espacio de enrutamiento que le corresponde por contrato:
   - Administrador → `/admin`
   - Técnico → `/tecnico`
   - Usuario → `/dashboard`

### 3.3. RootRedirect

Componente asignado estrictamente a la ruta raíz (`/`). Actúa como el distribuidor de tráfico inicial.

**Comportamiento:**
- Sin autenticación → redirige a `/login`.
- Rol `"admin"` → redirige a `/admin`.
- Rol `"tecnico"` → redirige a `/tecnico`.
- Otros roles → redirige a `/dashboard`.
