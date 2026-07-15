# PROJECT_CONTEXT — Sistema de Gestión de Tickets MCH

```
Proyecto:        MCH — Sistema de Gestión de Tickets de Mantenimiento
Fase de origen:  4B-Core
Última revisión: 4B-Core
Estado:          Estable
Documentación:   docs/README.md
```

---

> [!IMPORTANT]
> **Para asistentes de IA:** Este documento es tu punto de entrada obligatorio al proyecto.
> Lee las secciones 1 a 11 antes de cualquier interacción con el código fuente.
> La sección 12 describe la situación actual de desarrollo.

---

## Regla de Oro del Proyecto

> **La documentación es la fuente de verdad del proyecto.**
> Si existe una diferencia entre la documentación y el código, esa diferencia debe resolverse
> antes de continuar con nuevas funcionalidades. El código implementa lo que la documentación
> describe. La documentación registra lo que el código implementa. Ninguno puede divergir del otro.

---

## Protocolo Oficial para Asistentes de IA

```
Paso 1: Leer completo PROJECT_CONTEXT.md (este documento).
Paso 2: Leer completo docs/README.md.
Paso 3: Identificar en el índice por tarea qué documentos son relevantes.
Paso 4: Leer únicamente esos documentos.
Paso 5: Si la documentación no alcanza, consultar el código fuente como fuente secundaria.

Paso 6 (OBLIGATORIO): Si durante la consulta del código se detecta una inconsistencia
        entre la implementación y la documentación, DETENER la tarea y proponer al usuario
        una de las siguientes acciones antes de continuar:

        a) Actualizar la documentación para reflejar el estado real del código.
        b) Corregir el código para que se alinee con lo que la documentación describe.

        Nunca normalizar ni ignorar diferencias entre código y documentación.

Regla adicional: Nunca proponer soluciones que contradigan decisiones registradas en los ADR
        sin señalarlo explícitamente. Consultar docs/architecture/decisions/ antes de proponer
        cambios arquitectónicos.
```

---

## 1. Objetivo del Proyecto

El sistema MCH es un **MVP** de una plataforma de gestión de tickets de mantenimiento corporativo. Su propósito es permitir que los empleados de una organización reporten incidentes en sus áreas de trabajo, que los técnicos gestionen su resolución, y que los administradores supervisen la operatividad mediante métricas y controles.

El sistema opera íntegramente en el **frontend**, sin backend real ni autenticación de servidor. Esta es una decisión de diseño documentada en [`ADR-002`](docs/architecture/decisions/ADR-002_localstorage_as_db.md). La migración planificada hacia una arquitectura cliente-servidor está registrada en `docs/development/future_improvements.md`.

---

## 2. Stack Tecnológico

| Capa              | Tecnología            | Propósito                                          |
|-------------------|-----------------------|----------------------------------------------------|
| Framework UI      | React 19.1.1          | Desarrollo de componentes.                          |
| Bundler           | Vite                  | Compilación y servidor de desarrollo.               |
| Enrutamiento      | React Router DOM v7   | Navegación y protección de rutas.                   |
| Estado global     | React Context API     | Gestión de estado sin dependencias externas.        |
| Estilos           | TailwindCSS           | Utilidades CSS + sistema de diseño propio.          |
| Iconografía       | Lucide React          | Íconos consistentes en toda la interfaz.            |
| Gráficos          | Recharts              | Visualización de métricas en el AdminDashboard.     |
| Drag-and-drop     | @dnd-kit              | Ordenamiento de tarjetas en la vista Kanban.        |
| Persistencia      | `localStorage`        | Base de datos simulada para el MVP.                 |

El sistema de diseño es propio, basado en la estética **Dark Glassmorphism**: fondos desenfocados, gradientes vibrantes y bordes translúcidos. No se utilizan librerías de componentes UI externas. El detalle del sistema de diseño está en `docs/ui_ux/design_system.md`.

---

## 3. Arquitectura General

