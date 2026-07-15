---
title: "Gestión de Estado Global"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/overview.md
  - architecture/project_structure.md
  - architecture/decisions/ADR-001_context_api_vs_redux.md
  - architecture/decisions/ADR-003_notification_decoupling.md
  - features/ticketing_workflow.md
  - features/notifications.md
  - reference/data_schema.md
  - development/mock_data_and_storage.md
---

# Gestión de Estado Global

Este documento es el propietario de los contratos públicos de los 7 contextos de React,
del árbol de providers, del patrón Bridge y de las dependencias entre contextos. No
documenta rutas, schemas completos de entidades, reglas de negocio de tickets ni
comportamiento de componentes visuales; esos temas pertenecen a documentos dedicados
(ver Ownership Rules en `README.md`).

---

## 1. Árbol de Providers

El orden de anidamiento determina qué contextos pueden consumir a cuáles. Un provider
solo puede llamar hooks de contextos ubicados en niveles superiores del árbol.

```
<BrowserRouter>
  <ToastProvider>               ← UI. Sin dependencias.
    <ThemeProvider>             ← UI. Sin dependencias.
      <UserProvider>            ← Dominio. Fuente de verdad de usuarios.
        <NotificationProvider>  ← Dominio. Sin dependencia de otros contextos.
          <SettingsProvider>    ← Dominio. Sin dependencia de otros contextos.
            <AuthProvider>      ← Dominio. Depende de UserContext.
              <TicketProviderWithNotifications>
                {/* Bridge: consume NotificationContext y UserContext.  */}
                {/* TicketProvider recibe onEvent como prop del bridge. */}
                <AppRoutes />
              </TicketProviderWithNotifications>
            </AuthProvider>
          </SettingsProvider>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  </ToastProvider>
</BrowserRouter>
```

**Regla de dependencias:** Un contexto que necesite datos de otro debe ser su descendiente
en el árbol. La única excepción es el Bridge, que intermedia entre `TicketContext` y
`NotificationContext` sin crear dependencia directa entre ellos.

La decisión de usar Context API en lugar de Redux está documentada en
[`ADR-001`](architecture/decisions/ADR-001_context_api_vs_redux.md).

---

## 2. Patrón Bridge

### Problema

`TicketContext` necesita notificar a `NotificationContext` cuando ocurren eventos de
ticket. Importar `NotificationContext` directamente desde `TicketContext` crearía una
dependencia circular: `TicketProvider` es descendiente de `NotificationProvider`, que a
su vez necesitaría importar desde `TicketContext`.

### Solución

El componente interno `TicketProviderWithNotifications` (definido en `App.jsx`) opera en
un nivel del árbol donde puede consumir ambos contextos y pasar las funciones necesarias
sin que los contextos se conozcan entre sí:

```
TicketProviderWithNotifications
  ├── consume: useNotifications()  →  addNotification
  ├── consume: useUsers()          →  users
  └── provee:  handleTicketEvent como prop onEvent a TicketProvider
```

### Lógica de resolución de destinatarios

`TicketContext` emite eventos con dos tipos de destinatario:

| Tipo de destinatario | Valor | Resolución en el Bridge |
|---|---|---|
| Usuario concreto | ID de usuario (ej: `"U-101"`) | Llamada directa a `addNotification(type, id, payload)` |
| Genérico | Literal `"admin"` | Filtra todos los usuarios con `role === "admin"` y `estado === "Activo"` y llama a `addNotification` una vez por cada uno |

### Contrato del prop `onEvent`

```
onEvent(
  type: string,
  recipientId: string | "admin",
  payload: { ticketId: string, [key: string]: any }
) => void
```

`TicketContext` llama a `onEvent` después de cada operación de escritura que genera un
evento. La implementación completa del bridge está en `src/App.jsx`. La decisión de
diseño está detallada en [`ADR-003`](architecture/decisions/ADR-003_notification_decoupling.md).

---

## 3. Contextos de UI

Los contextos de UI gestionan estado de presentación. No tienen dependencias entre sí ni
con los contextos de dominio.

---

### 3.1 ThemeContext

**Hook:** `useTheme()`

**Valores expuestos:**

| Nombre | Tipo | Descripción |
|---|---|---|
| `theme` | `"dark" \| "light"` | Tema actualmente activo. |
| `toggleTheme` | `() => void` | Alterna entre `"dark"` y `"light"`. |

