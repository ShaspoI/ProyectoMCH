---
title: "Componentes Reutilizables"
category: ui_ux
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - ui_ux/design_system.md
  - architecture/routing_and_roles.md
  - features/ticketing_workflow.md
  - features/notifications.md
  - reference/data_schema.md
---

# Componentes Reutilizables

Este documento es el propietario exclusivo del contrato de props de cada componente reutilizable del sistema: qué acepta, qué produce y cuándo utilizarlo. No documenta el comportamiento funcional de los sistemas que estos componentes representan (notificaciones, autenticación, tickets); esos temas tienen documentos propietarios dedicados. Los mecanismos de protección de rutas (`ProtectedRoute`, `RequirePasswordChange`) están documentados en `architecture/routing_and_roles.md §3`.

---

## 1. Componentes de Datos y Visualización

---

### StatusBadge

Muestra el estado actual de un ticket como una etiqueta visual coloreada.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `status` | `TicketStatus` | ✅ | Objeto de estado completo (con `label`, `tone` y `pulse`). Se obtiene de la configuración global de estados. |

**Comportamiento:**
- Aplica el color semántico correspondiente al `tone` del estado.
- Si `pulse` es `true`, activa la animación de brillo pulsante para indicar que el estado requiere acción.

**Cuándo usarlo:** en cualquier contexto donde se necesite representar el estado de un ticket: tarjetas, paneles de detalle, listas y filtros.

**No usarlo para:** representar estados de otras entidades (usuarios, configuraciones). Este componente está acoplado al modelo de `TicketStatus`.

---

### DetailField

Muestra un par etiqueta-valor con el estilo tipográfico del sistema. Usado dentro de listas de definición (`<dl>`).

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `label` | `string` | ✅ | Etiqueta del campo, renderizada en mayúsculas pequeñas. |
| `value` | `ReactNode` | ✅ | Valor a mostrar. Puede ser texto, número o un elemento compuesto. |

**Cuándo usarlo:** para mostrar atributos de una entidad en un panel de detalle. Produce siempre un elemento de término (`dt`) y un elemento de definición (`dd`) semánticamente correctos.

---

### HistoryTimeline

Renderiza el historial de eventos de un ticket como una lista cronológica vertical.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `history` | `HistoryEntry[]` | ✅ | Array de entradas de historial del ticket. Cada entrada debe tener `id`, `action`, `detail`, `actor` y `createdAt`. |

**Comportamiento:**
- Muestra cada entrada con su acción, descripción, actor y fecha formateada.
- El orden de visualización refleja el orden del array recibido; no ordena internamente.

**Cuándo usarlo:** exclusivamente para renderizar el historial de un ticket. La estructura de `HistoryEntry` está en `reference/data_schema.md`.

---

### TicketCard

Tarjeta de ticket en dos estados visuales: minimizada (solo ID y usuario) y expandida (todos los metadatos relevantes). Acepta comportamiento de drag-and-drop como funcionalidad opcional.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `ticket` | `Ticket` | ✅ | Objeto del ticket a mostrar. |
| `statuses` | `TicketStatus[]` | ✅ | Lista completa de estados. Se usa para resolver el objeto de estado del ticket. |
| `isExpanded` | `boolean` | ✅ | Controla si la tarjeta muestra el detalle expandido o solo la cabecera. |
| `isDragging` | `boolean` | ❌ | Si `true`, reduce la opacidad de la tarjeta para indicar que está siendo arrastrada. |
| `isOverlay` | `boolean` | ❌ | Si `true`, aplica sombra elevada para indicar que es la copia visual durante el arrastre. |
| `dragHandleProps` | `{ attributes, listeners }` | ❌ | Props de drag-and-drop inyectados desde el sistema de ordenamiento. Si se omite, la tarjeta no es arrastrable. |
| `onActivate` | `(id: string) => void` | ❌ | Llamada cuando el usuario hace clic o activa la tarjeta. Recibe el ID del ticket. |
| `onCollapse` | `(id: string) => void` | ❌ | Llamada cuando el usuario minimiza la tarjeta expandida. Recibe el ID del ticket. |
| `style` | `CSSProperties` | ❌ | Estilos inline para transformaciones de animación durante el arrastre. |

