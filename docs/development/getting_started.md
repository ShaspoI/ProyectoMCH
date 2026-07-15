---
title: "Guía de Setup de Entorno"
category: development
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/project_structure.md
---

# Guía de Setup de Entorno

Este documento es el propietario exclusivo de las instrucciones para instalar, ejecutar y verificar el entorno de desarrollo del proyecto. No describe la arquitectura del sistema (ver `architecture/overview.md`), ni el mapa de archivos (ver `architecture/project_structure.md`), ni la gestión de datos de desarrollo (ver `development/mock_data_and_storage.md`).

> Este documento es la referencia vigente para el setup del entorno. El `README.md` raíz del repositorio contiene instrucciones anteriores a la fase `4B-Core` y no debe usarse como guía de instalación.

---

## 1. Requisitos Previos

| Herramienta | Versión mínima recomendada |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior (incluido con Node.js) |

No se requieren herramientas adicionales. No hay backend, base de datos ni variables de entorno que configurar.

---

## 2. Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>

# 2. Ingresar al directorio del proyecto
cd ProyectoMCH

# 3. Instalar dependencias
npm install
```

---

## 3. Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| Desarrollo | `npm run dev` | Inicia el servidor de desarrollo. El servidor queda disponible tanto en localhost como en la red local. |
| Build | `npm run build` | Genera el bundle de producción en `dist/`. Solo usar para validar la build; no es parte del flujo de desarrollo habitual. |
| Preview | `npm run preview` | Sirve localmente el contenido de `dist/`. Requiere haber ejecutado `npm run build` previamente. |

El servidor de desarrollo se inicia en el puerto `5173` por defecto. La URL exacta se muestra en la terminal al ejecutar `npm run dev`.

---

## 4. Primer Arranque

Al acceder a la aplicación por primera vez en un navegador limpio, el sistema detecta que no hay datos en el almacenamiento local del navegador y los carga automáticamente desde los archivos de datos iniciales incluidos en el repositorio. No es necesaria ninguna acción manual.

El mecanismo de inicialización y la estrategia de versionado de datos están documentados en `development/mock_data_and_storage.md`.

---

## 5. Credenciales de Desarrollo

El sistema incluye usuarios precargados para probar cada rol. Las contraseñas están en texto plano únicamente a fines de demostración en el entorno mock.

| Identificador | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Admin |
| `EMP-4100` | `admin123` | Admin (secundario) |
| `TEC-001` | `tecnico123` | Técnico |
| `EMP-4021` | `usuario123` | Usuario |

El identificador puede ser el legajo o el email del usuario. Todos los emails del entorno de desarrollo tienen el formato `<inicial>.<apellido>@industria.com`.

> **Advertencia:** Las contraseñas en texto plano son exclusivas del entorno de desarrollo mock. En un entorno con backend real, todas las contraseñas deben ser hasheadas antes de almacenarse. Nunca almacenar contraseñas en texto plano en una base de datos real.

---

## 6. Limpiar el Entorno

Para resetear completamente el estado del sistema (datos, sesión y configuración) a los valores iniciales:

1. Abrir las herramientas de desarrollo del navegador.
2. Ir a **Application → Local Storage** (Chrome / Edge) o **Storage → Local Storage** (Firefox).
3. Eliminar todas las claves con el prefijo `maintenance-`.
4. Recargar la página.

Al recargar, el sistema vuelve a inicializar los datos desde los archivos de datos iniciales.

---

## 7. Estructura de Directorios Relevante para el Setup

```
ProyectoMCH/
├── package.json       ← Scripts y dependencias
├── vite.config.js     ← Configuración del servidor de desarrollo
├── index.html         ← Shell HTML (punto de entrada)
├── src/               ← Código fuente
│   └── data/          ← Archivos de datos iniciales (seeders)
├── docs/              ← Documentación técnica
└── dist/              ← Build de producción (generado, no versionado)
```

La descripción completa de cada directorio y archivo está en `architecture/project_structure.md`.
