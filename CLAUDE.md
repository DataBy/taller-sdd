<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

# Inventario Souvenirs — Contexto del proyecto para Claude

## Qué es este proyecto

App web de inventario de souvenirs con chatbot conectado a OpenRouter. Permite administrar productos, variantes, proveedores, stock, historial de movimientos, importaciones, exportaciones y consultas/acciones mediante IA.

**Metodología:** SDD — Spec-Driven Development. No se escribe código sin especificación aceptada.  
**Estado actual:** Planificación y especificación. Fase SPEC-00 / SPEC-01.

---

## Constitución

La constitución completa está en `.specify/memory/constitution.md`. Resumen de principios irrenunciables:

- **Especificación primero.** Nada se implementa sin spec aceptada.
- **Sin login en v1.0.** No hay autenticación en el MVP.
- **API key de OpenRouter solo en backend.** Nunca en frontend.
- **Chatbot con confirmación obligatoria.** Consultas: respuesta directa. Acciones (crear, editar, stock, desactivar): resumen + confirmación explícita.
- **Stock nunca negativo.** Validación en frontend y backend.
- **Historial de todo cambio.** Sin modificaciones silenciosas.
- **Eliminación lógica.** Estado `descontinuado`, nunca borrado físico.
- **Importación con previsualización y confirmación.** Nunca aplicación automática.
- **Simplicidad.** Sin abstracciones innecesarias. YAGNI.
- **Diseño como requisito.** Soft UI + glassmorphism, paleta morado-lavanda-rosado, contraste suficiente.

---

## Alcance del MVP

| Módulo | Incluye |
|---|---|
| Dashboard | Métricas, alertas de stock bajo, últimos movimientos. |
| Inventario | CRUD de productos: crear, ver, buscar, filtrar, editar, desactivar. |
| Variantes | Atributos flexibles, stock, stock mínimo, ubicación por variante. |
| Proveedores | Registrar y asociar a productos. |
| Historial | Movimientos: entrada, salida, ajuste, importación, acciones chatbot. |
| Importar | CSV y Excel con previsualización, validación y confirmación. |
| Exportar | CSV, Excel y PDF. |
| Chatbot | Consultas y acciones confirmadas vía OpenRouter (backend proxy). |
| Configuración | Moneda, categorías, modelo IA, preferencias visuales. |

**Fuera de alcance:** login, imágenes de producto, POS completo, multi-sucursal avanzado, roles y permisos.

---

## Stack técnico recomendado

| Capa | Tecnología |
|---|---|
| Frontend | Next.js o React |
| Estilos | Tailwind CSS |
| Backend | API routes / Node.js |
| BD local (MVP) | SQLite |
| BD web | Supabase / PostgreSQL |
| IA | OpenRouter (solo backend) |

**Decisión pendiente:** Confirmar si la app será local, intranet o pública antes de elegir base de datos.

---

## Diseño visual

| Elemento | Especificación |
|---|---|
| Estilo | Soft UI / neumorphism ligero + glassmorphism suave |
| Fondo | Lavanda muy claro `#F5F3FF` o degradado pastel |
| Tarjetas | Blancas o translúcidas, bordes redondeados, sombra suave |
| Acento principal | Morado `#7C3AED` |
| Acento secundario | Rosado pastel `#F9A8D4` |
| Texto | Slate oscuro `#334155` |
| Animaciones | Transiciones suaves, sin afectar rendimiento |

---

## Entidades principales

`Product` · `Variant` · `Category` · `Supplier` · `InventoryMovement` · `ImportBatch` · `ChatAction` · `AppSettings`

Relaciones clave:
- Producto 1:N Variantes
- Proveedor 1:N Productos
- Producto/Variante 1:N Movimientos
- ImportBatch 1:N Productos/Variantes
- ChatAction 1:N Movimientos

---

## Fases SDD

| Spec | Objetivo |
|---|---|
| SPEC-00 | Visión y alcance (Project Chart — en curso) |
| SPEC-01 | Requisitos funcionales y criterios de aceptación |
| SPEC-02 | UX/UI — pantallas, navegación, wireframes |
| SPEC-03 | Modelo de datos conceptual validado |
| SPEC-04 | Contratos de API y acciones |
| SPEC-05 | Chatbot IA — intenciones, flujos, confirmaciones |
| SPEC-06 | Import/export — plantillas, validaciones, errores |
| SPEC-07 | QA y pruebas — checklist funcional |
| SPEC-08 | Implementación por módulos |
| SPEC-09 | Entrega y documentación final |

---

## Reglas de trabajo con Claude

- Leer siempre `.specify/memory/constitution.md` antes de proponer implementaciones.
- Leer el plan activo en `specs/` antes de generar tareas o código.
- No implementar funcionalidad fuera del alcance definido sin confirmación explícita.
- Marcar decisiones abiertas como `[PENDIENTE]` en lugar de asumir.
- Toda acción del chatbot en specs o código debe respetar la política de confirmación.
- Usar los skills `/speckit-*` para el flujo SDD: constitution → specify → clarify → plan → tasks → implement.