**Inicialización:** Lee `maintenance-theme` de localStorage. Si no existe, detecta la
preferencia del sistema operativo mediante `window.matchMedia("(prefers-color-scheme: dark)")`.

**Persistencia:** `maintenance-theme`. Sin dependencias.

---

### 3.2 ToastContext

**Hook:** `useToast()`

**Valores expuestos:**

| Nombre | Tipo | Descripción |
|---|---|---|
| `showToast` | `(message: string, type?: "success" \| "error") => void` | Muestra una notificación efímera. `type` por defecto: `"success"`. Desaparece automáticamente a los 4 segundos. |

**Persistencia:** Ninguna. Las notificaciones existen solo en memoria durante su ciclo
de vida.

**Nota arquitectónica:** `ToastProvider` renderiza su propio contenedor visual dentro
del árbol de `children`. Es simultáneamente un provider de estado y un componente visual.
Sin dependencias.

---

## 4. Contextos de Dominio

Los contextos de dominio contienen lógica de negocio, persisten su estado en
`localStorage` y pueden tener dependencias entre sí. La tabla completa de claves de
almacenamiento con sus propósitos está en `PROJECT_CONTEXT.md §8`.

---

### 4.1 UserContext

**Hook:** `useUsers()`

**Valores expuestos:**

| Nombre | Tipo | Descripción |
|---|---|---|
| `users` | `User[]` | Lista completa de todos los usuarios del sistema. |
| `addUser` | `(userData: object) => void` | Crea un nuevo usuario. |
| `updateUser` | `(id: string, userData: object) => void` | Edición completa por parte del administrador. |
| `updateUserProfile` | `(id: string, { email, telefono, password }) => void` | Edición del perfil propio del usuario. |
| `toggleUserStatus` | `(id: string) => void` | Alterna `Activo / Inactivo`. |
| `resetUserPassword` | `(id: string) => string` | Genera y persiste una contraseña temporal. Retorna la nueva contraseña en texto plano para mostrarla una única vez. |

**Comportamiento de `updateUserProfile`:** Si se provee `password`, también establece
`tempPassword: false` en el usuario.

**Comportamiento de `resetUserPassword`:** Genera una contraseña de 8 caracteres
aleatorios, la persiste con `tempPassword: true` y la retorna en texto plano.

**Errores arrojados:** Todas las funciones de escritura validan antes de llamar a
`setUsers`. Si se viola una restricción, arrojan un `Error` síncrono capturable con
`try/catch` en el componente llamante.

| Función | Condición | Mensaje de error |
|---|---|---|
| `addUser` | Legajo duplicado | `"El legajo ya está en uso por otro usuario."` |
| `addUser` | Email duplicado | `"El email ya está en uso por otro usuario."` |
| `addUser` | Teléfono duplicado (si se provee) | `"El teléfono ya está en uso por otro usuario."` |
| `updateUser` | Legajo duplicado | `"El legajo ya está en uso por otro usuario."` |
| `updateUser` | Operación dejaría sin admin activo | `"No se puede realizar esta acción: el sistema debe tener al menos un administrador activo."` |
| `updateUserProfile` | Email duplicado | `"El email ya está en uso por otro usuario."` |
| `toggleUserStatus` | Desactivar al único admin activo | `"No se puede desactivar al único administrador activo del sistema."` |

**Persistencia:** `maintenance-users`. Inicialización y lógica de migración en
`development/mock_data_and_storage.md`. Sin dependencias de otros contextos.

---

### 4.2 NotificationContext

**Hook:** `useNotifications()`

**Valores expuestos:**

| Nombre | Tipo | Descripción |
|---|---|---|
| `addNotification` | `(type: string, recipientId: string, payload: object) => void` | Agrega una notificación para un destinatario concreto. Solo llamado desde el Bridge. |
| `markAsRead` | `(id: string) => void` | Marca una notificación individual como leída. |
| `markAllAsRead` | `(userId: string) => void` | Marca como leídas todas las notificaciones de un usuario. |
| `getForUser` | `(userId: string) => Notification[]` | Retorna las notificaciones del usuario, sin ordenamiento garantizado por el contexto. |

**Nota:** El array completo de notificaciones no se expone en el contexto. Los
consumidores acceden siempre mediante `getForUser(userId)`.

**Tipos de evento aceptados por `addNotification`:**

| Tipo |
|---|
| `"ticket_created"` |
| `"ticket_assigned"` |
| `"ticket_status_changed"` |
| `"ticket_conformidad_required"` |
| `"ticket_closed"` |
| `"ticket_reopened"` |

