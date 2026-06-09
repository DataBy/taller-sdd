# SPEC-04 — API y Acciones

**Estado:** Pendiente  
**Criterio de salida:** Endpoints o acciones definidos  
**Fase:** 3

---

> Este documento define los contratos de la API. No es código. Es el acuerdo previo entre frontend y backend sobre qué operaciones existen, qué reciben y qué devuelven.

---

## Convenciones

- Base URL: `/api/v1`
- Formato: JSON
- Errores: `{ "error": "mensaje", "field": "campo_opcional" }`
- Paginación: `?page=1&limit=20`
- Filtros: query params según endpoint

---

## Productos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/products` | Listar productos con filtros, búsqueda y paginación. |
| GET | `/products/:id` | Obtener detalle de un producto con sus variantes. |
| POST | `/products` | Crear un nuevo producto. |
| PUT | `/products/:id` | Editar un producto existente. |
| PATCH | `/products/:id/status` | Cambiar estado del producto (active, discontinued). |
| GET | `/products/:id/movements` | Historial de movimientos del producto. |

### Filtros disponibles en GET /products
- `search`: texto libre (nombre, categoría, proveedor)
- `category_id`: filtrar por categoría
- `supplier_id`: filtrar por proveedor
- `status`: active | out_of_stock | discontinued
- `low_stock`: boolean (solo productos con stock ≤ stock mínimo)

---

## Variantes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/products/:id/variants` | Listar variantes de un producto. |
| POST | `/products/:id/variants` | Crear una variante. |
| PUT | `/products/:id/variants/:variantId` | Editar una variante. |
| PATCH | `/products/:id/variants/:variantId/stock` | Actualizar stock de una variante con motivo. |
| PATCH | `/products/:id/variants/:variantId/status` | Cambiar estado de la variante. |

---

## Categorías

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/categories` | Listar categorías activas. |
| POST | `/categories` | Crear una categoría. |
| PUT | `/categories/:id` | Editar una categoría. |
| PATCH | `/categories/:id/status` | Activar o desactivar una categoría. |

---

## Proveedores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/suppliers` | Listar proveedores. |
| GET | `/suppliers/:id` | Detalle de un proveedor. |
| POST | `/suppliers` | Crear un proveedor. |
| PUT | `/suppliers/:id` | Editar un proveedor. |

---

## Movimientos / Historial

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/movements` | Listar todos los movimientos con filtros. |
| POST | `/movements` | Registrar un movimiento manual (entrada, salida, ajuste). |

### Filtros disponibles en GET /movements
- `product_id`
- `variant_id`
- `type`: entry | exit | adjustment | edit | deactivation | import | chat_action
- `origin`: manual | import | chatbot
- `date_from`, `date_to`

---

## Importación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/import/preview` | Recibir archivo, validar y devolver previsualización. |
| POST | `/import/confirm/:batchId` | Confirmar y aplicar una importación previamente validada. |
| DELETE | `/import/cancel/:batchId` | Cancelar una importación pendiente. |
| GET | `/import/batches` | Listar historial de importaciones. |

### Respuesta de /import/preview
```json
{
  "batch_id": "uuid",
  "total_rows": 50,
  "valid_rows": 47,
  "error_rows": 3,
  "preview": [...],
  "errors": [
    { "row": 12, "field": "price_sale", "message": "Debe ser un número positivo" }
  ]
}
```

---

## Exportación

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/export/csv` | Exportar inventario filtrado en CSV. |
| GET | `/export/excel` | Exportar inventario filtrado en Excel. |
| GET | `/export/pdf` | Exportar inventario filtrado en PDF. |

Los mismos filtros de `/products` aplican para exportación.

---

## Chatbot

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/chat/message` | Enviar mensaje al chatbot. Devuelve respuesta o propuesta de acción. |
| POST | `/chat/confirm/:actionId` | Confirmar una acción propuesta por el chatbot. |
| POST | `/chat/reject/:actionId` | Rechazar una acción propuesta. |
| GET | `/chat/history` | Historial de conversación y acciones. |

### Flujo de acción del chatbot
```
1. Usuario envía mensaje → POST /chat/message
2. Backend interpreta intención y parámetros
3. Si es consulta → devuelve respuesta directa
4. Si es acción → devuelve propuesta con status: "proposed" y actionId
5. Usuario confirma → POST /chat/confirm/:actionId
6. Backend ejecuta la acción y registra movimiento
```

---

## Configuración

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/settings` | Obtener configuración actual. |
| PUT | `/settings` | Actualizar configuración (moneda, modelo IA, etc.). |

---

## Dashboard

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/dashboard/summary` | Métricas principales del inventario. |

### Respuesta de /dashboard/summary
```json
{
  "active_products": 120,
  "total_variants": 340,
  "low_stock_count": 15,
  "out_of_stock_count": 8,
  "estimated_purchase_value": 4500.00,
  "estimated_sale_value": 9800.00,
  "recent_movements": [...]
}
```

---

## Validaciones requeridas en backend

| Regla | Descripción |
|---|---|
| Stock negativo | Rechazar cualquier operación que resulte en stock < 0. |
| Precios | Rechazar precios negativos. |
| Variante duplicada | Rechazar variantes con mismos atributos para el mismo producto. |
| Acción del chatbot | Toda acción de modificación debe tener status `confirmed` antes de ejecutarse. |
| Importación | No aplicar importación sin `confirm` explícito del batch. |
| API key | La clave de OpenRouter solo se lee de variables de entorno en el servidor. |
