# PLAN-08 — Implementación

**Spec:** SPEC-08  
**Estado:** Pendiente (inicia solo cuando SPEC-01 a SPEC-07 estén aprobadas)  
**Dependencias:** Todos los planes anteriores aprobados  
**Bloquea:** PLAN-09

---

## Objetivo del plan

Definir el orden de implementación por módulos, las dependencias entre fases y los checkpoints de validación. Sin código; el resultado es una hoja de ruta técnica que garantiza que cada módulo se construye sobre bases sólidas y verificadas.

---

## Prerequisitos de entrada

Antes de escribir la primera línea de código, confirmar:

| Item | Estado requerido |
|---|---|
| SPEC-00 a SPEC-07 | Todas aprobadas |
| Decisión de base de datos | Confirmada en PLAN-00 |
| Decisión de uso (local/web) | Confirmada en PLAN-00 |
| Modelo de OpenRouter | Confirmado en PLAN-05 |
| Moneda principal | Confirmada en PLAN-00 |
| Stack técnico | Confirmado (Next.js/React + Tailwind + Node.js) |
| Variables de entorno documentadas | `.env.example` listo |

---

## Fases de implementación

### Fase A — Infraestructura base
**Duración estimada:** 1 sesión  
**Dependencias:** Ninguna (primera fase)

| Tarea | Descripción |
|---|---|
| A1 | Inicializar proyecto con Next.js (o React + Vite) y Tailwind CSS. |
| A2 | Configurar estructura de carpetas: `/frontend`, `/backend`, `/shared`. |
| A3 | Configurar variables de entorno: `.env.example` con todas las keys necesarias. |
| A4 | Configurar base de datos y ORM según decisión de PLAN-00. |
| A5 | Crear tokens de diseño en Tailwind: paleta morado-lavanda-rosado, tipografía, radios. |
| A6 | Crear componentes base: Button, Input, Badge, Card, Modal, Toast, Table. |

**Checkpoint A:** El proyecto corre localmente, la base de datos conecta, los componentes base se renderizan correctamente.

---

### Fase B — Esquema de datos y API core
**Duración estimada:** 1–2 sesiones  
**Dependencias:** Checkpoint A superado

| Tarea | Descripción |
|---|---|
| B1 | Crear migraciones o esquema inicial: Category, Supplier, Product, Variant, AppSettings. |
| B2 | Crear migración de InventoryMovement, ImportBatch, ChatAction. |
| B3 | Seed de datos iniciales: categorías base + configuración por defecto. |
| B4 | Implementar CRUD de Categorías con validaciones. |
| B5 | Implementar CRUD de Proveedores con validaciones. |
| B6 | Implementar CRUD de Productos con validaciones de SPEC-01 y SPEC-03. |
| B7 | Implementar CRUD de Variantes con validación de unicidad y stock ≥ 0. |
| B8 | Implementar endpoint de Movimientos (GET + POST). |
| B9 | Implementar `/dashboard/summary`. |

**Checkpoint B:** Todos los endpoints de Productos, Variantes, Categorías y Proveedores responden correctamente. Las validaciones rechazan datos inválidos. El historial se genera en cada mutación.

---

### Fase C — Dashboard e Inventario (frontend)
**Duración estimada:** 1–2 sesiones  
**Dependencias:** Checkpoint B superado

| Tarea | Descripción |
|---|---|
| C1 | Layout global: sidebar, header, área principal. |
| C2 | Dashboard: tarjetas de métricas, alertas de stock bajo, últimos movimientos. |
| C3 | Tabla de inventario: listado, búsqueda, filtros y ordenamiento. |
| C4 | Detalle de producto: datos generales, variantes, proveedor, historial. |
| C5 | Formulario de creación de producto con variantes. |
| C6 | Formulario de edición de producto. |
| C7 | Flujo de desactivación con confirmación. |
| C8 | Pantalla de proveedores: listado y formulario. |
| C9 | Pantalla de configuración. |
| C10 | Estados vacíos en todas las vistas. |