La descripción semántica de cada evento y el mensaje visible al usuario están documentados en `features/notifications.md`.

**Sincronización entre pestañas:** Delegada a eventos de storage. Comportamiento documentado en `features/notifications.md`.

**Persistencia:** `maintenance-notifications`. Las notificaciones con más de 30 días de
antigüedad se descartan en la inicialización. Sin dependencias de otros contextos.

---

### 4.3 SettingsContext

**Hook:** `useSettings()`

**Valores expuestos:**

| Nombre | Tipo | Descripción |
|---|---|---|
| `sectors` | `Sector[]` | Lista de sectores. |
| `addSector` | `(name: string) => void` | Crea un sector. |
| `updateSector` | `(id: number, name: string) => void` | Renombra un sector. |
| `toggleSectorStatus` | `(id: number) => void` | Alterna `Activo / Inactivo`. |
| `categories` | `Category[]` | Lista de categorías. |
| `addCategory` | `(name: string) => void` | Crea una categoría. |
| `updateCategory` | `(id: number, name: string) => void` | Renombra una categoría y actualiza en cascada las referencias en subcategorías. |
| `toggleCategoryStatus` | `(id: number) => void` | Alterna `Activo / Inactivo`. |
| `subcategories` | `Subcategory[]` | Lista de subcategorías. |
| `addSubcategory` | `(name: string, categoryName: string) => void` | Crea una subcategoría vinculada a una categoría. |
| `updateSubcategory` | `(id: number, name: string, categoryName: string) => void` | Edita nombre y categoría de una subcategoría. |
| `toggleSubcategoryStatus` | `(id: number) => void` | Alterna `Activo / Inactivo`. |

**Errores arrojados:**

| Función | Condición | Mensaje de error |
|---|---|---|
| `addSector` / `updateSector` | Nombre de sector duplicado | `"El sector ya existe."` |
| `addCategory` / `updateCategory` | Nombre de categoría duplicado | `"La categoría ya existe."` |
| `addSubcategory` / `updateSubcategory` | Nombre + categoría duplicados | `"La subcategoría ya existe en esta categoría."` |

**Persistencia:** `maintenance-settings`. Persiste `{ sectors, categories, subcategories }`
como objeto único. Sin dependencias de otros contextos.

---

### 4.4 AuthContext

**Hook:** `useAuth()`

**Valores expuestos:**

| Nombre | Tipo | Descripción |
|---|---|---|
| `user` | `User \| null` | Usuario autenticado (sin campo `password`) o `null`. |
| `login` | `(identifier: string, password: string) => LoginResult` | Autentica al usuario. |
| `logout` | `() => void` | Cierra la sesión y limpia `maintenance-session`. |
| `updateSession` | `(fields: object) => void` | **@deprecated.** Ver nota abajo. |

**Tipo `LoginResult`:**
```
{
  success: boolean,
  error?: string,   // presente si success === false
  user?: object     // presente si success === true (sin campo password)
}
```

**Comportamiento de `login`:**
- `identifier` acepta `legajo` o `email` del usuario.
- Si las credenciales no coinciden: `{ success: false, error: "Credenciales inválidas" }`.
- Si la cuenta está `Inactivo`: `{ success: false, error: "Esta cuenta está desactivada. Contacte al administrador." }`.
- En caso de éxito: persiste el usuario en `maintenance-session` sin el campo `password`
  y retorna `{ success: true, user }`.

**`updateSession` — @deprecated:** Mantenida por compatibilidad con componentes
existentes. Su función era parchear manualmente el objeto de sesión. Hoy es innecesaria
porque la sesión se sincroniza automáticamente con `UserContext` cuando los datos del usuario cambian (edición de perfil, cambio de rol, etc.). Debe eliminarse en la próxima limpieza de API.

**Persistencia:** `maintenance-session`. Depende de `UserContext` (`useUsers`):
`AuthProvider` debe ser descendiente de `UserProvider` en el árbol.

---

### 4.5 TicketContext

**Hook:** `useTickets()`

**Valores expuestos:**

| Nombre | Descripción |
|---|---|
| `tickets` | `Ticket[]` — Lista completa de todos los tickets del sistema. |
| `addTicket` | Crea un nuevo ticket en estado `"pendiente"`. |
| `changeStatus` | Cambia el estado de un ticket. |
| `addObservation` | Agrega una observación interna. |
| `assignTicket` | Asigna un técnico al ticket. |
| `editTicket` | Edita los campos descriptivos de un ticket. |
| `confirmTicket` | Confirma la conformidad del usuario (cierra el ticket). |

