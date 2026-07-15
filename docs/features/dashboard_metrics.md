---
title: "Métricas del Panel de Administración"
category: features
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - features/ticketing_workflow.md
  - reference/data_schema.md
---

# Métricas del Panel de Administración

Este documento es el propietario exclusivo de la definición de cada métrica disponible en el panel de administración: qué mide, qué datos utiliza para calcularse, cómo se presentan los resultados y qué limitaciones tiene cada una. No documenta la estructura de las entidades de datos (ver `reference/data_schema.md`), ni el ciclo de vida de los tickets (ver `features/ticketing_workflow.md`).

---

## 1. Contexto

El panel de administración expone dos superficies de métricas:

- **Vista principal del administrador:** muestra contadores de estado y análisis comparativos en tarjetas siempre visibles.
- **Panel analítico lateral:** muestra distribución, tendencias y tiempos de resolución en gráficos interactivos. Es accesible desde la vista de tickets.

Ambas superficies operan sobre el conjunto completo de tickets del sistema en tiempo real. No existe un mecanismo de agregación previa ni un período de actualización: los valores se recalculan en cada renderizado a partir del estado actual.

---

## 2. Métricas de la Vista Principal

### 2.1. Contadores de Estado

Cinco contadores muestran cuántos tickets se encuentran actualmente en cada estado del ciclo de vida.

| Métrica | Definición |
|---|---|
| Pendientes | Tickets en estado `pendiente`. |
| Asignados | Tickets en estado `asignado`. |
| En Proceso | Tickets en estado `en-proceso`. |
| Por Cerrar | Tickets en estado `resuelto-pendiente`. |
| Cerrados | Tickets en estado `cerrado`. |

Los estados válidos y su significado funcional están en `features/ticketing_workflow.md §1`.

### 2.2. Usuarios Activos

Cantidad de usuarios registrados en el sistema con estado `Activo`, sin distinción de rol.

### 2.3. Rendimiento de Resolución

Tiempo promedio transcurrido desde la **creación** hasta el **cierre definitivo** de un ticket.

**Criterio de inclusión:** solo se consideran los tickets en estado `cerrado` que posean tanto fecha de creación como fecha de cierre definitivo registradas.

**Unidad y precisión:** días, con un decimal (ej. `2.4`).

**Resultado vacío:** si no existen tickets que cumplan el criterio, se muestra `"—"`.

> Esta métrica refleja el ciclo completo de vida del ticket: desde que el usuario lo crea hasta que confirma la conformidad. No mide el tiempo hasta la primera marcación como resuelto por el técnico — esa métrica corresponde al panel analítico lateral (ver §3.2).

### 2.4. Tickets por Sector

Distribución de tickets agrupados por el sector de pertenencia del usuario que los creó.

**Criterio de agrupación:** se usa el sector registrado en el momento de la creación del ticket. Si ese dato no estuviera disponible, el ticket se agrupa bajo la categoría `"Sin asignar"`.

**Presentación:** se muestran únicamente los 4 sectores con mayor cantidad de tickets, ordenados de mayor a menor. Cada sector se presenta con una barra proporcional al sector líder.

**Resultado vacío:** si no existen tickets en el sistema, no se muestra ningún resultado.

---

## 3. Métricas del Panel Analítico Lateral

### 3.1. Distribución por Estado

Distribución porcentual y absoluta de todos los tickets del sistema, agrupados por estado actual.

**Presentación:** gráfico de dona. Cada segmento representa un estado. Al pasar sobre un segmento se muestra el recuento absoluto y el porcentaje sobre el total.

**Base del porcentaje:** total de tickets en el sistema, independientemente del estado.

### 3.2. Tiempo Promedio de Resolución Técnica

Tiempo promedio transcurrido desde la **creación** hasta el **marcado como resuelto** por el técnico.

**Criterio de inclusión:** todos los tickets que posean fecha de resolución técnica registrada, independientemente de su estado actual.

**Unidad y precisión:** minutos, presentados en formato legible (ej. `1h 30m`, `45 min`).

**Resultado vacío:** si no existen tickets con fecha de resolución técnica, se muestra `"—"`.

> Esta métrica difiere de la de la vista principal (§2.3): mide el tiempo hasta que el técnico considera el trabajo terminado, no hasta que el usuario confirma la conformidad. Un ticket puede tener esta métrica registrada aunque haya sido reabierto posteriormente.

### 3.3. Tendencias de Creación

Evolución de la cantidad de tickets creados por día a lo largo del tiempo.

**Criterio:** agrupa todos los tickets existentes por la fecha de calendario de su creación.

**Presentación:** gráfico de barras vertical, con el eje horizontal representando los días y el eje vertical la cantidad de tickets. Los días se ordenan cronológicamente.

**Resultado vacío:** si no existen tickets, el gráfico no muestra datos.

---

## 4. Limitaciones Conocidas

- Todas las métricas se calculan sobre el universo completo de tickets del sistema, sin posibilidad de filtrar por período, rol, técnico o sector.
- No existe persistencia de métricas históricas: si un ticket es modificado, los valores cambian retroactivamente.
- La incorporación de filtros, exportación de datos y métricas adicionales está pendiente de implementación.
