---
title: "ADR 003: Desacoplamiento de Notificaciones"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - architecture/state_management.md
  - features/notifications.md
---

# ADR 003: Desacoplamiento de NotificationContext mediante Patrón Bridge

## Estado
Aceptado

## Contexto
El sistema MCH requiere generar notificaciones en tiempo real para los usuarios cuando ocurren eventos relevantes sobre los tickets (asignación, cambio de estado, solicitud de conformidad). 

La lógica central del negocio reside en `TicketContext`, el cual es el responsable de realizar las mutaciones de estado de los tickets. Por lo tanto, `TicketContext` es quien conoce de forma síncrona cuándo se debe emitir una notificación. Por otro lado, la gestión de las notificaciones (almacenamiento, listado, marcado como leído y persistencia) pertenece estructuralmente a `NotificationContext`.

Si `TicketContext` importara directamente `useNotifications` desde `NotificationContext`, se crearía un acoplamiento fuerte entre dos dominios distintos. Además, en el árbol de proveedores de la aplicación (`App.jsx`), `NotificationProvider` envuelve estructuralmente a `TicketProvider`. Esto significa que si `NotificationContext` debiera consultar el estado del ticket, se generaría una dependencia circular.

Adicionalmente, `TicketContext` emite eventos dirigidos tanto a individuos (ID de usuario) como a grupos funcionales (ej. solicitar enviar notificación a `"admin"`). Sin embargo, `NotificationContext` está diseñado puramente para almacenar notificaciones por identificadores de usuario concretos (IDs), requiriendo una capa intermedia que resuelva roles como `"admin"` buscando a los usuarios activos en `UserContext`.

## Decisión
Se decidió implementar un patrón **Bridge** para desacoplar completamente la emisión de eventos desde el dominio de tickets, respecto de la generación de notificaciones.

1. **`TicketContext`** expone una prop en su Provider llamada `onEvent(type, recipientId, payload)`. Emite eventos genéricos desconociendo totalmente qué sistema los procesará.
2. **`NotificationContext`** expone la función `addNotification(type, userId, payload)` para registrar alertas dirigidas a usuarios específicos, desconociendo por completo las reglas de transición de los tickets.
3. Se creó un componente intermediario en `App.jsx` llamado **`TicketProviderWithNotifications`**. Este componente:
   - Consume `NotificationContext` y `UserContext`.
   - Actúa como puente: inyecta su propia función manejadora en la prop `onEvent` de `TicketProvider`.
   - Intercepta los eventos, resuelve los destinatarios genéricos (ej. busca a los administradores activos en la lista de usuarios de `UserContext`) y finalmente llama a `addNotification` reiteradas veces con los IDs reales.

## Consecuencias

### Positivas
- **Inversión de Dependencias:** `TicketContext` y `NotificationContext` son funcionalmente ortogonales. Ninguno importa los hooks del otro, manteniendo la base de código modular.
- **Responsabilidad Única:** La lógica de enrutamiento y resolución de destinatarios por rol (ej. descubrir "quiénes son administradores activos") no contamina ni a los tickets ni a las notificaciones; se maneja exclusivamente en la capa de integración del Bridge.
- **Evolución:** Si en el futuro (como está previsto en la migración a arquitectura cliente-servidor) las notificaciones pasan a enviarse mediante WebSockets o llamadas a una API, `TicketContext` no sufrirá ninguna modificación. Únicamente se actualizará la implementación del componente Bridge.

### Negativas / Riesgos Aceptados
- **Lógica en la capa de configuración global:** El componente puente `TicketProviderWithNotifications` introduce lógica de enrutamiento de eventos explícitamente en `App.jsx`, un archivo que tradicionalmente debería limitarse a declarar el árbol de rutas y dependencias.
- **Diccionario de mensajes con acoplamiento semántico:** Si bien `NotificationContext` ignora la lógica del negocio de los tickets, la función interna `buildMessage` dentro del contexto contiene plantillas de texto específicas para eventos como `"ticket_assigned"`. Esta decisión se aceptó temporalmente por simplicidad del MVP para centralizar los textos en un solo punto, aunque genera un acoplamiento semántico leve de dominios.