**Checkpoint C:** Flujo completo de creación, edición, desactivación y visualización de productos funciona en el navegador. Las alertas de stock bajo aparecen correctamente.

---

### Fase D — Importación y Exportación
**Duración estimada:** 1 sesión  
**Dependencias:** Checkpoint B superado (puede correr en paralelo con C)

| Tarea | Descripción |
|---|---|
| D1 | Backend: endpoint `/import/preview` con validaciones de SPEC-06. |
| D2 | Backend: endpoint `/import/confirm/:batchId`. |
| D3 | Frontend: pantalla de importación con drag & drop, previsualización y confirmación. |
| D4 | Backend: endpoints de exportación CSV y Excel con filtros. |
| D5 | Backend: endpoint de exportación PDF con encabezado y tabla. |
| D6 | Frontend: pantalla de exportación con selector de formato y filtros visibles. |
| D7 | Plantillas descargables de CSV/Excel disponibles en la pantalla de importación. |

**Checkpoint D:** Importar un CSV válido crea productos en la base de datos. Exportar con filtro devuelve solo los registros correctos en los tres formatos.

---

### Fase E — Chatbot
**Duración estimada:** 1–2 sesiones  
**Dependencias:** Checkpoint B superado, SPEC-05 aprobada con system prompt definido

| Tarea | Descripción |
|---|---|
| E1 | Backend: configurar cliente de OpenRouter con API key desde variables de entorno. |
| E2 | Backend: endpoint `/chat/message` con detección de intención. |
| E3 | Backend: lógica de consulta de datos según intención (query_stock, query_low_stock, etc.). |
| E4 | Backend: lógica de propuesta de acción (create, update, adjust_stock, deactivate). |
| E5 | Backend: endpoints `/chat/confirm` y `/chat/reject` con validaciones de negocio. |
| E6 | Backend: registro de ChatAction e InventoryMovement vinculados. |
| E7 | Backend: manejo de error cuando OpenRouter no responde. |
| E8 | Frontend: panel lateral de chatbot con burbujas de conversación. |
| E9 | Frontend: tarjetas de confirmación con antes/después y botones Confirmar/Rechazar. |
| E10 | Frontend: indicador de carga y estado deshabilitado durante procesamiento. |

**Checkpoint E:** El chatbot responde consultas de stock correctamente. Las acciones no se ejecutan sin confirmación. Si OpenRouter falla, el inventario sigue operable.

---

### Fase F — Ajustes finales
**Duración estimada:** 1 sesión  
**Dependencias:** Checkpoints C, D y E superados

| Tarea | Descripción |
|---|---|
| F1 | Revisar y completar manejo de errores globales (frontend + backend). |
| F2 | Verificar que todos los estados vacíos tienen mensaje amigable. |
| F3 | Revisar accesibilidad: contraste, tabulación, labels en formularios. |
| F4 | Completar README con instrucciones de instalación, variables de entorno e importación. |
| F5 | Ejecutar checklist de regresión final de SPEC-09. |

**Checkpoint F:** La app pasa el checklist de regresión completo de SPEC-07 y SPEC-09.

---

## Reglas durante la implementación

- No implementar funcionalidad no especificada en SPEC-01 a SPEC-06 sin aprobación.
- Si se encuentra un caso no cubierto en las specs, detener y documentar antes de decidir.
- Cada mutación de stock o estado debe generar InventoryMovement sin excepción.
- La API key de OpenRouter se verifica en entorno antes de ejecutar cualquier llamada al chatbot.
- Las validaciones del backend se implementan independientemente de las del frontend.

---

## Dependencias entre fases

```
A (infraestructura)
  └─► B (datos y API)
        ├─► C (frontend inventario)
        ├─► D (import/export)  ← puede correr en paralelo con C
        └─► E (chatbot)        ← puede iniciar cuando B esté listo
              └─► F (ajustes finales)
```

---

## Criterio de salida

- Todos los checkpoints A–F superados.
- Checklist de regresión de SPEC-09 completado.
- SPEC-08 marcada como **Aprobado**.
