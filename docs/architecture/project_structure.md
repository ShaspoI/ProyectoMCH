---
title: "Estructura del Proyecto"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/overview.md
  - architecture/state_management.md
  - architecture/routing_and_roles.md
  - ui_ux/reusable_components.md
  - ui_ux/design_system.md
  - features/ticketing_workflow.md
  - features/notifications.md
  - features/dashboard_metrics.md
  - development/mock_data_and_storage.md
---

# Estructura del Proyecto

Este documento es el mapa de archivos del proyecto: qué contiene cada directorio,
qué responsabilidad tiene cada archivo y cómo se relacionan entre sí. No describe
contratos de contextos, rutas específicas, props de componentes ni schemas de datos;
esos temas tienen documentos propietarios dedicados (ver Ownership Rules en `README.md`).

---

## 1. Árbol General

```
ProyectoMCH/
├── index.html
├── PROJECT_CONTEXT.md
├── README.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── docs/                          ← Documentación técnica completa. Ver README.md.
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── config/
    │   └── ticketStatuses.js
    ├── context/
    │   ├── ToastContext.jsx
    │   ├── ThemeContext.jsx
    │   ├── UserContext.jsx
    │   ├── NotificationContext.jsx
    │   ├── SettingsContext.jsx
    │   ├── AuthContext.jsx
    │   └── TicketContext.jsx
    ├── data/
    │   ├── mockUsers.js
    │   └── mockTickets.js
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ForgotPasswordPage.jsx
    │   ├── ChangePasswordPage.jsx
    │   ├── UserPortal.jsx
    │   ├── DashboardHome.jsx
    │   ├── CreateTicketPage.jsx
    │   ├── MyTicketsPage.jsx
    │   ├── ProfilePage.jsx
    │   ├── AdminLayout.jsx
    │   ├── AdminDashboard.jsx
    │   ├── AdminTickets.jsx
    │   ├── AdminUsers.jsx
    │   ├── AdminSettings.jsx
    │   ├── AdminProfile.jsx
    │   ├── TecnicoLayout.jsx
    │   ├── TecnicoTickets.jsx
    │   └── TecnicoProfile.jsx
    ├── components/
    │   ├── ProtectedRoute.jsx
    │   ├── RequirePasswordChange.jsx
    │   ├── DashboardHeader.jsx
    │   ├── NotificationBell.jsx
    │   ├── ThemeToggle.jsx
    │   ├── StatusBadge.jsx
    │   ├── TicketCard.jsx
    │   ├── SortableTicketCard.jsx
    │   ├── KanbanColumn.jsx
    │   ├── TicketDetailPanel.jsx
    │   ├── TecnicoTicketPanel.jsx
    │   ├── MetricsPanel.jsx
    │   ├── HistoryTimeline.jsx
    │   ├── DetailField.jsx
    │   ├── ConfirmModal.jsx
    │   ├── PasswordModal.jsx
    │   ├── UserFormModal.jsx
    │   └── SettingFormModal.jsx
    ├── utils/
    │   └── ticketUtils.js
    └── styles/
        └── index.css
```

---

## 2. Raíz del Repositorio

### Archivos de entrada

**`index.html`** — Shell HTML del proyecto. Define el elemento `#root` donde React
monta la aplicación, configura el idioma de la página (`lang="es"`), carga la
tipografía Inter desde Google Fonts e importa `/src/main.jsx` como módulo ES. Es el
único punto de entrada HTML del sistema.

**`PROJECT_CONTEXT.md`** — Puerta de entrada técnica obligatoria al proyecto.

**`README.md`** — Descripción breve del proyecto con instrucciones de instalación y
ejecución (22 líneas). Su descripción funcional es anterior a la fase 4B-Core y está
pendiente de actualización; no debe usarse como referencia del estado actual del sistema.

### Archivos de configuración