El proyecto es una **SPA** (Single Page Application) sin backend. Toda la lógica de negocio reside en **React Contexts** que actúan como controladores de estado. La persistencia se logra sincronizando cada contexto con `localStorage`.

```
src/
├── main.jsx      ← Punto de entrada. Monta <App />.
├── App.jsx       ← Árbol de providers y configuración de rutas.
├── config/       ← Configuraciones estáticas (ej: estados de ticket).
├── context/      ← Lógica de negocio. Fuente de verdad del sistema.
├── pages/        ← Vistas por rol (admin, tecnico, usuario) y auth.
├── components/   ← Componentes reutilizables y atómicos.
├── data/         ← Seeders de datos iniciales (mockUsers, mockTickets).
├── utils/        ← Funciones utilitarias puras.
└── styles/       ← Estilos globales y definición del sistema de diseño.
```

La descripción detallada de cada directorio y archivo está en `docs/architecture/project_structure.md`.

---

## 4. Contextos de Estado Global

El sistema utiliza **7 contextos** de React. El orden del árbol de providers en `App.jsx` establece las dependencias entre ellos y es significativo.

### Árbol de Providers (de externo a interno)

```
<ToastProvider>
  <ThemeProvider>
    <UserProvider>              ← Fuente de verdad de todos los usuarios.
      <NotificationProvider>
        <SettingsProvider>
          <AuthProvider>        ← Depende de UserProvider para autenticar.
            <TicketProvider>    ← Recibe onEvent vía bridge.
```

### Responsabilidades por Contexto

**`UserContext`** — Fuente única de verdad de los usuarios del sistema. Gestiona creación, edición de perfil, activación/desactivación, reseteo de contraseña y el flag `tempPassword` para el flujo de cambio obligatorio de clave. Clave de almacenamiento: `maintenance-users`.

**`AuthContext`** — Gestión de sesión del usuario autenticado. Delega la validación de credenciales a `UserContext` y mantiene el objeto de sesión sincronizado con cualquier cambio en los datos del usuario. Clave de almacenamiento: `maintenance-session`.

**`TicketContext`** — Ciclo de vida completo de los tickets. Centraliza creación, cambios de estado, asignación de técnico, observaciones internas, historial automático de eventos y confirmación de conformidad. Recibe una prop `onEvent` que dispara un callback al sistema de notificaciones sin acoplarse directamente a él. Clave de almacenamiento: `maintenance-tickets-v3` (versionada, ver Sección 8).

**`NotificationContext`** — Almacenamiento y gestión de notificaciones. Totalmente desacoplado de la lógica de negocio: no conoce los tipos de eventos del sistema. Clave de almacenamiento: `maintenance-notifications`.

**`SettingsContext`** — Gestiona los datos de referencia del sistema: sectores de la organización, categorías y subcategorías de tickets. Estos datos son los que el usuario selecciona al clasificar un nuevo ticket y pueden ser administrados desde el panel de configuración. Clave de almacenamiento: `maintenance-settings`.

**`ThemeContext`** — Modo claro / oscuro. Persiste la preferencia del usuario. Clave de almacenamiento: `maintenance-theme`.

**`ToastContext`** — Feedback inmediato mediante toasts efímeros. No persiste.

### El Patrón Bridge

`TicketContext` emite eventos con destinatarios genéricos (ej: `"admin"`). `NotificationContext` solo acepta IDs de usuario concretos. El componente `TicketProviderWithNotifications` en `App.jsx` actúa como **bridge**: intercepta los eventos, resuelve los destinatarios consultando `UserContext`, y llama a `addNotification` con los IDs reales. Este patrón mantiene ambos contextos desacoplados y permite reemplazar cualquiera de los dos de forma independiente.

La documentación completa de los contratos entre contextos está en `docs/architecture/state_management.md`.

---

## 5. Roles y Permisos

El sistema implementa tres roles con acceso completamente segregado mediante `ProtectedRoute`. Cada rol tiene su propio árbol de rutas y layout.

