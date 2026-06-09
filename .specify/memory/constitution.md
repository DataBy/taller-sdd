# Inventario Souvenirs — Constitución del Proyecto

## I. Especificación primero (NON-NEGOTIABLE)

Este proyecto sigue SDD (Spec-Driven Development). Ninguna línea de código se escribe sin una especificación aceptada. El orden es siempre: SPEC → validación → plan → implementación. Las especificaciones son la fuente de verdad; el código es su expresión.

## II. Sin login en versión 1.0

La primera versión no incluye autenticación de usuarios, roles ni permisos. Si se necesita proteger acciones críticas, se puede agregar un PIN simple, pero no un sistema de login completo. Esto es una restricción de alcance deliberada del MVP.

## III. Seguridad de API key de OpenRouter

La clave de OpenRouter NUNCA debe estar en el frontend. Toda comunicación con OpenRouter pasa por el backend como proxy seguro usando variables de entorno. Esta regla no tiene excepciones.

## IV. Confirmación antes de acción del chatbot

El chatbot puede responder consultas directamente. Toda acción que modifique datos (crear, editar, actualizar stock, desactivar) REQUIERE mostrar un resumen y pedir confirmación explícita del usuario antes de ejecutar. El backend valida las acciones antes de persistirlas.

## V. Stock nunca negativo

El sistema no debe permitir guardar stock menor que 0. Esta validación existe tanto en frontend como en backend. Una variante con stock 0 queda agotada. Si todas las variantes de un producto están en 0, el producto queda agotado.

## VI. Historial de todo cambio relevante

Todo cambio de stock, edición de producto, desactivación, importación o acción del chatbot genera un registro en el historial (InventoryMovement). No hay modificaciones silenciosas. La trazabilidad es obligatoria.

## VII. Eliminación lógica únicamente

Los productos y variantes no se borran físicamente. Se cambia su estado a `descontinuado`. El historial se conserva siempre. Borrar registros de la base de datos está prohibido en operación normal.

## VIII. Importación con previsualización y confirmación

Ninguna importación de CSV o Excel se aplica automáticamente. Se debe mostrar previsualización, errores y advertencias. El usuario confirma antes de persistir. Cada importación genera un registro de `ImportBatch`.

## IX. Simplicidad y mantenibilidad

La arquitectura debe separar claramente: frontend, backend/API, base de datos e integración IA. No se introducen abstracciones innecesarias. El MVP prioriza funcionalidad sobre elegancia técnica. YAGNI: no se construye lo que no está en spec.

## X. Diseño visual como parte del contrato

El diseño Soft UI / neumorphism ligero + glassmorphism suave con paleta morado-lavanda-rosado es un requisito, no una preferencia. El contraste debe ser suficiente para legibilidad (texto slate oscuro). Las animaciones son suaves y no deben afectar rendimiento.

---

## Restricciones de alcance del MVP

| Fuera de alcance | Razón |
|---|---|
| Login y roles | Deliberadamente excluido del MVP. |
| Imágenes de producto | No contemplado en el alcance definido. |
| POS completo / ventas avanzadas | Solo salidas de stock; no caja registradora. |
| Multi-sucursal avanzado | Ubicación como campo simple; sucursales complejas son evolución posterior. |

---

## Stack técnico recomendado

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Next.js o React | Componentes reutilizables, integración con backend. |
| Estilos | Tailwind CSS | Paleta pastel, neumorphism y glassmorphism controlado. |
| Backend | API routes / Node.js | Proxy seguro para OpenRouter, validaciones y reglas. |
| Base de datos MVP local | SQLite | Para prototipo o uso interno. |
| Base de datos web | Supabase / PostgreSQL | Para despliegue web con persistencia compartida. |
| IA | OpenRouter (backend) | Modelo por definir. API key solo en servidor. |

**Decisión técnica pendiente:** Confirmar si el MVP será local, intranet o público. Esto define la elección de base de datos.

---

## Decisiones abiertas (cerrar antes de implementar)

| Decisión | Pregunta |
|---|---|
| Uso de la app | ¿Local, red interna o pública en internet? |
| Base de datos | ¿SQLite, Supabase o PostgreSQL? |
| Moneda | ¿USD, CRC u otra? |
| Ventas | ¿Solo salidas de stock o módulo de ventas? |
| PIN crítico | ¿Se agrega PIN para acciones críticas sin login? |
| Variantes | ¿Completamente flexibles o plantilla por categoría? |
| Modelo OpenRouter | ¿Qué modelo y presupuesto de uso? |

---

## Reglas de gobernanza

- Esta constitución tiene prioridad sobre cualquier decisión técnica puntual.
- Toda ambigüedad en una spec se resuelve antes de implementar, no durante.
- Los criterios de aceptación definen cuándo una feature está "done".
- Cualquier cambio a esta constitución requiere documentar el motivo y actualizar la versión.

**Version**: 1.0.0 | **Ratificada**: 2026-06-09 | **Última enmienda**: 2026-06-09