**`package.json`** — Define el nombre del paquete (`maintenance-ticket-dashboard-mvp`),
la versión (`0.1.0`) y los tres scripts disponibles: `dev` (con `--host`), `build` y
`preview`. Lista todas las dependencias del proyecto. El stack está documentado en
`PROJECT_CONTEXT.md §2`.

**`vite.config.js`** — Configuración mínima de Vite: activa el plugin React. No
customiza puertos, paths ni aliases. Todo el comportamiento es el predeterminado.

**`tailwind.config.js`** — Configuración de TailwindCSS. Define los archivos escaneados
para purgar clases no usadas y las extensiones del tema. El detalle del sistema de
diseño está en `ui_ux/design_system.md`.

**`postcss.config.js`** — Pipeline de procesamiento CSS. Registra TailwindCSS y
Autoprefixer. Sin configuración adicional.

**`.gitignore`** — Ignora `node_modules/`, `dist/` y archivos de sistema operativo.

### Directorios raíz

**`docs/`** — Documentación técnica completa del proyecto. Índice y estructura en
`docs/README.md`.

**`dist/`** — Salida del build de producción. Generado por `npm run build`. No
versionado en Git.

---

## 3. src/ — Código Fuente

### src/main.jsx

Punto de entrada de React. Localiza el elemento `#root`, crea la raíz de React con
`createRoot()`, importa los estilos globales (`styles/index.css`) y monta `<App />`
dentro de `<React.StrictMode>`. Intencionalmente mínimo: no contiene lógica de negocio
ni configuración de providers.

### src/App.jsx

Archivo central de la aplicación. Agrupa cuatro responsabilidades bajo el mismo archivo
por su naturaleza de configuración de entrada:

- **Árbol de providers:** anida los 7 contextos en el orden que establece sus
  dependencias. Ver `architecture/state_management.md`.
- **`TicketProviderWithNotifications`:** componente interno que implementa el patrón
  Bridge entre `TicketContext` y `NotificationContext`. El detalle técnico está en
  `architecture/state_management.md`.
- **`AppRoutes`:** define los tres árboles de rutas anidadas (usuario, admin, técnico)
  más las rutas públicas de autenticación. Envuelve todo en `<RequirePasswordChange>`.
  Ver `architecture/routing_and_roles.md`.
- **`RootRedirect`:** redirige la ruta raíz `/` al portal correspondiente según el rol
  del usuario autenticado.

### src/config/

**`ticketStatuses.js`** — Fuente única de verdad para todos los estados posibles de un
ticket. Exporta el array `TICKET_STATUSES` como constante. Todo componente que necesite
mostrar o filtrar por estado debe importar esta constante en lugar de definir valores
localmente. La lista de estados y sus reglas de transición están en
`features/ticketing_workflow.md`.

### src/context/

Los 7 archivos de contexto del sistema. El orden en el árbol de providers establece sus
dependencias. Los contratos completos de cada contexto están en
`architecture/state_management.md`.

**`ToastContext.jsx`** — Contexto de notificaciones efímeras de UI. Característica
arquitectónica relevante: a diferencia de los demás contextos, `ToastProvider` renderiza
su propio contenedor de toasts dentro del árbol de `children`. Es simultáneamente un
provider de estado y un componente visual.

**`ThemeContext.jsx`** — Gestiona la preferencia de tema (modo claro / oscuro). Persiste
en `localStorage`.

**`UserContext.jsx`** — Fuente única de verdad de los usuarios del sistema. Aplica
lógica de migración en la inicialización. Ver `development/mock_data_and_storage.md`.
Contiene la restricción de negocio que impide desactivar al último administrador activo.

**`NotificationContext.jsx`** — Almacena y gestiona las notificaciones del usuario.
Implementa sincronización entre pestañas del navegador. Ver `features/notifications.md`.

**`SettingsContext.jsx`** — Gestiona los datos de referencia del sistema: sectores,
categorías y subcategorías disponibles para clasificar tickets.