**Comportamiento expandido:** muestra descripción abreviada, usuario, sector, etiqueta de equipo, fecha de creación, categoría y subcategoría, badge de estado, badge de técnico asignado y badge de alerta de SLA si el ticket supera el umbral de tiempo definido sin cerrarse.

**Acoplamiento:** `TicketCard` es un componente presentacional puro. No consume ningún contexto directamente.

---

### KanbanColumn

Columna del tablero Kanban. Contiene las tarjetas de tickets correspondientes a un estado y soporta recepción de arrastre entre columnas.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `status` | `TicketStatus` | ✅ | Estado que representa esta columna. Determina el color del encabezado y del borde. |
| `tickets` | `Ticket[]` | ✅ | Tickets a renderizar dentro de esta columna. |
| `statuses` | `TicketStatus[]` | ✅ | Lista completa de estados. Se pasa a cada tarjeta interna. |
| `expandedTicketId` | `string \| null` | ✅ | ID del ticket actualmente expandido. `null` si ninguno está expandido. |
| `onActivateTicket` | `(id: string) => void` | ✅ | Propagado a cada tarjeta; llamado cuando se expande una. |
| `onCollapseTicket` | `(id: string) => void` | ✅ | Propagado a cada tarjeta; llamado cuando se minimiza una. |

**Comportamiento:** muestra el encabezado de estado con el contador de tickets (con animación de rebote al cambiar el total). Si no hay tickets, muestra un indicador de columna vacía. Resalta visualmente cuando se arrastra un ticket sobre ella.

**Nota de composición:** internamente gestiona el comportamiento de arrastre de cada tarjeta. No es necesario interactuar con el componente intermedio de arrastre directamente.

---

## 2. Componentes de Modales

Todos los modales siguen el mismo patrón de visibilidad: si `isOpen` es `false`, el componente no monta nada en el DOM.

---

### ConfirmModal

Modal de confirmación genérico para acciones que requieren validación explícita del usuario.

**Props:**

| Prop | Tipo | Obligatorio | Valor por defecto | Descripción |
|---|---|---|---|---|
| `isOpen` | `boolean` | ✅ | — | Controla la visibilidad del modal. |
| `onClose` | `() => void` | ✅ | — | Llamada al cancelar o cerrar sin confirmar. |
| `onConfirm` | `() => void` | ✅ | — | Llamada al confirmar. Se ejecuta antes de cerrar automáticamente. |
| `title` | `string` | ✅ | — | Título del modal. |
| `message` | `string` | ✅ | — | Texto explicativo de la acción a confirmar. |
| `confirmText` | `string` | ❌ | `"Confirmar"` | Texto del botón de confirmación. |
| `cancelText` | `string` | ❌ | `"Cancelar"` | Texto del botón de cancelación. |
| `isDanger` | `boolean` | ❌ | `false` | Si `true`, cambia el color del ícono y el botón de confirmación a rojo, para acciones destructivas. |

**Cuándo usarlo:** antes de cualquier acción irreversible o de alto impacto (desactivaciones, cambios de estado críticos). Usar `isDanger: true` para acciones destructivas.

---

### PasswordModal

Modal para mostrar al administrador la nueva contraseña temporal generada tras un reseteo. Incluye funcionalidad de copia al portapapeles.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controla la visibilidad del modal. |
| `onClose` | `() => void` | ✅ | Llamada al cerrar el modal. |
| `password` | `string` | ✅ | Contraseña temporal a mostrar. |
| `userName` | `string` | ✅ | Nombre del usuario al que pertenece la contraseña, mostrado en el mensaje. |

**Comportamiento:** muestra la contraseña en texto visible con un botón de copia al portapapeles. El ícono cambia temporalmente a confirmación visual al copiar. Al reabrirse, reinicia el estado de copia.

**Cuándo usarlo:** únicamente después de ejecutar un reseteo de contraseña. El flujo funcional completo está en `features/authentication.md §5`.

---

### UserFormModal

