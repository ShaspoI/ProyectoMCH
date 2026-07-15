---
title: "Schema de Datos"
category: reference
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/state_management.md
  - architecture/decisions/ADR-002_localstorage_as_db.md
  - development/mock_data_and_storage.md
---

# Schema de Datos

Este documento es el propietario absoluto del modelo de datos del sistema. Define las entidades, sus atributos, tipos y relaciones. No documenta reglas de negocio, transiciones de estados, rutas, lógica de contextos ni comportamiento de UI; esos temas pertenecen a documentos dedicados (ver Ownership Rules en `README.md`).

---

## Convenciones Globales

### Formatos de Fecha

Todos los campos de fecha utilizan **ISO 8601** con timezone UTC: `"YYYY-MM-DDTHH:mm:ss.sssZ"`. Los campos de solo-fecha (ej. `fechaRegistro`) usan el formato abreviado `"YYYY-MM-DD"`.

### Convenciones de ID por Entidad

| Entidad | Formato | Tipo | Ejemplo |
|---|---|---|---|
| `User` | `U-{NNN}` | `string` | `"U-101"` |
| `Ticket` | `MT-{NNN}` | `string` | `"MT-1024"` |
| `HistoryEntry` | `hist-{timestamp}` | `string` | `"hist-1719123456789"` |
| `Observation` | `obs-{timestamp}` | `string` | `"obs-1719123456789"` |
| `Notification` | `notif-{timestamp}-{random4chars}` | `string` | `"notif-1719123456789-a3f2"` |
| `Sector` | Número entero positivo auto-generado | `number` | `1`, `2`, `1719123456789` |
| `Category` | Número entero positivo auto-generado | `number` | `1`, `4`, `1719123456789` |
| `Subcategory` | Número entero positivo auto-generado | `number` | `1`, `7`, `1719123456789` |

> Los IDs de `Sector`, `Category` y `Subcategory` en los seeders iniciales son enteros secuenciales (`1`, `2`, ...). Los generados en runtime son enteros positivos de mayor magnitud. Ambos son `number`.

### Actor de Sistema

El valor `"system"` en el campo `actorId` de `HistoryEntry` y `Observation` identifica acciones realizadas por el sistema sin un usuario real.

---

## Entidades

---

### User

Representa a un usuario registrado en el sistema.

**Persistencia:** `localStorage` — clave `maintenance-users`.

| Campo | Tipo | Obligatorio | Valores permitidos | Observaciones |
|---|---|---|---|---|
| `id` | `string` | ✅ | Formato `U-{NNN}` | Generado por el sistema. |
| `nombre` | `string` | ✅ | — | Nombre de pila. |
| `apellido` | `string` | ✅ | — | Apellido. |
| `legajo` | `string` | ✅ | — | Identificador único de empleado. Puede usarse como credencial de login. |
| `email` | `string` | ✅ | — | Dirección de email única. Puede usarse como credencial de login. |
| `telefono` | `string` | ❌ | — | Teléfono de contacto. Debe ser único si se provee. |
| `sector` | `string` | ✅ | Nombres de sectores activos en `SettingsContext` | Sector de pertenencia del usuario. |
| `estado` | `string` | ✅ | `"Activo"`, `"Inactivo"` | Estado de la cuenta. |
| `rol` | `string` | ✅ | `"Admin"`, `"Técnico"`, `"Usuario"` | Etiqueta de display en español. |
| `role` | `string` | ✅ | `"admin"`, `"tecnico"`, `"usuario"` | Valor interno utilizado por el sistema de control de acceso. |
| `password` | `string` | ✅ | — | Contraseña en texto plano (solo para entorno mock). Nunca se expone en la sesión. |
| `tempPassword` | `boolean` | ❌ | `true`, `false` | Presente cuando el administrador reseteó la contraseña. Ausente si el usuario nunca tuvo contraseña temporal. |
| `fechaRegistro` | `string` | ✅ | Formato `YYYY-MM-DD` | Fecha de alta en el sistema. |

**Relación:** `User.sector` referencia el nombre de un `Sector`. `User.role` es el valor que el sistema de control de acceso evalúa para determinar el espacio de navegación del usuario.

**Nota sobre `rol` / `role`:** Son dos campos distintos que representan lo mismo con diferente forma. `rol` es la etiqueta de presentación al usuario. `role` es el valor computado para lógica del sistema.

---

### Ticket

Representa una solicitud de mantenimiento creada por un usuario.

**Persistencia:** `localStorage` — clave `maintenance-tickets-v3`.