**`AuthContext.jsx`** — Gestiona la sesión del usuario autenticado. Depende de
`UserContext` (debe ser su hijo en el árbol). Mantiene la sesión sincronizada
automáticamente cuando los datos del usuario cambian en `UserContext`.

**`TicketContext.jsx`** — Ciclo de vida completo de los tickets. Recibe la prop
`onEvent` del bridge en `App.jsx` para emitir eventos sin acoplarse directamente a
`NotificationContext`.

### src/data/

Seeders de datos iniciales para el entorno de desarrollo.

**`mockUsers.js`** — Define el array de usuarios iniciales del sistema. Incluye al
menos un usuario de cada rol. Es la fuente de datos cuando `localStorage` no contiene
información de usuarios y la referencia para la lógica de migración de `UserContext`.

**`mockTickets.js`** — Define un conjunto de tickets de ejemplo que pueblan el sistema
en la primera carga. Cubre distintos estados y combinaciones para permitir una
demostración completa.

El funcionamiento de los seeders y la lógica de migración están en
`development/mock_data_and_storage.md`.

### src/pages/

Las 18 páginas están agrupadas en cuatro grupos según el rol que las consume. Todas son
componentes de nivel de ruta; ninguna contiene lógica de negocio independiente de los
contextos. Las rutas exactas y mecanismos de protección están en
`architecture/routing_and_roles.md`.

#### Páginas de autenticación (sin rol requerido)

**`LoginPage.jsx`** — Formulario de inicio de sesión. Punto de entrada para todos los
roles.

**`RegisterPage.jsx`** — Formulario de auto-registro de nuevos usuarios con rol
`usuario`.

**`ForgotPasswordPage.jsx`** — Simulación del flujo de recuperación de contraseña. Sin
envío real de email: muestra la nueva contraseña temporal en pantalla.

**`ChangePasswordPage.jsx`** — Página de cambio de contraseña obligatorio. Solo
accesible cuando el usuario tiene el flag `tempPassword` activo; `RequirePasswordChange`
garantiza esta restricción.

#### Rol usuario — `/dashboard`

**`UserPortal.jsx`** — Layout del portal de usuario. Contiene la navegación, el
encabezado y el `<Outlet>` de React Router para las sub-páginas. Nota de naming: usa el
sufijo "Portal" en lugar de "Layout" por convención histórica. Ver §4.

**`DashboardHome.jsx`** — Página de inicio del portal. Muestra un resumen de los
tickets del usuario autenticado.

**`CreateTicketPage.jsx`** — Formulario de creación de nuevo ticket. Usa datos de
`SettingsContext` para poblar los selectores de sector, categoría y subcategoría.

**`MyTicketsPage.jsx`** — Lista de todos los tickets del usuario con capacidad de
filtrado y acceso al detalle.

**`ProfilePage.jsx`** — Perfil del usuario: edición de datos personales y cambio de
contraseña.

#### Rol admin — `/admin`

**`AdminLayout.jsx`** — Layout del panel de administración. Navegación lateral con
todas las secciones y `<Outlet>` para sub-páginas.

**`AdminDashboard.jsx`** — Vista principal del admin. Muestra las métricas del sistema
utilizando `MetricsPanel`.

**`AdminTickets.jsx`** — Gestión de todos los tickets del sistema. Vista Kanban con
drag-and-drop, asignación de técnico y panel de detalle.

**`AdminUsers.jsx`** — Gestión completa de usuarios (ABM): creación, edición,
activación/desactivación y reset de contraseña.

**`AdminSettings.jsx`** — Panel de configuración del sistema: gestión de sectores,
categorías y subcategorías.

**`AdminProfile.jsx`** — Perfil del administrador. Funcionalidad equivalente a
`ProfilePage.jsx` en el contexto del layout de admin.

#### Rol técnico — `/tecnico`

**`TecnicoLayout.jsx`** — Layout del panel de técnico. Navegación y `<Outlet>` para
sub-páginas.

