---
title: "Autenticación y Sesión"
category: features
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/state_management.md
  - architecture/routing_and_roles.md
  - reference/data_schema.md
---

# Autenticación y Sesión

Este documento es el propietario exclusivo del comportamiento funcional de los flujos de autenticación y sesión: login, registro, gestión de contraseña y estado de sesión. No documenta los contratos de los contextos de autenticación o usuarios (ver `architecture/state_management.md`), ni las rutas de protección de navegación (ver `architecture/routing_and_roles.md`), ni la estructura de la entidad `User` (ver `reference/data_schema.md`).

---

## 1. Sesión

La sesión identifica al usuario autenticado durante su visita al sistema. Persiste entre recargas de página y se mantiene activa hasta que el usuario cierra sesión explícitamente.

**Reglas de sesión:**
- La contraseña nunca forma parte de los datos de sesión.
- Si los datos del usuario cambian mientras la sesión está activa (por ejemplo, por una edición de perfil), la sesión se actualiza automáticamente para reflejar esos cambios.
- El cierre de sesión elimina completamente la información de sesión persistida.

---

## 2. Login

El login permite a un usuario autenticarse en el sistema con sus credenciales.

**Identificador aceptado:** legajo o dirección de email.

**Validaciones:**
1. Las credenciales (identificador + contraseña) deben coincidir con un registro existente en el sistema.
2. La cuenta debe estar en estado `Activo`. Las cuentas inactivas son rechazadas con un mensaje que indica que el usuario debe contactar al administrador.

**Comportamiento en caso de éxito:**
- La sesión queda establecida.
- El usuario es redirigido automáticamente al portal correspondiente a su rol:
  - Administrador → panel de administración.
  - Técnico → panel de técnico.
  - Usuario → panel de usuario.

---

## 3. Registro

El registro permite a un nuevo usuario crear su cuenta en el sistema de forma autónoma.

**Datos requeridos:** nombre, apellido, legajo, email, teléfono, sector de pertenencia y contraseña.

**Reglas:**
- El rol asignado al usuario registrado siempre es `"usuario"`. No es posible crear cuentas con otro rol desde el registro público.
- Solo pueden seleccionarse sectores activos en el sistema.
- Legajo, email y teléfono deben ser únicos en el sistema.
- La contraseña debe tener al menos 8 caracteres.
- Una vez completado el registro, el sistema ejecuta un login automático y redirige al usuario a su panel.

---

## 4. Recuperación de Contraseña

> **Limitación conocida (fase 4B-Core):** El flujo de recuperación de contraseña por email es una pantalla simulada. El usuario ingresa su dirección de email y recibe una confirmación visual, pero no se envía ningún email ni se genera ninguna credencial temporal. La recuperación real de contraseña está pendiente de implementación de backend.

Para recuperar el acceso en el entorno actual, el administrador del sistema puede resetear la contraseña de un usuario mediante el panel de administración (ver §5).

---

## 5. Contraseña Temporal y Cambio Obligatorio

El administrador puede resetear la contraseña de cualquier usuario. Al hacerlo:
1. El sistema genera una contraseña temporal aleatoria.
2. Esa contraseña es entregada al administrador para que la comunique al usuario afectado.
3. El acceso del usuario continúa siendo posible, pero el sistema registra que tiene un cambio de contraseña pendiente.

**Flujo de cambio obligatorio:**
Cuando un usuario con cambio de contraseña pendiente inicia sesión:
- El sistema bloquea el acceso a todas las secciones de la aplicación.
- El usuario es redirigido obligatoriamente a la pantalla de cambio de contraseña.
- Solo después de confirmar una nueva contraseña válida, el bloqueo se levanta y el usuario accede normalmente a su portal.

**Reglas de la nueva contraseña:**
- Debe tener al menos 8 caracteres.
- Debe confirmarse ingresándola dos veces.
- Una vez confirmada, la nueva contraseña reemplaza a la temporal y el estado de cambio obligatorio queda eliminado.

---

## 6. Invariante de Administrador Activo

El sistema garantiza en todo momento la existencia de al menos un administrador activo. Esta restricción impide:
- Desactivar al único administrador activo del sistema.
- Cambiar el rol del único administrador activo a cualquier otro rol.

Esta restricción es funcional y se aplica en las operaciones de gestión de usuarios del panel de administración.
