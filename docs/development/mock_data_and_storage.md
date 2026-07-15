---
title: "Mock Data y Persistencia"
category: development
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/state_management.md
  - reference/data_schema.md
  - development/getting_started.md
---

# Mock Data y Persistencia

Este documento es el propietario exclusivo de la gestión del almacenamiento local del sistema: qué datos guarda cada clave, cómo se inicializan desde los seeders, cómo se migran cuando el schema cambia y cómo incorporar nuevos datos de desarrollo. No documenta los contratos de los contextos que administran esos datos (ver `architecture/state_management.md`), ni el schema de las entidades (ver `reference/data_schema.md`), ni los pasos de setup del entorno (ver `development/getting_started.md`).

---

## 1. Claves de Almacenamiento

Cada contexto que persiste su estado utiliza una clave exclusiva. La tabla completa de claves y sus propietarios está en `PROJECT_CONTEXT.md §8`. El detalle operativo de cada clave es el siguiente:

| Clave | Contenido | Seeder |
|---|---|---|
| `maintenance-users` | Lista completa de usuarios. | `src/data/mockUsers.js` |
| `maintenance-tickets-v3` | Lista completa de tickets (clave versionada). | `src/data/mockTickets.js` |
| `maintenance-settings` | Sectores, categorías y subcategorías. | Datos iniciales definidos internamente en el contexto. |
| `maintenance-notifications` | Lista de notificaciones. | Sin seeder; inicia vacío. |
| `maintenance-session` | Datos del usuario autenticado actualmente. | Sin seeder; inicia vacío. |
| `maintenance-theme` | Preferencia de tema (`"light"` o `"dark"`). | Sin seeder; usa `"light"` por defecto si no existe. |

---

## 2. Estrategias de Inicialización

### 2.1. Inicialización simple (la mayoría de los contextos)

Al arrancar, el contexto intenta leer su clave del almacenamiento local:
- Si la clave existe y el contenido es válido → usa los datos almacenados.
- Si la clave no existe o el contenido está corrupto → usa los datos del seeder correspondiente.

Este comportamiento aplica a: `maintenance-tickets-v3`, `maintenance-settings`, `maintenance-session` y `maintenance-theme`.

### 2.2. Inicialización con migración incremental (`maintenance-users`)

El contexto de usuarios usa un mecanismo adicional: al cargar los datos, compara los IDs de los usuarios persistidos contra los IDs definidos en el seeder. Si el seeder contiene usuarios que no están en el almacenamiento (por ejemplo, porque se agregaron en un commit posterior a la primera inicialización), los incorpora automáticamente sin modificar los usuarios ya existentes.

Este mecanismo permite agregar nuevos usuarios al entorno de desarrollo sin necesidad de limpiar el almacenamiento manualmente.

**Condición de emergencia:** si al cargar no existe ningún administrador activo en los datos, el sistema activa automáticamente la cuenta de administrador principal para garantizar que el sistema siempre tenga al menos un administrador operable. La regla funcional que fundamenta esta restricción está en `features/authentication.md §6`.

---

## 3. Versionado de Schema (Tickets)

La clave de tickets incluye un sufijo de versión numérico: `maintenance-tickets-v3`. Este sufijo se incrementa cada vez que el schema del ticket cambia de forma incompatible con la versión anterior.

**Efecto:** al incrementar el sufijo, la clave anterior queda huérfana en el almacenamiento del navegador. La clave nueva no tiene datos, por lo que el sistema inicializa desde el seeder (`src/data/mockTickets.js`) con el schema actualizado. Los datos de la clave vieja no se eliminan automáticamente; quedan inutilizados hasta que el desarrollador limpie el almacenamiento manualmente.

**Cuándo incrementar la versión:** únicamente cuando el nuevo schema es incompatible con el anterior, es decir, cuando los datos almacenados en la versión anterior producirían errores o comportamiento incorrecto al ser leídos con el nuevo código. Cambios aditivos (agregar un campo opcional con valor por defecto) generalmente no requieren versionado.

**Versión actual:** `v3`.

---

## 4. Procedimiento de Actualización de Schema

Cuando el schema de tickets cambia de forma incompatible:

1. Modificar la estructura de los objetos en `src/data/mockTickets.js` para que todos los tickets del seeder reflejen el nuevo schema.
2. Incrementar el sufijo de versión en la constante que define la clave de almacenamiento de tickets (de `maintenance-tickets-vN` a `maintenance-tickets-v(N+1)`).
3. Actualizar el schema en `reference/data_schema.md`.
4. Verificar que todos los componentes que leen campos del ticket sean compatibles con el nuevo schema.
5. Documentar el cambio de versión en este archivo (actualizar "Versión actual" en §3).

---

## 5. Archivos Seeder

Los datos iniciales del sistema de desarrollo provienen de dos fuentes:

**`src/data/mockUsers.js`**
Contiene 6 usuarios de desarrollo que cubren los tres roles del sistema. Incluye una advertencia de seguridad: las contraseñas están en texto plano únicamente a fines de demostración. Las credenciales de cada usuario están en `development/getting_started.md §5`.

**`src/data/mockTickets.js`**
Contiene 13 tickets de demostración distribuidos entre los distintos estados del ciclo de vida, asignados a los usuarios definidos en `mockUsers.js`. Todos los tickets tienen fuente `"whatsapp"`. Los tickets cubren múltiples categorías, sectores y técnicos para que las métricas y el tablero Kanban tengan datos representativos al primer arranque.

**Datos iniciales de configuración**
Los sectores, categorías y subcategorías iniciales del sistema no están en `src/data/` sino definidos directamente dentro del contexto de configuración. A diferencia de los seeders de usuarios y tickets, estos datos no tienen un archivo de referencia separado.

> **Nota de diseño:** esta asimetría entre los tres tipos de seeder (archivo externo vs. datos inline) es una deuda de consistencia pendiente de normalización. Funcionalmente no tiene impacto, pero dificulta la localización de los datos iniciales de configuración para un desarrollador nuevo.

---

## 6. Agregar Nuevos Datos de Desarrollo

### Agregar un nuevo usuario mock

1. Agregar un objeto al array en `src/data/mockUsers.js`. El ID debe seguir el formato `U-NNN` y no debe colisionar con IDs existentes.
2. No es necesario limpiar el almacenamiento: la migración incremental detectará el nuevo usuario y lo incorporará automáticamente en el próximo arranque.

### Agregar un nuevo ticket mock

1. Agregar un objeto al array en `src/data/mockTickets.js`, respetando el schema de `reference/data_schema.md`.
2. El ID debe seguir el formato `MT-NNN` y ser mayor que el máximo existente (actualmente `MT-1024`).
3. **Este cambio solo se verá en el navegador si el almacenamiento está limpio**, ya que el contexto de tickets no tiene migración incremental: si ya existen datos en `maintenance-tickets-v3`, el seeder no se vuelve a cargar.
4. Para forzar la recarga desde el seeder: eliminar la clave `maintenance-tickets-v3` del almacenamiento del navegador (ver `development/getting_started.md §6`).

### Agregar un nuevo sector, categoría o subcategoría inicial

1. Agregar el objeto a la constante correspondiente dentro del contexto de configuración (ver §5 — Datos iniciales de configuración).
2. Al igual que con los tickets, **este cambio solo se verá en el navegador si la clave `maintenance-settings` no existe**. Para forzar la recarga: eliminar esa clave del almacenamiento (ver `development/getting_started.md §6`).
