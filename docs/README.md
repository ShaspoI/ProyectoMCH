---
title: "Índice de Documentación Técnica"
category: meta
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
---

# Documentación Técnica — Sistema MCH

Este documento es el mapa de navegación de toda la documentación del proyecto.
No describe el sistema; describe **dónde encontrar información sobre el sistema**.

> Si llegás directamente aquí sin haber leído `PROJECT_CONTEXT.md`, comenzá por allí.
> `PROJECT_CONTEXT.md` es la puerta de entrada obligatoria al proyecto.

---

## Principios de Esta Documentación

### Ownership Rules

Cada concepto del sistema tiene exactamente **un documento propietario**. El resto de los documentos pueden mencionarlo, resumirlo o referenciarlo, pero nunca duplican el contenido.

**Regla de referencia:** Cuando un documento necesite mencionar un concepto cuyo propietario es otro documento, solo podrá resumirlo brevemente y deberá enlazar al documento propietario. Nunca deberá duplicar la explicación completa. Violar esta regla genera dos fuentes de verdad que divergen con el tiempo.

| Concepto | Documento propietario | Dónde se resume |
|---|---|---|
| Arquitectura de capas y arranque de la app | `architecture/overview.md` | `PROJECT_CONTEXT.md §3` |
| Mapa de archivos y carpetas | `architecture/project_structure.md` | `PROJECT_CONTEXT.md §3` |
| Contratos de contextos y patrón Bridge | `architecture/state_management.md` | `PROJECT_CONTEXT.md §4` |
| Sistema de rutas y protección de acceso | `architecture/routing_and_roles.md` | `PROJECT_CONTEXT.md §5` |
| Schema de todas las entidades de datos | `reference/data_schema.md` | Referenciado en features/* |
| Decisiones de arquitectura | `architecture/decisions/` | `PROJECT_CONTEXT.md §9` (una frase c/u) |
| Flujo completo de autenticación y sesión | `features/authentication.md` | `PROJECT_CONTEXT.md §5` |
| Ciclo de vida completo del ticket | `features/ticketing_workflow.md` | `PROJECT_CONTEXT.md §6` |
| Sistema de notificaciones: eventos y destinatarios | `features/notifications.md` | `PROJECT_CONTEXT.md §7` |
| Métricas del AdminDashboard | `features/dashboard_metrics.md` | — |
| Sistema de diseño visual (tokens, clases CSS) | `ui_ux/design_system.md` | `PROJECT_CONTEXT.md §2` |
| Contratos de uso de componentes reutilizables | `ui_ux/reusable_components.md` | — |
| Guía de setup de entorno | `development/getting_started.md` | — |
| Gestión de mock data y localStorage | `development/mock_data_and_storage.md` | `PROJECT_CONTEXT.md §8` (visión arq.) |
| Workflow de Git y ciclo de entrega | `development/git_workflow.md` | — |
| Historial de fases y estado actual | `development/roadmap.md` | `PROJECT_CONTEXT.md §12` (3 líneas) |
| Backlog de ideas y deuda técnica | `development/future_improvements.md` | — |

### Decisiones de Documentación

**`docs/reference/glossary.md` — No creado. Decisión registrada.**

El glosario de dominio vive en `PROJECT_CONTEXT.md §11`. Con el volumen de términos actual, crear un documento separado generaría dos fuentes de verdad para el mismo contenido. Esta decisión debe revisarse cuando el vocabulario del dominio supere los 20 términos o cuando el proyecto incorpore un backend con terminología propia. Si esa situación ocurre, se crea `glossary.md` en `reference/` y se elimina la tabla de `PROJECT_CONTEXT.md`.

---

## Inventario de Documentos

### Arquitectura

| Documento | Qué responde |
|---|---|
| [`architecture/overview.md`](architecture/overview.md) | ¿Cómo están organizadas las capas del sistema? ¿Qué ocurre cuando la app arranca? |
| [`architecture/project_structure.md`](architecture/project_structure.md) | ¿Dónde vive cada archivo? ¿Qué responsabilidad tiene cada directorio? |
| [`architecture/state_management.md`](architecture/state_management.md) | ¿Qué expone cada contexto? ¿Cómo se conectan entre sí? ¿Cómo funciona el Bridge? |
| [`architecture/routing_and_roles.md`](architecture/routing_and_roles.md) | ¿Cuáles son todas las rutas? ¿Cómo funcionan ProtectedRoute y RequirePasswordChange? |
| [`ADR-001`](architecture/decisions/ADR-001_context_api_vs_redux.md) | ¿Por qué Context API y no Redux? |
| [`ADR-002`](architecture/decisions/ADR-002_localstorage_as_db.md) | ¿Por qué LocalStorage como base de datos? |
| [`ADR-003`](architecture/decisions/ADR-003_notification_decoupling.md) | ¿Por qué NotificationContext está desacoplado? |
| [`ADR-004`](architecture/decisions/ADR-004_temp_password_flow.md) | ¿Por qué el cambio de contraseña tiene su propio HOC y ruta? |

### Funcionalidades

| Documento | Qué responde |
|---|---|
| [`features/authentication.md`](features/authentication.md) | ¿Cómo hace login un usuario? ¿Cómo funciona la sesión? ¿Cómo opera el flujo de contraseña temporal? |
| [`features/ticketing_workflow.md`](features/ticketing_workflow.md) | ¿Cuáles son todos los estados de un ticket? ¿Quién puede hacer cada transición? ¿Cómo funciona el historial? |
| [`features/notifications.md`](features/notifications.md) | ¿Qué eventos disparan notificaciones? ¿Quién las recibe? ¿Cómo se sincronizan entre pestañas? |
| [`features/dashboard_metrics.md`](features/dashboard_metrics.md) | ¿Cómo se calcula cada métrica del AdminDashboard? |

### Interfaz y Diseño

| Documento | Qué responde |
|---|---|
| [`ui_ux/design_system.md`](ui_ux/design_system.md) | ¿Cuáles son los tokens de color, clases de animación y convenciones visuales? |
| [`ui_ux/reusable_components.md`](ui_ux/reusable_components.md) | ¿Qué props acepta cada componente? ¿Cuándo usarlo y cuándo no? |

### Referencia

| Documento | Qué responde |
|---|---|
| [`reference/data_schema.md`](reference/data_schema.md) | ¿Qué campos tiene un ticket? ¿Cuál es el schema exacto de User, Notification, History? |

### Desarrollo y Planificación

| Documento | Qué responde |
|---|---|
| [`development/getting_started.md`](development/getting_started.md) | ¿Cómo levanto el proyecto desde cero? |
| [`development/mock_data_and_storage.md`](development/mock_data_and_storage.md) | ¿Cómo funciona el sistema de seeders? ¿Cómo migro el schema de tickets? |
| [`development/git_workflow.md`](development/git_workflow.md) | ¿Cómo hacemos commits? ¿Cuál es el ciclo oficial de cierre de fase? |
| [`development/roadmap.md`](development/roadmap.md) | ¿Qué se implementó en cada fase? ¿Qué viene después? |
| [`development/future_improvements.md`](development/future_improvements.md) | ¿Qué ideas y deuda técnica están pendientes? |

---

## Navegación por Escenario

Leer únicamente los documentos listados para cada escenario. Si los documentos listados no resuelven completamente la duda, seguir las referencias cruzadas del campo `related_docs` en el encabezado de cada documento antes de inspeccionar el código fuente.

---

**Quiero modificar el sistema de notificaciones**
1. `features/notifications.md` — comportamiento completo de eventos y destinatarios.
2. `architecture/state_management.md` — patrón Bridge y contratos de NotificationContext.
3. [`ADR-003`](architecture/decisions/ADR-003_notification_decoupling.md) — por qué el sistema está diseñado así.

---

**Quiero agregar un nuevo estado de ticket**
1. `features/ticketing_workflow.md` — el ciclo de vida actual y sus reglas.
2. `reference/data_schema.md` — schema del ticket y valores posibles de `status`.
3. `architecture/project_structure.md` — ubicación de `config/ticketStatuses.js`.

---

**Quiero agregar una nueva ruta o página**
1. `architecture/routing_and_roles.md` — tabla de rutas y mecanismo de protección.
2. `architecture/project_structure.md` — convenciones de naming y dónde crear el archivo.

---

**Quiero agregar un nuevo rol de usuario**
1. `architecture/routing_and_roles.md` — cómo funciona ProtectedRoute con roles.
2. `architecture/state_management.md` — contratos de AuthContext y UserContext.
3. `reference/data_schema.md` — schema del User y valores válidos de `role`.

---

**Quiero modificar o agregar campos al schema de un ticket**
1. `reference/data_schema.md` — schema actual del ticket.
2. `development/mock_data_and_storage.md` — procedimiento de versionado de clave (`-v3` → `-v4`).
3. `features/ticketing_workflow.md` — impacto en el flujo de negocio.

---

**Quiero entender el flujo completo de un ticket de punta a punta**
1. `features/ticketing_workflow.md` — ciclo de vida, estados, historial, SLA.
2. `features/notifications.md` — qué notificaciones genera cada transición.

---

**Quiero entender cómo funciona la autenticación y la sesión**
1. `features/authentication.md` — flujo completo de login, sesión y contraseña temporal.
2. `architecture/routing_and_roles.md` — cómo se protege el acceso post-autenticación.

---

**Quiero modificar el dashboard de métricas del admin**
1. `features/dashboard_metrics.md` — lógica de cada métrica.
2. `reference/data_schema.md` — campos del ticket que se usan en los cálculos.

---

**Quiero modificar un Context de React existente**
1. `architecture/state_management.md` — contrato actual del contexto: qué expone y cómo se conecta.
2. El feature doc del área afectada — para evaluar el impacto en el comportamiento visible.
3. `reference/data_schema.md` — si la modificación afecta las entidades que gestiona el contexto.
4. `development/mock_data_and_storage.md` — si la modificación afecta el schema persistido en localStorage.

---

**Quiero agregar un nuevo Context de React**
1. `architecture/state_management.md` — cómo están organizados los contextos actuales.
2. `architecture/overview.md` — árbol de providers y orden de dependencias.
3. [`ADR-001`](architecture/decisions/ADR-001_context_api_vs_redux.md) — por qué se usa Context API y sus trade-offs conocidos.

---

**Quiero agregar una nueva funcionalidad**
1. `PROJECT_CONTEXT.md` — comprensión general del sistema (obligatorio si no fue leído).
2. `architecture/state_management.md` — qué contextos existen y cómo extenderlos.
3. El feature doc más relacionado con la funcionalidad — para entender los patrones establecidos.
4. `reference/data_schema.md` — si la funcionalidad involucra nuevas entidades o campos.

---

**Quiero modificar el sistema de persistencia (localStorage)**
1. `development/mock_data_and_storage.md` — guía operativa completa.
2. `architecture/state_management.md` — cómo cada contexto sincroniza su estado.
3. `reference/data_schema.md` — schemas de las entidades que se persisten.

---

**Quiero agregar o modificar un componente reutilizable**
1. `ui_ux/reusable_components.md` — contratos de los componentes existentes.
2. `ui_ux/design_system.md` — clases CSS y tokens de diseño a aplicar.

---

**Quiero configurar el entorno de desarrollo desde cero**
1. `development/getting_started.md` — únicamente este documento.

---

**Quiero entender qué decisiones arquitectónicas se tomaron y por qué**
1. `architecture/decisions/` — leer los ADRs relevantes al área de trabajo.
2. `PROJECT_CONTEXT.md §9` — resumen de las cuatro decisiones principales.

---

**Quiero entender el historial y estado del proyecto**
1. `development/roadmap.md` — historial de fases y planificación futura.
2. `PROJECT_CONTEXT.md §12` — situación actual en tres líneas.

---

**Quiero proponer un cambio arquitectónico importante**
1. `architecture/decisions/` — revisar los ADRs existentes antes de proponer nada.
2. Verificar que la propuesta no contradiga ninguna decisión ya documentada.
3. Si la propuesta es válida: crear un nuevo ADR y presentarlo para revisión.