**Nota:** `setTickets` no se expone en el contexto. Los componentes deben usar
exclusivamente las funciones encapsuladas.

**Prop requerida por `TicketProvider`:**
```
onEvent(type: string, recipientId: string | "admin", payload: object) => void
```
Inyectada por el Bridge. Sin esta prop, las operaciones de escritura no dispararán
notificaciones.

---

#### addTicket

```
addTicket({
  category: string,
  subcategory: string,
  deviceTag: string,
  fullDescription: string,
  userId: string,
  userSnapshot: { name: string, sector: string, legajo: string },
  source?: string   // "web" por defecto
}) => void
```

Genera automáticamente el ID del ticket, inicializa el ticket en estado `"pendiente"` y
registra la primera entrada de historial. Dispara el evento `"ticket_created"` con
destinatario `"admin"` (resuelto por el Bridge).

---

#### changeStatus

```
changeStatus(
  ticketId: string,
  newStatusId: string,
  actor: string,
  actorId: string
) => void
```

Actualiza el estado y registra la entrada de historial. Evento disparado según el nuevo
estado:

| Nuevo estado | Evento disparado | Destinatario |
|---|---|---|
| `"resuelto-pendiente"` | `"ticket_conformidad_required"` | `ticket.userId` |
| `"cerrado"` | `"ticket_closed"` | `ticket.userId` |
| `"en-proceso"` con técnico asignado y `actorId ≠ assignedTo.id` | `"ticket_reopened"` | `ticket.assignedTo.id` |
| Cualquier otro caso | `"ticket_status_changed"` | `ticket.userId` |

---

#### addObservation

```
addObservation(
  ticketId: string,
  text: string,
  author: string,
  authorId: string
) => void
```

Agrega una observación al array `observations` del ticket y registra una entrada de
historial. El schema del objeto observación está en `reference/data_schema.md`.

---

#### assignTicket

```
assignTicket(
  ticketId: string,
  technicianId: string,
  technicianName: string,
  actor: string,
  actorId: string
) => void
```

Establece `assignedTo: { id, name }` en el ticket. Si el ticket estaba en `"pendiente"`,
lo cambia automáticamente a `"asignado"` y registra dos entradas de historial (cambio de
estado + asignación). Para cualquier otro estado, solo registra la entrada de asignación.
Dispara el evento `"ticket_assigned"` con destinatario `technicianId`.

---

#### editTicket

```
editTicket(
  ticketId: string,
  { category, subcategory, deviceTag, fullDescription }: object,
  actor: string,
  actorId: string
) => void
```

Actualiza los campos descriptivos del ticket. **Solo tiene efecto si el ticket está en
estado `"pendiente"`**; si el estado es diferente, la operación se ignora
silenciosamente. Registra entrada de historial. Las reglas de negocio sobre qué
transiciones son válidas están en `features/ticketing_workflow.md`.

---

#### confirmTicket

```
confirmTicket(
  ticketId: string,
  actor: string,
  actorId: string
) => void
```

Confirma la conformidad del usuario. Establece el estado a `"cerrado"`, registra
`closedAt` y agrega dos entradas de historial (cambio de estado + confirmación de
conformidad). Dispara el evento `"ticket_closed"` con destinatario `actorId`.

---

**Persistencia:** `maintenance-tickets-v3`. La estrategia de versionado de claves y recarga de seeders está documentada en `development/mock_data_and_storage.md`. Sin dependencias directas de otros contextos.

---

## 5. Tabla de Resumen

| Contexto | Hook | Persiste | Clave localStorage | Depende de |
|---|---|---|---|---|
| `ThemeContext` | `useTheme()` | ✅ | `maintenance-theme` | — |
| `ToastContext` | `useToast()` | ❌ | — | — |
| `UserContext` | `useUsers()` | ✅ | `maintenance-users` | — |
| `NotificationContext` | `useNotifications()` | ✅ | `maintenance-notifications` | — |
| `SettingsContext` | `useSettings()` | ✅ | `maintenance-settings` | — |
| `AuthContext` | `useAuth()` | ✅ | `maintenance-session` | `UserContext` |
| `TicketContext` | `useTickets()` | ✅ | `maintenance-tickets-v3` | Bridge (`onEvent` prop) |

La tabla completa de claves con sus propósitos está en `PROJECT_CONTEXT.md §8`.
