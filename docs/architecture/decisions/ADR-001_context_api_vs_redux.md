---
title: "ADR 001: Context API vs Redux"
category: architecture
phase: "4B-Core"
updated_in: "4B-Core"
status: stable
related_docs:
  - architecture/state_management.md
---

# ADR 001: Context API vs Redux para Gestión de Estado Global

## Estado
Aceptado

## Contexto
El sistema MCH es un Producto Mínimo Viable (MVP) que requiere una gestión de estado global para manejar usuarios, sesión de autenticación, tickets, notificaciones y configuraciones maestras. Inicialmente se consideró el uso de Redux debido a su popularidad y robustez para manejar estados complejos. Sin embargo, evaluar las necesidades reales del proyecto mostró que:
1. El volumen de datos almacenados en memoria y sincronizados con el almacenamiento local es bajo.
2. Las interacciones de estado no requieren un motor de mutaciones complejo o middleware especializado.
3. Incorporar Redux sumaría dependencias externas y verbosidad ("boilerplate") innecesaria para esta fase del proyecto.

## Decisión
Se decidió utilizar **React Context API** nativo junto con hooks personalizados para toda la gestión del estado global del sistema, descartando la inclusión de Redux.

El estado se dividió en 7 contextos especializados con responsabilidades únicas que exponen una API pública y encapsulan la lógica de persistencia, evitando un store monolítico global.

## Consecuencias

### Positivas
- **Cero dependencias externas:** La solución se apoya íntegramente en las capacidades nativas de React 19.
- **Reducción de verbosidad:** La curva de adopción y el volumen de código necesario para declarar y consumir el estado es significativamente menor en comparación con Redux.
- **Alta modularidad:** Permite aislar piezas del dominio y sus reglas de negocio de forma independiente.

### Negativas / Riesgos Aceptados
- **Re-renders en cascada:** La naturaleza de Context API puede disparar re-renderizados en componentes que consumen un contexto, aunque solo requieran una porción del mismo. Esto se mitigó al granular funcionalmente los dominios de datos.
- **Gestión de dependencias jerárquicas:** Si un contexto necesita consumir datos de otro, debe ser su descendiente directo. Esto genera un árbol de componentes proveedores ("Providers") profundo y obliga a implementar patrones puente (Bridge) para evitar dependencias circulares entre dominios funcionalmente separados.