**`TecnicoTickets.jsx`** — Lista de tickets asignados al técnico autenticado con acceso
al panel de detalle y gestión de estado.

**`TecnicoProfile.jsx`** — Perfil del técnico. Funcionalidad equivalente a
`ProfilePage.jsx` en el contexto del layout de técnico.

### src/components/

Los 18 componentes reutilizables, agrupados por función. Los contratos de uso (props,
comportamiento) están en `ui_ux/reusable_components.md`.

#### Control de acceso

**`ProtectedRoute.jsx`** — Guarda de ruta. Verifica sesión activa y rol correcto. Si
el usuario no está autenticado, redirige a `/login`. Si el rol no coincide, redirige al
portal correspondiente al rol real del usuario. Su responsabilidad se limita a esta
validación.

**`RequirePasswordChange.jsx`** — HOC de restricción de negocio. Intercepta toda
navegación cuando el usuario tiene el flag `tempPassword` activo y redirige a
`/change-password`. También impide el acceso a `/change-password` cuando el flag no
está activo. Se aplica como wrapper de todo el árbol de rutas en `AppRoutes`.

#### Layout y navegación

**`DashboardHeader.jsx`** — Encabezado presente en los tres portales de rol. Muestra el
nombre del usuario, el rol activo e integra `ThemeToggle` y `NotificationBell`.

**`NotificationBell.jsx`** — Ícono de campana con badge numérico de notificaciones no
leídas. Al hacer clic, despliega el listado de notificaciones del usuario con opción de
marcarlas como leídas.

**`ThemeToggle.jsx`** — Botón de alternancia entre modo claro y oscuro. Es un
componente controlado externamente por `ThemeContext`. Implementa animación en el ícono
en cada alternancia.

#### Visualización de tickets

**`StatusBadge.jsx`** — Badge visual que materializa el estado de un ticket aplicando
los estilos del design system. Es el único punto de la interfaz donde el estado de un
ticket se representa visualmente.

**`TicketCard.jsx`** — Tarjeta de resumen de un ticket. Muestra datos principales y
soporta estado de expansión para compatibilidad con el drag-and-drop del Kanban.

**`SortableTicketCard.jsx`** — Wrapper de `TicketCard` que agrega comportamiento de
drag-and-drop mediante `@dnd-kit/sortable`. Existe como componente separado para
mantener `TicketCard` desacoplado de la librería. Solo se usa dentro de `KanbanColumn`.

**`KanbanColumn.jsx`** — Columna del tablero Kanban. Define una zona droppable de
`@dnd-kit` y renderiza las `SortableTicketCard` correspondientes a su estado.

**`TicketDetailPanel.jsx`** — Panel de detalle completo para el rol admin. Muestra todos
los campos del ticket, el historial, las observaciones internas y las acciones
disponibles según el estado actual.

**`TecnicoTicketPanel.jsx`** — Panel de detalle para el rol técnico. Estructura similar
a `TicketDetailPanel` pero con acciones y visibilidad ajustadas a las capacidades del
técnico.

#### Métricas y datos

**`MetricsPanel.jsx`** — Panel de métricas del AdminDashboard. Visualiza indicadores del
sistema usando Recharts. Es el único componente del proyecto que importa esta librería.
La lógica de cálculo de cada métrica está en `features/dashboard_metrics.md`.

**`HistoryTimeline.jsx`** — Visualización del historial de eventos de un ticket en
formato de línea de tiempo. Usa `ticketUtils.js` para formatear fechas.

**`DetailField.jsx`** — Componente atómico de presentación. Renderiza un par
`label / value` con la tipografía y espaciado estándar del design system.

#### Modales y formularios

**`ConfirmModal.jsx`** — Modal de confirmación genérico con mensaje variable y dos
acciones (confirmar / cancelar). Usado en operaciones destructivas o irreversibles.