Modal de formulario para crear o editar un usuario del sistema.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controla la visibilidad del modal. |
| `onClose` | `() => void` | ✅ | Llamada al cerrar el modal (con o sin guardado). |
| `userToEdit` | `User \| null` | ❌ | Si se proporciona, el formulario se carga en modo edición con los datos del usuario. Si es `null` o se omite, el formulario inicia vacío en modo creación. |

**Comportamiento:**
- En modo creación: todos los campos inician vacíos, excepto sector y rol que tienen valores por defecto.
- En modo edición: los campos se precargan con los datos de `userToEdit`.
- Ejecuta validaciones de formato antes de intentar guardar.
- Muestra los errores de unicidad (legajo, email) retornados por el sistema.
- El listado de sectores disponibles proviene del estado activo del sistema.

**Cuándo usarlo:** en el panel de administración de usuarios, tanto para el flujo de alta como de modificación.

---

### SettingFormModal

Modal de formulario genérico para crear o editar una entidad de configuración del sistema (sector, categoría o subcategoría).

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controla la visibilidad del modal. |
| `onClose` | `() => void` | ✅ | Llamada al cerrar el modal. |
| `type` | `"Sector" \| "Categoría" \| "Subcategoría"` | ✅ | Tipo de entidad a crear o editar. Determina el título y los campos visibles. |
| `initialData` | `{ name: string, category?: string } \| null` | ❌ | Si se proporciona, el formulario inicia en modo edición con estos valores. |
| `onSave` | `(name: string, category?: string) => void` | ✅ | Llamada al confirmar el formulario. Para subcategorías, recibe también la categoría padre. |
| `categories` | `string[]` | ❌ | Lista de nombres de categorías activas. Solo se utiliza cuando `type === "Subcategoría"`. Por defecto: `[]`. |

**Comportamiento:**
- En modo creación: campos vacíos.
- En modo edición: campos precargados con `initialData`.
- Si `type === "Subcategoría"`, muestra un selector de categoría padre.
- Los errores de unicidad (nombre duplicado) son capturados desde `onSave` y mostrados en el formulario.

---

## 3. Componentes de Navegación y Cabecera

---

### ThemeToggle

Control de alternancia entre modo claro y modo oscuro.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `theme` | `"light" \| "dark"` | ✅ | Tema actualmente activo. |
| `onToggle` | `() => void` | ✅ | Llamada al hacer clic para alternar el tema. |

**Comportamiento:** muestra un toggle con ícono de sol y luna. Al cambiar de modo, el ícono activo ejecuta una rotación completa. Incluye atributos de accesibilidad (`aria-label`, `aria-pressed`).

---

### DashboardHeader

Cabecera de la vista de gestión de tickets. Incluye título, contador de tickets del canal WhatsApp, campo de búsqueda, acceso al panel de métricas y control de tema.

**Props:**

| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `ticketCount` | `number` | ✅ | Cantidad de tickets creados por el canal WhatsApp. Se muestra como indicador informativo. |
| `query` | `string` | ✅ | Valor actual del campo de búsqueda. |
| `theme` | `"light" \| "dark"` | ✅ | Tema activo, pasado al control de tema interno. |
| `onQueryChange` | `(value: string) => void` | ✅ | Llamada al cambiar el texto de búsqueda. |
| `onToggleTheme` | `() => void` | ✅ | Llamada para alternar el tema. |
| `onOpenMetrics` | `() => void` | ❌ | Si se provee, muestra el botón de acceso al panel de métricas. Si se omite, el botón no aparece. |

---

### NotificationBell

Campana de notificaciones del usuario autenticado. No acepta props: consume directamente el estado de autenticación y notificaciones del sistema.

**Props:** ninguna.

**Comportamiento:** muestra un ícono de campana con un badge numérico rojo cuando hay notificaciones no leídas (máximo visible: `9+`). Al hacer clic, despliega un panel con la lista de notificaciones del usuario, con opciones para marcar cada una individualmente o todas como leídas. El panel se cierra al hacer clic fuera de él.

**Cuándo usarlo:** únicamente en cabeceras de portales de usuario autenticado. No es parametrizable desde el exterior.

**Comportamiento funcional completo:** en `features/notifications.md`.
