---
title: "Workflow de Git y Ciclo de Entrega"
category: development
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - development/getting_started.md
---

# Workflow de Git y Ciclo de Entrega

Este documento es el propietario exclusivo de las convenciones de commits, la gestión de ramas y el ciclo oficial de cierre de fase del proyecto. No documenta el historial de fases ni su contenido (ver `development/roadmap.md`), ni los pasos de configuración del entorno (ver `development/getting_started.md`).

---

## 1. Convención de Commits

El proyecto usa el formato **Conventional Commits** con un subconjunto reducido de tipos. Los commits deben ser descriptivos y autoexplicativos.

**Formato:**

```
<tipo>: <descripción en minúsculas>
```

**Tipos válidos:**

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Se completa una funcionalidad nueva o se cierra una fase. |
| `fix` | Se corrige un error de comportamiento detectado en QA. |
| `refactor` | Se reestructura código sin cambiar el comportamiento observable. |
| `docs` | Se crea o actualiza documentación técnica. |
| `chore` | Cambios de configuración, dependencias o infraestructura sin impacto en el código de la aplicación. |

**Ejemplos reales del historial del proyecto:**

```
feat: complete phase 4B-Core - notifications, filters and SLA badges
feat: complete phase 4A - technician role, 5-state ticket lifecycle and QA fixes
feat: finalize phase 4B-core QA and hotfixes
```

**Reglas de escritura:**
- La descripción va en minúsculas, en inglés.
- Sin punto final.
- Máximo 72 caracteres en la línea de asunto.
- Un commit debe representar una unidad cohesiva de trabajo. Si abarca demasiados cambios independientes, dividirlo en commits separados.

---

## 2. Gestión de Ramas

El proyecto usa un modelo simplificado de ramas, acorde con la escala del MVP y el equipo de desarrollo.

### Rama principal

La rama de trabajo activa es la rama personal del desarrollador principal. Todo el desarrollo de cada fase se realiza sobre esta rama y se integra mediante un commit de cierre al finalizar la fase.

### Ramas de exploración

Para experimentos visuales o funcionales que pueden no incorporarse al producto, se usan ramas con el prefijo `feature/` o nombres descriptivos del experimento.

> **Nota histórica:** la rama activa del proyecto tiene el nombre `freature/agusgaja` (typo de `feature`). Este typo existe tanto en la rama local como en el remoto. Corregirlo requeriría renombrar la rama local y actualizar el remoto. Queda registrado como deuda técnica menor.

---

## 3. Ciclo Oficial de Cierre de Fase

Al completar una fase de desarrollo, el procedimiento de cierre es el siguiente:

1. **QA de la fase:** ejecutar el ciclo de prueba funcional completo sobre todas las funcionalidades de la fase. Verificar que no existan regresiones en funcionalidades anteriores.
2. **Hotfixes post-QA:** si se detectan errores durante la revisión, corregirlos en la misma rama antes de cerrar. El commit de hotfix puede ir separado del commit de cierre.
3. **Commit de cierre:** generar un commit con formato `feat: complete phase <nombre> - <descripción resumida>` que consolide todo el trabajo de la fase.
4. **Push al remoto:** subir el commit de cierre al remoto.
5. **Actualizar el estado del proyecto:** marcar la fase como cerrada en `PROJECT_CONTEXT.md §12` y registrarla en `development/roadmap.md`.
6. **Actualizar la documentación técnica:** si la fase incorporó cambios que afectan documentos existentes en `docs/`, actualizarlos antes de iniciar la siguiente fase.

---

## 4. Archivos Ignorados por Git

El archivo `.gitignore` excluye del control de versiones:

- `node_modules/` — dependencias instaladas por el gestor de paquetes.
- `dist/` — build de producción generado. No se versiona; se genera localmente con `npm run build` (ver `development/getting_started.md §3`).
- Archivos de variables de entorno (`.env`, `.env.local`).
- Archivos de log de gestores de paquetes (`npm-debug.log*`, `yarn-debug.log*`, `pnpm-debug.log*`).

La documentación técnica (`docs/`) **sí se versiona** junto con el código fuente.
