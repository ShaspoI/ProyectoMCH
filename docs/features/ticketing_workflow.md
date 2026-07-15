---
title: "Flujo de Vida del Ticket"
category: features
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/state_management.md
  - reference/data_schema.md
  - features/notifications.md
---

# Flujo de Vida del Ticket

Este documento es el propietario exclusivo del ciclo de vida de un ticket: los estados válidos, las transiciones permitidas, quién puede ejecutar cada acción, las reglas de asignación, conformidad, cierre, reapertura y el SLA funcional. No documenta la estructura de las entidades (ver `reference/data_schema.md`), los contratos de los contextos (ver `architecture/state_management.md`) ni los componentes visuales.

---

## 1. Estados Válidos

El sistema define cinco estados para el ciclo de vida de un ticket. La fuente de verdad de los estados como entidad de configuración está en `reference/data_schema.md`.

| Estado (`id`) | Significado funcional |
|---|---|
| `pendiente` | El ticket fue creado y está en espera de atención. No tiene técnico asignado. |
| `asignado` | El administrador asignó un técnico al ticket. Aún no fue iniciado. |
| `en-proceso` | El técnico inició el trabajo. El problema está siendo atendido activamente. |
| `resuelto-pendiente` | El técnico marcó el trabajo como resuelto. Aguarda la conformidad del usuario. |
| `cerrado` | El usuario confirmó la resolución. El ticket no admite más cambios. |

---

## 2. Diagrama de Transiciones

```
[usuario]  ──────────────  PENDIENTE
                               │
[admin]    ──── asigna ────►  ASIGNADO
                               │
[técnico]  ─ inicia trabajo ─► EN PROCESO
                               │
[técnico]  ─ marca resuelto ─► RESUELTO — PEND. CONFORMIDAD
                               │                │
[usuario]  ─ confirma ────────► CERRADO         │
[usuario]  ─ rechaza ───────────────────────────► EN PROCESO
```

La única transición que recorre el flujo en sentido inverso es el rechazo de conformidad: el ticket regresa a `en-proceso` conservando el técnico asignado.

---

## 3. Transiciones y Permisos

El sistema no valida de forma centralizada la correspondencia entre el actor y el rol requerido para cada transición. La responsabilidad de exponer únicamente las acciones pertinentes a cada rol recae sobre la interfaz de usuario.

> Los efectos en historial y notificaciones de cada operación están documentados en `architecture/state_management.md §4.5` y `features/notifications.md`.

### 3.1. Creación

| Atributo | Valor |
|---|---|
| Actor | Usuario (`"usuario"`) |
| Estado resultante | `pendiente` |
| Condición | Sin condición previa. Cualquier usuario autenticado puede crear. |

### 3.2. Asignación de Técnico

| Atributo | Valor |
|---|---|
| Actor | Administrador (`"admin"`) |
| Estados desde los que puede ejecutarse | `pendiente`, `asignado`, `en-proceso` |
| Estado resultante (si venía de `pendiente`) | `asignado` |
| Estado resultante (si venía de `asignado` o `en-proceso`) | Sin cambio de estado; solo se actualiza el técnico asignado. |
| Condición | Debe seleccionarse un técnico distinto al actualmente asignado (si lo hubiera). |
| Efecto en `assignedAt` | Se registra **una sola vez** en la primera asignación. Las reasignaciones no modifican la fecha de primera asignación. |

### 3.3. Inicio de Trabajo

| Atributo | Valor |
|---|---|
| Actor | Técnico (`"tecnico"`) |
| Estado previo requerido | `asignado` |
| Estado resultante | `en-proceso` |
| Condición | El técnico autenticado debe ser el asignado al ticket. |

### 3.4. Marcado como Resuelto

| Atributo | Valor |
|---|---|
| Actor | Técnico (`"tecnico"`) |
| Estado previo requerido | `en-proceso` |
| Estado resultante | `resuelto-pendiente` |
| Condición | Ninguna condición adicional. |
| Efecto en campos | Se registra la fecha de resolución (`resolvedAt`). |

### 3.5. Confirmación de Conformidad (Cierre)

| Atributo | Valor |
|---|---|
| Actor | Usuario dueño del ticket (`"usuario"`) |
| Estado previo requerido | `resuelto-pendiente` |
| Estado resultante | `cerrado` |
| Condición | Solo el usuario que creó el ticket puede confirmar. |
| Efecto en campos | Se registra la fecha de cierre definitivo (`closedAt`). |

### 3.6. Rechazo de Conformidad (Reapertura)

| Atributo | Valor |
|---|---|
| Actor | Usuario dueño del ticket (`"usuario"`) |
| Estado previo requerido | `resuelto-pendiente` |
| Estado resultante | `en-proceso` |
| Condición | Solo el usuario que creó el ticket puede rechazar. |

### 3.7. Edición de Ticket

| Atributo | Valor |
|---|---|
| Actor | Usuario dueño (`"usuario"`) o Administrador (`"admin"`) |
| Estado previo requerido | `pendiente` (única condición) |
| Campos editables | `category`, `subcategory`, `deviceTag`, `fullDescription` |
| Condición | El ticket debe estar en estado `pendiente`. Si ya fue asignado o avanzó, no puede editarse. |

### 3.8. Cambio de Estado Libre (Admin)

| Atributo | Valor |
|---|---|
| Actor | Administrador (`"admin"`) |
| Alcance | El administrador puede cambiar el ticket a cualquier estado sin restricciones de flujo. Es la única transición del sistema que no requiere un estado de origen específico. |

---

## 4. Reglas de Observaciones

Las observaciones (`Observation`) son registros internos de texto libre que pueden agregarse a un ticket en cualquier punto de su ciclo de vida, con las siguientes restricciones:

- **Actores habilitados:** Administrador y Técnico en cualquier estado activo. El usuario también genera observaciones de forma automática cuando rechaza la conformidad.
- **Tickets cerrados:** Las observaciones **no pueden agregarse** a tickets en estado `cerrado`.
- **Sin efecto en el estado:** Agregar una observación nunca modifica el estado del ticket.
- **Registro en historial:** Cada observación genera automáticamente una entrada en el historial del ticket.

---

## 5. Historial Automático

Toda transición de estado y toda observación generan automáticamente una entrada en `Ticket.history`. El historial es inmutable: las entradas nunca se eliminan ni modifican. La estructura completa de una `HistoryEntry` está en `reference/data_schema.md`. Los efectos concretos de cada operación sobre el historial están documentados en `architecture/state_management.md`.

---

## 6. SLA Funcional

El sistema implementa un indicador de SLA (Service Level Agreement) funcional basado en un umbral fijo de tiempo:

- **Umbral:** 3 días calendario desde `createdAt`.
- **Criterio de activación:** El ticket está **fuera de SLA** si han transcurrido más de 3 días desde su creación y su estado **no es** `cerrado`.
- **Alcance:** El indicador de SLA es evaluado en las vistas del técnico y del administrador. No aplica a tickets cerrados.
- **Estado del umbral:** El valor de 3 días está fijo en la fase 4B-Core.