| Rol       | Ruta base    | Capacidades principales                                                            |
|-----------|--------------|------------------------------------------------------------------------------------|
| `usuario` | `/dashboard` | Crear tickets, ver sus propios tickets, dar o rechazar conformidad de resolución.  |
| `tecnico` | `/tecnico`   | Ver tickets asignados, cambiar estado de progreso, agregar observaciones internas. |
| `admin`   | `/admin`     | Dashboard de métricas, asignar técnicos, gestionar usuarios (ABM completo).        |

**Regla invariable:** El sistema nunca permite desactivar al último administrador activo. Esta restricción se valida antes de aplicar cualquier cambio de estado de usuario.

**Protección de rutas:** `ProtectedRoute` valida exclusivamente rol y sesión. Las restricciones de negocio, como forzar el cambio de una contraseña temporal, se implementan en HOCs dedicados (`RequirePasswordChange`), manteniendo a `ProtectedRoute` con responsabilidad única. Esta separación técnica está documentada en el [`ADR-004`](docs/architecture/decisions/ADR-004_temp_password_flow.md).

La documentación del flujo de autenticación y sesión está en `docs/features/authentication.md`.

---

## 6. Flujo de Tickets

El ciclo de vida de un ticket es secuencial y controlado. Cada transición de estado se registra automáticamente como una entrada en el historial del ticket.

```
[usuario]   PENDIENTE
                │
[admin]    ASIGNADO  ← Admin asigna un técnico.
                │
[tecnico]  EN PROCESO ← Técnico inicia el trabajo.
                │
[tecnico]  RESUELTO — PENDIENTE CONFORMIDAD ← Técnico marca como resuelto.
            │           │
[usuario]  CERRADO   RECHAZA → EN PROCESO  ← Usuario evalúa la resolución.
```

Cuando el usuario rechaza la conformidad, el ticket regresa a `en-proceso` y el técnico asignado recibe una notificación de reapertura. Esta es la única transición que recorre el flujo en sentido inverso.

**SLA:** Un umbral fijo de 3 días activa un indicador visual (SLA badge) en las interfaces del técnico y del administrador.

La documentación completa del flujo, estados e historial está en `docs/features/ticketing_workflow.md`.

---

## 7. Sistema de Notificaciones

El sistema de notificaciones es **event-driven** y opera íntegramente en el cliente. Cada acción relevante sobre un ticket emite un evento que `TicketContext` transmite al bridge en `App.jsx`. El bridge identifica al destinatario correcto y genera la notificación mediante `NotificationContext`.

La sincronización entre múltiples pestañas del navegador se implementa escuchando el evento nativo `storage` de `window`, lo que permite re-hidratar el estado de `NotificationContext` cuando otra pestaña modifica el storage.

La documentación completa de eventos, destinatarios y arquitectura del sistema está en `docs/features/notifications.md`.

---

## 8. Persistencia de Datos (localStorage)

El sistema utiliza `localStorage` como base de datos simulada. Los contextos de datos del sistema persisten su estado con las siguientes claves:

| Clave                       | Contexto              | Contenido                              |
|-----------------------------|-----------------------|----------------------------------------|
| `maintenance-users`         | `UserContext`         | Lista completa de usuarios.             |
| `maintenance-session`       | `AuthContext`         | Objeto del usuario autenticado.         |
| `maintenance-tickets-v3`    | `TicketContext`       | Lista completa de tickets. (Versionada) |
| `maintenance-notifications` | `NotificationContext` | Lista de notificaciones.                |
| `maintenance-settings`      | `SettingsContext`     | Sectores, categorías y subcategorías.   |
| `maintenance-theme`         | `ThemeContext`        | Preferencia de tema (dark/light).       |

**Claves versionadas:** La clave de `TicketContext` incluye un sufijo de versión numérico. La versión actual es `maintenance-tickets-v3`. Cuando el schema de datos cambia de forma incompatible con la versión anterior, ese número se incrementa para forzar la recarga desde los seeders y prevenir errores de lectura de datos corruptos. El procedimiento de actualización está documentado en `docs/development/mock_data_and_storage.md`.