| Campo | Tipo | Obligatorio | Valores permitidos | Observaciones |
|---|---|---|---|---|
| `id` | `string` | ✅ | Formato `MT-{NNN}` | Generado por el sistema. |
| `source` | `string` | ✅ | `"web"`, `"whatsapp"` | Canal por el que se creó el ticket. Valor por defecto: `"web"`. |
| `userId` | `string` | ✅ | Formato `U-{NNN}` | ID del usuario que creó el ticket. Referencia a `User.id`. |
| `userSnapshot` | `UserSnapshot` | ✅ | — | Copia de los datos del usuario al momento de la creación. Ver entidad `UserSnapshot`. |
| `category` | `string` | ✅ | Nombres de categorías activas en `SettingsContext` | Categoría del problema reportado. |
| `subcategory` | `string` | ✅ | Nombres de subcategorías activas en `SettingsContext` | Subcategoría del problema reportado. |
| `deviceTag` | `string` | ✅ | — | Identificador o etiqueta del equipo/activo afectado. Puede ser cadena vacía `""`. |
| `fullDescription` | `string` | ✅ | — | Descripción completa del problema. |
| `status` | `string` | ✅ | Ver tabla `TicketStatus` | Estado actual del ticket. |
| `createdAt` | `string` | ✅ | ISO 8601 UTC | Fecha y hora de creación. |
| `assignedTo` | `AssignedTo \| null` | ✅ | — | Técnico asignado. `null` si aún no hay asignación. Ver entidad `AssignedTo`. |
| `assignedAt` | `string \| null` | ❌ | ISO 8601 UTC | Fecha de la primera asignación. Solo se escribe una vez; las reasignaciones lo preservan. |
| `resolvedAt` | `string \| null` | ✅ | ISO 8601 UTC | Fecha en que el ticket pasó a `"resuelto-pendiente"`. `null` si no ocurrió aún. |
| `closedAt` | `string \| null` | ✅ | ISO 8601 UTC | Fecha de cierre definitivo. `null` si no ocurrió aún. |
| `observations` | `Observation[]` | ✅ | — | Array de observaciones internas. Puede ser `[]`. |
| `history` | `HistoryEntry[]` | ✅ | — | Registro cronológico de eventos del ticket. Siempre contiene al menos la entrada de creación. |

**Nota:** El campo `shortDescription` fue eliminado del schema en la versión actual. No se persiste; se deriva en tiempo de render a partir de `fullDescription`.

---

### UserSnapshot

Objeto anidado en `Ticket`. Captura el estado del usuario creador en el momento de la creación del ticket. No se actualiza si el usuario modifica sus datos posteriormente.

| Campo | Tipo | Obligatorio | Observaciones |
|---|---|---|---|
| `name` | `string` | ✅ | Nombre completo del usuario (`nombre + apellido`). |
| `sector` | `string` | ✅ | Sector del usuario al momento de la creación. |
| `legajo` | `string` | ✅ | Legajo del usuario al momento de la creación. |

---

### AssignedTo

Objeto anidado en `Ticket`. Referencia al técnico asignado. Es `null` cuando el ticket no tiene técnico asignado.

| Campo | Tipo | Obligatorio | Observaciones |
|---|---|---|---|
| `id` | `string` | ✅ | ID del técnico. Referencia a `User.id`. |
| `name` | `string` | ✅ | Nombre completo del técnico al momento de la asignación. |

---

### HistoryEntry

Objeto anidado en `Ticket.history`. Representa un evento registrado en el ciclo de vida del ticket.

| Campo | Tipo | Obligatorio | Observaciones |
|---|---|---|---|
| `id` | `string` | ✅ | Formato `hist-{timestamp}`. En operaciones que generan múltiples entradas en el mismo llamado, puede tener sufijos: `hist-{timestamp}-status`, `hist-{timestamp}-assign`, `hist-{timestamp}-confirm`. |
| `action` | `string` | ✅ | Etiqueta del tipo de evento (ej. `"Ticket creado"`, `"Estado actualizado"`, `"Observación agregada"`, `"Conformidad confirmada"`). |
| `detail` | `string` | ✅ | Descripción textual del cambio (ej. `"Cambio de Pendiente a Asignado."`). |
| `actor` | `string` | ✅ | Nombre del usuario que realizó la acción, o el literal `"Sistema"`. |
| `actorId` | `string` | ✅ | ID del usuario que realizó la acción, o el literal `"system"`. Referencia a `User.id`. |
| `createdAt` | `string` | ✅ | ISO 8601 UTC. Fecha y hora del evento. |

---

### Observation

Objeto anidado en `Ticket.observations`. Representa una observación interna registrada durante el ciclo de vida del ticket.

| Campo | Tipo | Obligatorio | Observaciones |
|---|---|---|---|
| `id` | `string` | ✅ | Formato `obs-{timestamp}`. |
| `author` | `string` | ✅ | Nombre del usuario que registró la observación, o el literal `"Sistema"`. |
| `authorId` | `string` | ✅ | ID del usuario. Referencia a `User.id`, o el literal `"system"`. |
| `text` | `string` | ✅ | Texto de la observación. |
| `createdAt` | `string` | ✅ | ISO 8601 UTC. |

---

### Notification

Representa una notificación dirigida a un usuario específico.

**Persistencia:** `localStorage` — clave `maintenance-notifications`.

