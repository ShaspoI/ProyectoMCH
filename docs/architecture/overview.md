---
title: "Arquitectura General del Sistema"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - PROJECT_CONTEXT.md
  - architecture/state_management.md
  - architecture/project_structure.md
  - architecture/routing_and_roles.md
  - development/mock_data_and_storage.md
---

# Arquitectura General del Sistema

Este documento describe cómo está construido el sistema a nivel global: sus capas, el flujo
de datos y el ciclo de vida del arranque. No documenta contratos de contextos, rutas
específicas ni schemas de datos. Esos temas pertenecen a documentos dedicados (ver Ownership
Rules en `README.md`).

---

## 1. Naturaleza del Sistema

El sistema MCH es una **SPA (Single Page Application)** que opera íntegramente en el
navegador. No existe un servidor de aplicaciones ni una API externa. Toda la lógica de
negocio reside en el frontend, y la persistencia de datos se implementa mediante
`localStorage`.

Esta decisión tiene consecuencias arquitectónicas concretas:

- El estado del sistema debe reconstituirse desde `localStorage` en cada carga de página.
- No hay separación física entre cliente y servidor: las reglas de negocio, la validación
  y la persistencia ocurren en el mismo proceso.
- La consistencia entre múltiples pestañas abiertas del navegador es responsabilidad del
  propio frontend.

La justificación de esta decisión está en
[`ADR-002`](architecture/decisions/ADR-002_localstorage_as_db.md).

---

## 2. Modelo de Capas

El sistema está organizado en cuatro capas. Cada capa tiene una responsabilidad única y
depende solo de las capas inferiores.

```
┌─────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN               │
│   pages/ + components/                          │
│   Renderiza la UI. Consume contextos.           │
│   No contiene lógica de negocio.                │
├─────────────────────────────────────────────────┤
│             CAPA DE ESTADO GLOBAL               │
│   context/ + App.jsx                            │
│   Contiene toda la lógica de negocio.           │
│   Coordina el árbol de providers.               │
│   Sincroniza el estado con la capa de           │
│   persistencia mediante useEffect.              │
├─────────────────────────────────────────────────┤
│            CAPA DE CONFIGURACIÓN                │
│   config/                                       │
│   Constantes estáticas que el sistema           │
│   lee pero no modifica en tiempo de ejecución.  │
├─────────────────────────────────────────────────┤
│             CAPA DE PERSISTENCIA                │
│   localStorage (navegador)                      │
│   Base de datos simulada para el MVP.           │
│   Cada contexto gestiona su propia clave.       │
└─────────────────────────────────────────────────┘
```

La **capa de presentación** no escribe directamente en `localStorage` ni contiene reglas de
negocio. Llama a funciones expuestas por los contextos y React se encarga de re-renderizar
cuando el estado cambia.

La **capa de estado global** es el núcleo del sistema. Los contextos de React actúan como
controladores: encapsulan estado, exponen operaciones y sincronizan la persistencia de forma
automática mediante `useEffect`.

La **capa de configuración** (`config/`) contiene valores estáticos que definen el
comportamiento del sistema pero que no cambian en tiempo de ejecución. Actúa como contrato
entre la capa de estado y la capa de presentación para conceptos compartidos entre múltiples
componentes.

La **capa de persistencia** es `localStorage`. No tiene lógica propia: es un almacén de
strings que cada contexto serializa y deserializa de forma independiente.

---

## 3. Ciclo de Vida del Arranque

Este es el flujo de inicialización que ocurre cada vez que el usuario carga la aplicación:

```
1. El navegador carga index.html
        │
        ▼
2. main.jsx ejecuta createRoot().render(<App />)
        │
        ▼
3. El árbol de providers se inicializa de afuera hacia adentro:
   ToastProvider → ThemeProvider → UserProvider → NotificationProvider
   → SettingsProvider → AuthProvider → TicketProvider
        │
        ▼
4. Cada contexto de datos ejecuta su función de carga durante la
   inicialización de useState() — de forma sincrónica, antes del
   primer render:
   - Si localStorage contiene datos: los deserializa y usa.
   - Si no (primera carga): usa los seeders de src/data/.
        │
        ▼
5. UserContext ejecuta lógica de migración que garantiza la coherencia
   de los datos de usuario y la existencia de al menos un administrador
   activo. El detalle de este proceso está en
   development/mock_data_and_storage.md.
        │
        ▼
6. AuthContext lee la sesión persistida en localStorage:
   - Si existe sesión válida: hidrata el usuario autenticado.
   - Si no: el usuario verá la pantalla de login.
        │
        ▼
7. React renderiza el árbol completo con el estado inicial.
        │
        ▼
8. La aplicación queda activa y lista para recibir interacciones.
```

