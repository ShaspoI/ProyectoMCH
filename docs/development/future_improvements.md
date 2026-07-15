---
title: "Backlog y Deuda Técnica"
category: development
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - development/roadmap.md
  - development/mock_data_and_storage.md
  - development/git_workflow.md
---

# Backlog y Deuda Técnica

Este documento es el propietario exclusivo del registro de mejoras a largo plazo, ideas pendientes de evaluación y la lista de deuda técnica detectada en el proyecto. No documenta la planificación inmediata de las próximas fases (ver `development/roadmap.md`).

---

## 1. Migración a Arquitectura Cliente-Servidor (Backend Real)

El sistema MCH opera actualmente como una Single Page Application (SPA) sin backend, utilizando almacenamiento local como base de datos y React Context como controladores de estado. La principal evolución planificada consiste en incorporar un backend real.

### Implicancias de la migración:
- **Base de Datos:** Reemplazar el almacenamiento local y los seeders por una base de datos relacional y un ORM.
- **Autenticación:** Implementar un sistema real de identidades (sesión en servidor o tokens) para reemplazar la simulación actual. Las contraseñas en texto plano de los seeders deberán ser encriptadas de forma segura.
- **Notificaciones:** Migrar el sistema de eventos en cliente a una solución de comunicación bidireccional (ej. WebSockets) para recibir notificaciones en tiempo real desde el servidor.
- **Asignación de Identificadores:** La generación incremental de IDs de tickets (`MT-1025`) pasará a ser responsabilidad exclusiva de la base de datos centralizada.

---

## 2. Deuda Técnica Conocida

### 2.1. Asimetría en Seeders de Datos Iniciales
- **Descripción:** Las entidades principales (`UserContext`, `TicketContext`) cargan sus datos desde archivos externos (`src/data/`), pero la configuración inicial (sectores y categorías) se define de forma *inline* como constantes dentro del `SettingsContext`.
- **Acción requerida:** Normalizar todos los seeders extrayendo la configuración inicial a un archivo dedicado `mockSettings.js` en `src/data/`.
- **Referencia:** El procedimiento de hidratación actual está documentado en `development/mock_data_and_storage.md`.

### 2.2. Nomenclatura de Rama Activa
- **Descripción:** La rama principal de trabajo en el control de versiones contiene un error tipográfico (`freature/agusgaja` en lugar de `feature/agusgaja`). Este error está propagado tanto en el repositorio local como en el remoto.
- **Acción requerida:** Renombrar la rama local, subir la nueva rama al remoto y actualizar la rama predeterminada en la plataforma Git, para luego eliminar la rama con el error.
- **Referencia:** Las convenciones de Git del proyecto están en `development/git_workflow.md`.

---

## 3. Backlog de Ideas Funcionales

Las siguientes características representan ideas a futuro sin una fase de implementación asignada:

- **Integración Multicanal:** Generación de notificaciones por email o WhatsApp para usuarios que se encuentran fuera de la aplicación.
- **Gestión de Inventario y Repuestos:** Vincular la resolución de los tickets con un catálogo de piezas para descontar stock en tiempo real.
- **Mantenimiento Preventivo:** Programación de tickets recurrentes basados en tiempo (ej. revisiones de rutina).
- **Sistema de Permisos Granulares:** Reemplazar el control de acceso basado rígidamente en el rol principal por un sistema de permisos basado en capacidades (claims).
