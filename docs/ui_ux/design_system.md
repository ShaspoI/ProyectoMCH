---
title: "Sistema de Diseño"
category: ui_ux
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/project_structure.md
  - features/ticketing_workflow.md
  - reference/data_schema.md
---

# Sistema de Diseño

Este documento es el propietario exclusivo de los tokens visuales, las clases de superficie, las clases de animación y las convenciones de diseño del sistema. No documenta contratos de componentes ni sus props (ver `ui_ux/reusable_components.md`), ni la estructura de las entidades de datos (ver `reference/data_schema.md`).

---

## 1. Estética General

El sistema utiliza una estética de **glassmorphism oscuro**: fondos con gradientes vibrantes, superficies con efecto de cristal esmerilado (blur + transparencia), bordes translúcidos y sombras suaves. La paleta varía entre modo claro (blanco lechoso) y modo oscuro (azul profundo a violeta oscuro).

El sistema no utiliza librerías de componentes UI externas. Todos los estilos son propios, definidos mediante clases de utilidad de TailwindCSS y clases de superficie personalizadas.

---

## 2. Tipografía

**Fuente única:** `Inter`.

Inter se utiliza en toda la interfaz sin excepciones. Los pesos y tamaños se aplican mediante las utilidades de TailwindCSS (`font-semibold`, `text-sm`, `text-2xl`, etc.).

---

## 3. Modo Oscuro

El modo oscuro se activa mediante la clase `.dark` en el elemento raíz del documento. No depende de la preferencia del sistema operativo una vez que el usuario ha establecido su preferencia.

La preferencia del usuario se persiste entre sesiones. El comportamiento de persistencia e inicialización está documentado en `architecture/state_management.md §3.1`.

---

## 4. Paleta de Colores

El sistema no define una paleta de tokens con nombre propio. Utiliza la escala de colores de TailwindCSS con los siguientes roles semánticos establecidos por convención:

| Color | Escala Tailwind | Rol en el sistema |
|---|---|---|
| Violeta | `violet` | Color de acento principal. Botones de acción primaria, bordes de foco, indicadores activos. |
| Slate | `slate` | Escala de grises para texto, fondos neutros y bordes. |
| Rose | `rose` | Alertas críticas, indicadores de SLA vencido, badges de no leído en notificaciones. |
| Blue | `blue` | Estado `pendiente` de tickets. |
| Indigo | `indigo` | Estado `asignado` de tickets. |
| Amber | `amber` | Estado `en-proceso` de tickets. |
| Teal | `teal` | Estado `resuelto-pendiente` de tickets. |
| Emerald | `emerald` | Estado `cerrado` de tickets. |

**Focus ring global:** todos los elementos interactivos (botones, inputs, selects, textareas) tienen un anillo de foco violeta semitransparente aplicado globalmente.

---

## 5. Colores de Estado de Tickets

Los estados de tickets tienen un color semántico asignado que se usa de forma consistente en toda la interfaz: badges, columnas Kanban, filtros y gráficos.

| Estado | Identificador de tono | Pulso visual |
|---|---|---|
| Pendiente | `blue` | Sí |
| Asignado | `indigo` | No |
| En proceso | `amber` | No |
| Resuelto — pend. conformidad | `teal` | Sí |
| Cerrado | `green` (renderizado como emerald) | No |

> **Nota:** El identificador de tono `"green"` se resuelve visualmente con la escala `emerald` de TailwindCSS. Esta discrepancia entre el nombre del tono y el color efectivo es una deuda de nomenclatura pendiente de normalización.

Los estados que tienen **pulso visual** (`pendiente` y `resuelto-pendiente`) emplean la animación `.animate-pulse-glow` para indicar que requieren acción. El significado funcional de cada estado está en `features/ticketing_workflow.md §1`.

---

## 6. Clases de Superficie

Las superficies glassmorphism se definen como clases CSS reutilizables. Cada clase incluye sus variantes de modo oscuro.

### `.ambient-bg`

Fondo principal de páginas completas (login, registro, portales de usuario). Implementa un gradiente fijo en el viewport.

- **Modo claro:** degradado de celeste a violeta pastel a rosa.
- **Modo oscuro:** degradado de azul marino oscuro a violeta profundo.

### `.glass-card`

Superficie de contenido con efecto de vidrio esmerilado. Usada en tarjetas de ticket, formularios, paneles de datos y tarjetas de métricas.

- Incluye efecto de desenfoque con saturación aumentada.
- En hover: escala ligeramente (1.01) y aumenta la opacidad del fondo.
- En active: escala hacia abajo (0.98).
- En modo oscuro hover: borde violeta y sombra violeta sutil.

### `.glass-panel`

Superficie de paneles laterales deslizables (panel de detalles de ticket, panel analítico de métricas). Mayor opacidad de fondo que `.glass-card` para garantizar legibilidad en contextos superpuestos.

- **Modo claro:** fondo blanco con 85% de opacidad.
- **Modo oscuro:** fondo azul pizarra muy oscuro con 85% de opacidad.
- Borde izquierdo translúcido (característica visual del borde de entrada lateral).

### `.dashboard-shell`

Layout base de los portales de usuario. Aplica el fondo `.ambient-bg` y el color de texto predeterminado. Se utiliza como envoltura del área principal de cada portal.

---

## 7. Clases de Animación

Todas las animaciones están definidas como clases CSS de utilidad aplicables directamente en los elementos.

| Clase | Efecto | Uso típico |
|---|---|---|
| `.animate-fade-in` | Aparición con desplazamiento vertical suave | Entrada de páginas y formularios |
| `.animate-slide-in-right` | Deslizamiento desde la derecha | Apertura de paneles laterales |
| `.animate-fade-overlay` | Aparición de superposición | Fondos oscuros de modales y paneles |
| `.animate-fade-out-overlay` | Desaparición de superposición | Cierre de fondos oscuros |
| `.animate-slide-out-right` | Deslizamiento hacia la derecha | Cierre de paneles laterales |
| `.animate-pulse-glow` | Brillo pulsante azul continuo | Badges de estados que requieren acción |
| `.animate-count-pop` | Rebote elástico | Actualización de contadores numéricos |
| `.animate-spin-once` | Rotación completa única | Toggle de tema al cambiar de modo |

Todas las animaciones utilizan curvas de easing con características elásticas o suaves, sin movimientos abruptos.

---

## 8. Scrollbar

El sistema define un estilo de scrollbar personalizado para Webkit (Chrome, Safari) y Firefox.

- **Ancho:** 8px (vertical y horizontal).
- **Track:** transparente.
- **Thumb en modo claro:** gris slate semitransparente.
- **Thumb en modo oscuro:** blanco semitransparente.
- Los thumbs tienen bordes redondeados y se oscurecen ligeramente en hover.