---

## 4. Flujo de Datos

El sistema sigue un flujo de datos unidireccional y predecible en todas sus operaciones:

```
[Usuario] realiza una acción en la UI
        │
        ▼
[Componente] llama a una función expuesta por el contexto correspondiente
        │
        ▼
[Contexto] valida la operación, aplica la lógica de negocio
        y actualiza su estado interno con setState
        │
        ▼
[React] re-renderiza todos los componentes que consumen ese contexto
        │
        ▼
[useEffect] detecta el cambio de estado y escribe en localStorage
        │
        ▼
[localStorage] persiste el nuevo estado del sistema
```

Este flujo garantiza que `localStorage` siempre refleja el último estado aprobado por el
contexto, nunca un estado intermedio o inválido. La escritura en `localStorage` es una
consecuencia del cambio de estado, no su causa.

**Sincronización entre pestañas:** El evento nativo `window.storage` permite que otras
pestañas detecten cambios en `localStorage` escritos desde una pestaña diferente. Los
contextos que requieren esta sincronización registran un listener en este evento para
re-hidratar su estado local. El caso principal de uso es `NotificationContext`.

---

## 5. Taxonomía de Contextos

Los 7 contextos del sistema se dividen en dos categorías con responsabilidades distintas:

### Contextos de UI

Gestionan estado puramente de interfaz, sin lógica de negocio y sin dependencias entre ellos:

| Contexto | Responsabilidad |
|---|---|
| `ToastContext` | Mensajes efímeros de feedback. No persiste. |
| `ThemeContext` | Persiste la preferencia del usuario. |

### Contextos de Dominio

Contienen lógica de negocio, tienen dependencias entre ellos y persisten datos que
representan el estado del sistema:

| Contexto | Depende de |
|---|---|
| `UserContext` | — (independiente) |
| `NotificationContext` | — (independiente, recibe datos vía bridge) |
| `SettingsContext` | — (independiente) |
| `AuthContext` | `UserContext` |
| `TicketContext` | Recibe `onEvent` vía bridge |

La columna "Depende de" refleja qué contexto debe estar inicializado antes en el árbol de
providers. `AuthContext` consume directamente a `UserContext`. El resto de las dependencias
son indirectas (vía bridge o vía props).

Las claves de almacenamiento de cada contexto están en `PROJECT_CONTEXT.md §8`.

Los contratos completos de cada contexto (hooks exportados, funciones disponibles) están en
`architecture/state_management.md`.

---

## 6. Configuración Estática

El directorio `config/` contiene definiciones que el sistema trata como inmutables en tiempo
de ejecución. Son leídas por los contextos y componentes pero nunca modificadas durante el
ciclo de vida de la aplicación.

El ejemplo principal es `config/ticketStatuses.js`: define los estados posibles de un ticket
incluyendo sus propiedades visuales (etiquetas, colores, animaciones). La lista completa de
estados y sus reglas de transición está en `features/ticketing_workflow.md`.

**Por qué existe esta capa:** Centralizar estas definiciones evita que múltiples contextos y
componentes definan los mismos valores de forma independiente. Un cambio en la definición de
un estado requiere modificar únicamente este archivo. Los componentes consumen las
definiciones sin conocer su estructura interna.

---

## 7. Patrones Arquitectónicos Aplicados

El sistema implementa cuatro decisiones de diseño documentadas como ADRs. Este documento
los nombra y ubica; cada ADR contiene el análisis completo.

| Patrón | Qué resuelve | Documentado en |
|---|---|---|
| Context API sin Redux | Gestión de estado global sin dependencias externas innecesarias | [`ADR-001`](architecture/decisions/ADR-001_context_api_vs_redux.md) |
| LocalStorage como persistencia | Base de datos simulada para el MVP sin infraestructura de backend | [`ADR-002`](architecture/decisions/ADR-002_localstorage_as_db.md) |
| Bridge para notificaciones | Desacopla `TicketContext` de `NotificationContext` evitando dependencia circular | [`ADR-003`](architecture/decisions/ADR-003_notification_decoupling.md) |
| HOC para flujo de contraseña temporal | Separa la restricción de negocio de la protección de rutas | [`ADR-004`](architecture/decisions/ADR-004_temp_password_flow.md) |

El detalle técnico del patrón Bridge y la resolución de destinatarios de notificaciones está
en `architecture/state_management.md`.
