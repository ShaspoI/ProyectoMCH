---
title: "Sistema de Notificaciones"
category: features
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/state_management.md
  - features/ticketing_workflow.md
  - reference/data_schema.md
  - architecture/decisions/ADR-003_notification_decoupling.md
---

# Sistema de Notificaciones

Este documento es el propietario exclusivo del comportamiento funcional del sistema de notificaciones: los eventos que las generan, sus destinatarios, los mensajes visibles al usuario, las reglas de lectura, expiración y sincronización. No documenta la estructura de los datos (ver `reference/data_schema.md`), ni los mecanismos técnicos de persistencia y emisión de eventos (ver `architecture/state_management.md` y la decisión arquitectónica [`ADR-003`](architecture/decisions/ADR-003_notification_decoupling.md)).

---

## 1. Propósito del Sistema

El sistema de notificaciones informa a cada usuario sobre los eventos relevantes de los tickets que le conciernen. Cada notificación es personal: se dirige a un destinatario concreto y solo ese destinatario puede verla y gestionarla.

Las notificaciones no generan acciones ni modifican el estado de los tickets. Son registros informativos, persistentes y gestionables por el usuario.

---

## 2. Eventos y Mensajes

El sistema reconoce seis tipos de evento. Cada tipo tiene un destinatario funcional y un mensaje visible definidos.

| Evento | Disparado por | Destinatario funcional | Mensaje al destinatario |
|---|---|---|---|
| `ticket_created` | Creación de un ticket | Todos los administradores activos | *(Mensaje genérico: "Evento en ticket {ID}")* — ver nota |
| `ticket_assigned` | Asignación de técnico | Técnico asignado | *"Te asignaron el ticket {ID}"* |
| `ticket_status_changed` | Cambio de estado (caso general) | Usuario dueño del ticket | *"Tu ticket {ID} cambió a '{estado}'"* |
| `ticket_conformidad_required` | Ticket marcado como resuelto | Usuario dueño del ticket | *"Tu ticket {ID} está resuelto. Por favor confirmá la conformidad."* |
| `ticket_closed` | Cierre definitivo del ticket | Usuario dueño del ticket | *"Tu ticket {ID} fue cerrado exitosamente."* |
| `ticket_reopened` | Rechazo de conformidad por el usuario | Técnico asignado | *"El ticket {ID} fue reabierto por el usuario."* |

> **Nota sobre `ticket_created`:** En la fase 4B-Core, este evento no tiene un mensaje personalizado definido. El sistema genera un texto genérico. El diseño del mensaje específico está pendiente.

La relación entre cada evento y la transición de ticket que lo origina está documentada en `features/ticketing_workflow.md §3`.

---

## 3. Destinatarios Funcionales

El sistema distingue dos categorías de destinatario:

**Destinatario colectivo (`todos los administradores activos`):**
Aplica únicamente al evento `ticket_created`. Se notifica a todos los administradores activos en el momento del evento. Si no hay administradores activos, no se genera ninguna notificación.

**Destinatario individual:**
Aplica al resto de los eventos. La notificación se dirige a un único usuario identificado (el técnico asignado o el usuario dueño del ticket, según el evento). Solo ese usuario puede verla.

---

## 4. Reglas de Generación

- Las notificaciones se generan **automáticamente** como consecuencia de eventos del sistema de tickets. No pueden crearse manualmente.
- Cada evento genera **una notificación por destinatario**. Si el destinatario es colectivo (administradores), se genera una notificación individual por cada uno.
- Toda notificación nace con estado **no leída**.
- El texto del mensaje es fijo por tipo de evento. No es editable por el usuario.

---

## 5. Reglas de Lectura

- Cada usuario accede **únicamente a sus propias notificaciones**. Nunca ve las de otro usuario.
- El usuario puede marcar una notificación individual como leída.
- El usuario puede marcar **todas** sus notificaciones como leídas en una sola acción.
- No existe la posibilidad de eliminar notificaciones manualmente; solo expiran por antigüedad (ver §6).
- Las notificaciones no leídas se distinguen visualmente de las leídas en la interfaz.

---

## 6. Expiración y Persistencia

- Las notificaciones se persisten entre sesiones. No se pierden al cerrar el navegador.
- Las notificaciones con más de **30 días de antigüedad** se descartan automáticamente al iniciar el sistema. Esta limpieza ocurre en la inicialización, no de forma continua.
- No existe límite de cantidad de notificaciones por usuario dentro del período de 30 días.

---

## 7. Sincronización entre Pestañas

El sistema garantiza **sincronización eventual** entre pestañas del mismo navegador abiertas en paralelo. Cuando una pestaña genera o modifica notificaciones, el estado de las demás pestañas se actualiza automáticamente al detectar el cambio.

Esta sincronización es unidireccional por evento: la pestaña que origina el cambio propaga la actualización; las otras la reciben y actualizan su vista.

> **Limitación conocida (fase 4B-Core):** La sincronización entre pestañas es eventual, no instantánea. En producción, esta funcionalidad se reemplazaría por comunicación en tiempo real con el servidor.

---

## 8. Relación con el Flujo de Tickets

Las notificaciones son un **efecto secundario** del ciclo de vida del ticket, no una parte de él. Ninguna notificación modifica el estado de un ticket ni bloquea una transición.

La tabla de eventos de §2 y la tabla de transiciones de `features/ticketing_workflow.md §3` son complementarias:
- `ticketing_workflow.md` es propietario de **qué transición** genera cada evento.
- Este documento es propietario de **qué notificación** genera cada evento y **quién la recibe**.
