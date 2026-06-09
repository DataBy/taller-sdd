# PLAN-03 — Modelo de Datos

**Spec:** SPEC-03  
**Estado:** Pendiente  
**Dependencias:** PLAN-00 aprobado (decisión de base de datos), PLAN-01 aprobado  
**Bloquea:** PLAN-04 (API), PLAN-08 (implementación)

---

## Objetivo del plan

Validar el modelo conceptual de datos, resolver ambigüedades de entidades y relaciones, y producir un modelo listo para ser traducido a esquema de base de datos. Sin código ni migraciones aún.

---

## Fases

### Fase 1 — Revisión de entidades

Revisar cada entidad de SPEC-03 y confirmar:

#### Product
- ¿`stock_current` se calcula siempre desde variantes o puede ser propio del producto cuando no tiene variantes?
- Confirmar comportamiento: si el producto no tiene variantes, `stock_current` es un campo editable directo.
- ¿`status` se calcula automáticamente o se actualiza manualmente?
- Definir regla explícita: `status = out_of_stock` cuando `stock_current = 0`, `status = discontinued` solo por acción manual.

#### Variant
- Confirmar formato de `attributes`: JSON libre `{"talla": "M", "color": "negro"}`.
- Definir cómo se valida unicidad: hash de atributos normalizados (keys ordenados + lowercase).
- Confirmar si `sku` es único a nivel global o solo dentro del producto.

#### Category
- ¿Las categorías pueden tener subcategorías en v1.0? (Definir como NO para MVP).
- ¿Las categorías pueden tener íconos o colores? (Definir como NO para MVP).

#### Supplier
- Confirmar campos: nombre (requerido), teléfono, correo, dirección, notas.
- ¿Un proveedor puede desactivarse? ¿Qué pasa con sus productos asociados?

#### InventoryMovement
- Confirmar todos los valores del enum `type`.
- Definir qué campos son opcionales vs requeridos por tipo de movimiento.
- ¿Se registra el usuario que hizo el cambio? (No en v1.0 por ausencia de login; registrar `origin`).

#### ImportBatch
- Definir cuándo expira o se limpia el batch en estado `pending`.
- Confirmar que se conserva el detalle de errores en el campo `errors` (JSON).

#### ChatAction
- Confirmar el ciclo de vida: `proposed → confirmed → executed` y `proposed → rejected`.
- ¿Los `ChatAction` rechazados se conservan en historial? (Sí, para auditoría).

#### AppSettings
- Confirmar que es un singleton (una sola fila en la tabla).
- Definir valores por defecto: moneda `USD`, modelo `[por definir]`.

### Fase 2 — Revisión de relaciones

| Relación | Verificación |
|---|---|
| Product 1:N Variant | ¿Un producto puede existir sin variantes? Sí. |
| Supplier 1:N Product | ¿Un producto puede existir sin proveedor? Sí (campo opcional). |
| Category 1:N Product | ¿Un producto puede existir sin categoría? No — campo requerido. |
| Product/Variant → InventoryMovement | ¿Un movimiento puede ser solo de producto (sin variante)? Sí. |
| ImportBatch → InventoryMovement | Relación opcional; solo cuando el movimiento viene de importación. |
| ChatAction → InventoryMovement | Relación opcional; solo cuando la acción del chatbot produce movimientos. |

### Fase 3 — Reglas de integridad

Documentar las restricciones de integridad del modelo:

| Restricción | Descripción |
|---|---|
| Stock ≥ 0 | `stock_current` y `stock_minimum` en Product y Variant nunca negativos. |
| Precios ≥ 0 | `price_purchase` y `price_sale` en Product nunca negativos. |
| Variante única | No dos variantes del mismo producto con los mismos atributos. |
| SKU único | Si se usa SKU, debe ser único en todo el sistema. |
| Categoría requerida | Todo producto debe tener `category_id`. |
| Movimiento con cantidad | `quantity_delta` puede ser positivo (entrada) o negativo (salida). |
| Softdelete | Los registros con estado `discontinued` no se borran físicamente. |

### Fase 4 — Índices y consultas frecuentes

Identificar los campos que se usarán con frecuencia en búsquedas y filtros, para anticipar índices:

| Consulta frecuente | Campo(s) involucrados |
|---|---|
| Buscar productos por nombre | `Product.name` |
| Filtrar por categoría | `Product.category_id` |
| Filtrar por proveedor | `Product.supplier_id` |
| Filtrar por estado | `Product.status` |
| Listar variantes de un producto | `Variant.product_id` |
| Historial de un producto | `InventoryMovement.product_id` |
| Historial de una variante | `InventoryMovement.variant_id` |
| Movimientos por tipo | `InventoryMovement.type` |
| Movimientos por origen | `InventoryMovement.origin` |
| Batches de importación | `ImportBatch.status` |

### Fase 5 — Validación contra SPEC-01 y SPEC-04

- Verificar que cada RF de SPEC-01 tiene los campos necesarios en el modelo.
- Verificar que cada endpoint de SPEC-04 puede ser construido con este modelo.
- Verificar que el chatbot de SPEC-05 puede leer y escribir con este modelo.

### Fase 6 — Aprobación

- Revisar el modelo final con el responsable del proyecto.
- Marcar SPEC-03 como **Aprobado**.

---

## Entregables del plan

- SPEC-03 actualizada con todas las ambigüedades resueltas.
- Reglas de integridad documentadas y cerradas.
- Lista de índices anticipados para consultas frecuentes.
- Decisión documentada sobre variantes (confirmación del formato JSON).

---

## Criterio de salida

- Todas las entidades tienen campos, tipos y reglas definidas sin `[PENDIENTE]`.
- Las relaciones están confirmadas con cardinalidad explícita.
- SPEC-03 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Decisión de base de datos no resuelta. | El modelo conceptual es válido para cualquier motor; la decisión de motor viene de PLAN-00. |
| Variantes con atributos muy complejos. | Limitar a JSON plano en v1.0; profundidad mayor en versiones posteriores. |
| Stock del producto vs stock de variantes inconsistente. | Definir la regla de cálculo claramente en SPEC-03 y validarla en PLAN-04. |