**Seeders:** Los archivos en `src/data/` son datos iniciales de desarrollo. Solo se usan cuando `localStorage` está vacío o cuando se incorporan nuevos usuarios al mock. El schema de todas las entidades del sistema está en `docs/reference/data_schema.md`.

---

## 9. Decisiones Arquitectónicas Clave

Las decisiones de arquitectura están documentadas en detalle en `docs/architecture/decisions/`. Las cuatro decisiones fundamentales del sistema son:

- **Context API en lugar de Redux** — [`ADR-001`](docs/architecture/decisions/ADR-001_context_api_vs_redux.md): La escala del proyecto no justifica la complejidad de Redux; Context API es suficiente y elimina dependencias externas.

- **LocalStorage como base de datos simulada** — [`ADR-002`](docs/architecture/decisions/ADR-002_localstorage_as_db.md): El sistema es un MVP frontend-only; LocalStorage permite demostrar toda la lógica de negocio sin infraestructura de backend.

- **Desacoplamiento de NotificationContext** — [`ADR-003`](docs/architecture/decisions/ADR-003_notification_decoupling.md): `NotificationContext` no conoce la lógica de tickets; el bridge en `App.jsx` resuelve los destinatarios, permitiendo reemplazar ambos sistemas de forma independiente.

- **Flujo de contraseña temporal en HOC separado** — [`ADR-004`](docs/architecture/decisions/ADR-004_temp_password_flow.md): Las restricciones de negocio no viven en `ProtectedRoute`; un HOC dedicado garantiza separación de responsabilidades.

---

## 10. Organización de la Documentación

La documentación técnica completa reside en `docs/`. El índice navegable y la guía de lectura por tarea están en `docs/README.md`.

```
docs/
├── README.md         ← Índice inteligente. Primer documento a leer después de este.
├── architecture/     ← Cómo está construido el sistema.
│   └── decisions/   ← ADR: Registro de Decisiones de Arquitectura.
├── features/         ← Qué hace el sistema y cómo se comporta.
├── ui_ux/            ← Sistema de diseño y contratos de componentes.
├── reference/        ← Documentación consultable: schemas, contratos.
└── development/      ← Guías operativas, workflow, roadmap y backlog.
```

Todos los documentos en `docs/` comparten un encabezado estándar con metadatos: `title`, `category`, `phase`, `updated_in`, `status` y `related_docs`.

---

## 11. Convenciones del Proyecto

**Principio de responsabilidad única:** Cada documento cubre un único tema principal. Si comienza a cubrir más de uno, se divide.

**Voz activa:** *"El contexto expone X"*, nunca *"X es expuesto por el contexto"*.

**Referencias cruzadas:** Paths relativos desde la raíz del repositorio.

**Glosario del dominio:**

| Término         | Definición                                                                                           |
|-----------------|------------------------------------------------------------------------------------------------------|
| **Ticket**      | Solicitud de mantenimiento creada por un `usuario`.                                                   |
| **Conformidad** | Confirmación del `usuario` de que el problema fue resuelto satisfactoriamente.                        |
| **SLA**         | Indicador visual de tickets que superan el umbral de días sin cierre.                                 |
| **Técnico**     | Rol responsable de la resolución técnica del ticket.                                                  |
| **Admin**       | Rol con acceso completo al sistema de gestión.                                                        |
| **Seeder**      | Archivo de datos iniciales que puebla `localStorage` en el primer arranque.                           |
| **Bridge**      | Componente en `App.jsx` que traduce eventos genéricos de `TicketContext` en notificaciones concretas. |
| **ADR**         | Architecture Decision Record. Documento que registra una decisión de diseño con su contexto y alternativas evaluadas. |

---

## 12. Situación Actual del Proyecto

> Esta es la única sección de este documento que evoluciona entre fases.
> El historial completo y la planificación futura están en `docs/development/roadmap.md`.

**Fase actual:** `4B-Core` — Cerrada y estabilizada.

**Próxima fase:** `4C` — Exportación de datos (reportes CSV) y métricas avanzadas.

**Actividad en curso:** Generación de la documentación técnica (`docs/`).
