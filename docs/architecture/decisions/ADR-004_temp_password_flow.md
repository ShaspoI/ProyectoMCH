---
title: "ADR 004: Flujo de Contraseña Temporal"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - architecture/routing_and_roles.md
  - features/authentication.md
---

# ADR 004: Flujo de Contraseña Temporal en HOC Separado

## Estado
Aceptado

## Contexto
El sistema MCH requiere proteger las rutas de la aplicación basándose en dos factores de autorización principales:
1. La existencia de una sesión de usuario válida.
2. El rol del usuario (`admin`, `tecnico`, `usuario`) para asegurar que solo acceda a los portales correspondientes.

Adicionalmente, el sistema introduce una regla de negocio obligatoria y transitoria: los usuarios cuyas cuentas fueron reseteadas o recién creadas por un administrador poseen un atributo `tempPassword: true`. Estos usuarios tienen estrictamente prohibido acceder a cualquier funcionalidad de la aplicación hasta que no establezcan una nueva contraseña segura a través de la ruta obligatoria `/change-password`.

Si implementáramos esta regla dentro del componente `ProtectedRoute`, dicho componente pasaría a tener múltiples motivos para cambiar: no solo se encargaría de la identidad y autorización genérica del árbol de rutas, sino también de orquestar flujos forzosos y específicos de la capa de negocio. Esto violaría el principio de Responsabilidad Única (SRP) y complicaría el mantenimiento del componente responsable de la seguridad de la interfaz.

## Decisión
Se decidió extraer la restricción de cambio de contraseña forzoso a un High-Order Component (HOC) independiente denominado `RequirePasswordChange`, manteniéndolo completamente separado de `ProtectedRoute`.

1. **`ProtectedRoute`**: Se limita de forma estricta a validar la existencia de sesión (`!user -> redirect a /login`) y la correspondencia del rol (`user.role !== role -> redirect al portal por defecto correspondiente a su rol`).
2. **`RequirePasswordChange`**: Se ubica en el nivel superior del árbol de rutas en `App.jsx`, envolviendo todas las rutas del sistema. Inspecciona la bandera `tempPassword` y captura de forma global cualquier intento de navegación para forzar al usuario hacia la ruta `/change-password`, o bien sacarlo de dicha ruta hacia la página de inicio si su contraseña ya no es temporal.

## Consecuencias

### Positivas
- **Separación de Responsabilidades (SRP):** La lógica de autenticación y autorización base (`ProtectedRoute`) no se contamina con procesos transitorios o bloqueantes propios de reglas de negocio específicas.
- **Mantenibilidad:** Es más seguro analizar, modificar o reemplazar el flujo de contraseña temporal sin riesgo colateral de introducir vulnerabilidades o bugs en la protección estándar de las rutas críticas de la aplicación.
- **Claridad del Árbol de Renderizado:** El archivo `App.jsx` declara explícitamente mediante composición que existe un flujo mandatorio que envuelve de manera absoluta la navegación de toda la aplicación (`<RequirePasswordChange><Routes>...`).

### Negativas / Riesgos Aceptados
- **Anidamiento de componentes:** Al utilizar múltiples HOCs en secuencia para controlar la navegación, se incrementa ligeramente la profundidad del DOM virtual de React.
- **Trazabilidad de redirecciones:** Se añade una capa adicional donde pueden ocurrir redirecciones inesperadas en caliente (`<Navigate>`), exigiendo que los desarrolladores tengan que inspeccionar ambos componentes (o usar herramientas de depuración de React Router) para entender completamente la causa de un ciclo de redirección anómalo.
