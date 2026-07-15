---
title: "ADR 002: LocalStorage como Base de Datos"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - development/mock_data_and_storage.md
  - reference/data_schema.md
---

# ADR 002: LocalStorage como Base de Datos Simulada

## Estado
Aceptado

## Contexto
El sistema MCH se concibió como un Producto Mínimo Viable (MVP) para demostrar y validar la funcionalidad de un gestor de tickets de mantenimiento. El requisito principal era contar con un prototipo 100% funcional en el frontend que no dependiera de la configuración, despliegue ni mantenimiento de un servidor backend, base de datos relacional o sistema de autenticación remoto. Sin embargo, para que el sistema fuera demostrable de punta a punta, debía existir persistencia de datos local para que los cambios y el estado sobrevivieran a recargas de página.

## Decisión
Se decidió utilizar la API nativa del navegador `localStorage` como capa de persistencia (base de datos simulada) para todo el sistema, y poblar la aplicación en su primer arranque mediante archivos estáticos locales ("seeders" en la carpeta `src/data/`).

## Consecuencias

### Positivas
- **Velocidad de desarrollo:** Permitió construir toda la interfaz y las reglas de negocio en paralelo sin bloquearse por la disponibilidad de APIs de backend.
- **Portabilidad absoluta:** El proyecto puede ejecutarse localmente o alojarse en cualquier servidor de archivos estáticos (ej. GitHub Pages, Vercel) sin necesidad de infraestructura dinámica.
- **Cero latencia:** Las operaciones de lectura/escritura son sincrónicas, lo que simplificó la gestión inicial del estado asíncrono en los componentes de UI.

### Negativas / Riesgos Aceptados
- **Límite de capacidad:** `localStorage` está limitado a ~5MB por origen, lo cual es suficiente para un MVP demostrativo pero inviable para un entorno de producción real.
- **Falta de integridad referencial:** Al no existir un motor de base de datos relacional, las "Foreign Keys" (como la relación `Subcategory.category`) se implementan débilmente apuntando a atributos de tipo `string` en lugar de identificadores internos únicos, delegando al código la responsabilidad de no romper las referencias (actualizaciones en cascada manuales).
- **Sincronización inter-pestaña:** Si el sistema escala a múltiples pestañas abiertas simultáneamente, se requiere rehidratar los Contextos manualmente escuchando eventos `storage` de `window` (como fue necesario implementar para el sistema de notificaciones).
- **Seguridad nula:** Los datos completos del sistema, incluyendo las contraseñas de prueba de los seeders y las sesiones simuladas, se almacenan en texto plano en el navegador cliente. Esta es una limitación inherentemente aceptada por la naturaleza del MVP.