**`PasswordModal.jsx`** — Modal para el ingreso de una nueva contraseña. Incluye
validación de coincidencia entre los dos campos.

**`UserFormModal.jsx`** — Modal de creación y edición de usuarios. Contiene el
formulario completo incluyendo selección de rol.

**`SettingFormModal.jsx`** — Modal para la gestión de sectores, categorías y
subcategorías. Reutilizado por las tres secciones de `AdminSettings.jsx`.

### src/utils/

Funciones puras: sin estado, sin efectos secundarios, sin dependencia de contextos React.

**`ticketUtils.js`** — Exporta las siguientes funciones:

| Función | Propósito |
|---|---|
| `getStatus(statuses, statusId)` | Busca un objeto de estado por ID. |
| `formatDate(isoString)` | Formatea fechas ISO 8601 al formato local de visualización. |
| `diffMinutes(isoStart, isoEnd)` | Calcula la diferencia en minutos entre dos fechas. |
| `getShortDescription(fullDescription, maxLength)` | Devuelve los primeros N caracteres de la descripción para previsualizaciones. No se persiste en el schema del ticket. |
| `buildHistoryEntry({ action, detail, actor, actorId })` | Construye una entrada de historial con el formato estándar del sistema. |
| `isOverSLA(ticket, thresholdDays)` | Evalúa si un ticket superó el umbral de días. Comportamiento oficial pendiente de decisión antes de documentarse en `features/ticketing_workflow.md`. |
| `formatActionDate(isoString)` | **@deprecated.** Delegada a `formatDate()`. Se mantiene para evitar errores en componentes no migrados. Debe eliminarse en una fase futura. |

### src/styles/

**`index.css`** — Único archivo de estilos globales del proyecto. Contiene las
directivas de TailwindCSS, las definiciones del sistema de diseño propio y los estilos
base. El detalle completo del sistema de diseño y sus tokens está en
`ui_ux/design_system.md`.

---

## 4. Convenciones de Naming

### Archivos de código fuente

| Tipo de archivo | Convención | Ejemplos verificados |
|---|---|---|
| Páginas auth y rol usuario | `{Contexto}Page.jsx` | `LoginPage.jsx`, `CreateTicketPage.jsx`, `MyTicketsPage.jsx` |
| Páginas admin y técnico | `{Rol}{Área}.jsx` sin sufijo Page | `AdminDashboard.jsx`, `AdminTickets.jsx`, `TecnicoTickets.jsx` |
| Layouts de rol | `{Rol}Layout.jsx` | `AdminLayout.jsx`, `TecnicoLayout.jsx` |
| Contextos | `{Nombre}Context.jsx` | `UserContext.jsx`, `TicketContext.jsx` |
| Componentes | PascalCase sin sufijo | `StatusBadge.jsx`, `MetricsPanel.jsx` |
| Datos mock | `mock{Entidad}.js` | `mockUsers.js`, `mockTickets.js` |
| Configuración | camelCase + `.js` | `ticketStatuses.js` |
| Utilidades | `{dominio}Utils.js` | `ticketUtils.js` |
| Estilos | lowercase | `index.css` |

### Excepciones documentadas

- **`UserPortal.jsx`** — usa el sufijo "Portal" en lugar de "Layout" por convención
  histórica. Los archivos nuevos deben usar `{Rol}Layout.jsx`.
- **`DashboardHome.jsx`** — página del rol usuario sin sufijo "Page".

### IDs de entidades

Los formatos de identificadores de las entidades pertenecen al modelo de datos y están documentados en `reference/data_schema.md`.

### Componentes internos de App.jsx

`App.jsx` contiene tres componentes que no se exportan como archivos independientes:
`TicketProviderWithNotifications`, `AppRoutes` y `RootRedirect`. Esta coubicación es
intencional: los tres son configuración de entrada de la aplicación y dependen de hooks
de contextos externos que deben estar disponibles en el árbol al momento de su
definición.