| Campo | Tipo | Obligatorio | Valores permitidos | Observaciones |
|---|---|---|---|---|
| `id` | `string` | ✅ | Formato `notif-{timestamp}-{random4chars}` | Generado por el sistema. |
| `recipientId` | `string` | ✅ | Formato `U-{NNN}` | ID del usuario destinatario. Referencia a `User.id`. |
| `type` | `string` | ✅ | `"ticket_created"`, `"ticket_assigned"`, `"ticket_status_changed"`, `"ticket_conformidad_required"`, `"ticket_closed"`, `"ticket_reopened"` | Tipo del evento que originó la notificación. |
| `ticketId` | `string \| null` | ✅ | Formato `MT-{NNN}` | ID del ticket relacionado. `null` si no aplica. |
| `message` | `string` | ✅ | — | Texto legible por el usuario. Generado a partir del `type` y el `ticketId`. |
| `read` | `boolean` | ✅ | `true`, `false` | Indica si la notificación fue leída por el destinatario. |
| `createdAt` | `string` | ✅ | ISO 8601 UTC | Fecha y hora de creación. |

---

### TicketStatus

Entidad de configuración que define los estados posibles de un ticket. Vive en `src/config/ticketStatuses.js`. No se persiste en localStorage.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Valor interno del estado. Es el valor almacenado en `Ticket.status`. |
| `label` | `string` | Etiqueta de display (ej. `"Resuelto — pend. conformidad"`). |
| `columnLabel` | `string` | Etiqueta compacta alternativa al `label` completo. |
| `tone` | `string` | Identificador de color semántico (ej. `"blue"`, `"amber"`, `"green"`). |
| `pulse` | `boolean` | Indica si el estado tiene una animación visual asociada. |

**Estados definidos:**

| `id` | `label` |
|---|---|
| `"pendiente"` | `"Pendiente"` |
| `"asignado"` | `"Asignado"` |
| `"en-proceso"` | `"En proceso"` |
| `"resuelto-pendiente"` | `"Resuelto — pend. conformidad"` |
| `"cerrado"` | `"Cerrado"` |

---

### Sector

Entidad de configuración que define los sectores disponibles para clasificar usuarios.

**Persistencia:** `localStorage` — clave `maintenance-settings` (como parte de `{ sectors, categories, subcategories }`).

| Campo | Tipo | Obligatorio | Valores permitidos | Observaciones |
|---|---|---|---|---|
| `id` | `number` | ✅ | Entero positivo | Entero positivo auto-generado. Puede ser secuencial (seeders) o de mayor magnitud (runtime). |
| `name` | `string` | ✅ | — | Nombre del sector. Único (validación case-insensitive). |
| `estado` | `string` | ✅ | `"Activo"`, `"Inactivo"` | Estado operativo del sector. |

---

### Category

Entidad de configuración que define las categorías disponibles para clasificar tickets.

**Persistencia:** `localStorage` — clave `maintenance-settings`.

| Campo | Tipo | Obligatorio | Valores permitidos | Observaciones |
|---|---|---|---|---|
| `id` | `number` | ✅ | Entero positivo | Entero positivo auto-generado. Puede ser secuencial (seeders) o de mayor magnitud (runtime). |
| `name` | `string` | ✅ | — | Nombre de la categoría. Único (validación case-insensitive). |
| `estado` | `string` | ✅ | `"Activo"`, `"Inactivo"` | Estado operativo de la categoría. |

---

### Subcategory

Entidad de configuración que define las subcategorías disponibles para clasificar tickets.

**Persistencia:** `localStorage` — clave `maintenance-settings`.

| Campo | Tipo | Obligatorio | Valores permitidos | Observaciones |
|---|---|---|---|---|
| `id` | `number` | ✅ | Entero positivo | Entero positivo auto-generado. Puede ser secuencial (seeders) o de mayor magnitud (runtime). |
| `name` | `string` | ✅ | — | Nombre de la subcategoría. |
| `category` | `string` | ✅ | Nombre de una `Category` existente | Referencia por nombre (string), no por ID. Se actualiza en cascada si se renombra la categoría. |
| `estado` | `string` | ✅ | `"Activo"`, `"Inactivo"` | Estado operativo de la subcategoría. |

**Nota sobre la FK por nombre:** `Subcategory.category` referencia a `Category.name` directamente como string (no por `id`). Esto es una característica del modelo MVP. Las implicaciones de esta decisión están en [`ADR-002`](architecture/decisions/ADR-002_localstorage_as_db.md).

---

## Relaciones entre Entidades

```
User ──────────────────────── Ticket (1 User → N Tickets vía userId)
User ──────────────────────── Notification (1 User → N Notifications vía recipientId)
Ticket ─────────────────────── HistoryEntry[] (1 Ticket → N HistoryEntry, anidadas)
Ticket ─────────────────────── Observation[] (1 Ticket → N Observation, anidadas)
Ticket ─────────────────────── UserSnapshot (1 Ticket → 1 UserSnapshot, anidado)
Ticket ─────────────────────── AssignedTo | null (1 Ticket → 0..1 AssignedTo, anidado)
Ticket.status ───────────────── TicketStatus.id (referencia a config)
Ticket.category ─────────────── Category.name (referencia por nombre)
Ticket.subcategory ──────────── Subcategory.name (referencia por nombre)
User.sector ─────────────────── Sector.name (referencia por nombre)
Subcategory.category ────────── Category.name (referencia por nombre — FK string)
```
