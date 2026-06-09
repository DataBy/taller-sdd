# SPEC-03 — Modelo de Datos Conceptual

**Estado:** Pendiente  
**Criterio de salida:** Modelo conceptual validado  
**Fase:** 3

---

> Este modelo es conceptual. No es una implementación ni una migración de base de datos. Sirve como contrato previo para diseñar la API, los formularios, importaciones y el chatbot.

---

## Entidades

### Product
Producto general del inventario.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. Único. |
| name | string | Requerido. Nombre visible del producto. |
| category_id | FK → Category | Requerido. Categoría del producto. |
| description | string | Opcional. Texto corto descriptivo. |
| stock_current | integer | Si tiene variantes, se calcula desde las variantes activas. No puede ser negativo. |
| stock_minimum | integer | Umbral de alerta. No puede ser negativo. |
| price_purchase | decimal | Precio de compra unitario. ≥ 0. |
| price_sale | decimal | Precio de venta unitario. ≥ 0. |
| supplier_id | FK → Supplier | Opcional. Proveedor asociado. |
| location | string | Opcional. Ubicación física del producto. |
| status | enum | Valores: `active`, `out_of_stock`, `discontinued`. |
| created_at | datetime | Generado automáticamente. |
| updated_at | datetime | Actualizado automáticamente en cada cambio. |

---

### Variant
Variante de un producto con atributos específicos.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. Único. |
| product_id | FK → Product | Requerido. Producto al que pertenece. |
| attributes | JSON / key-value | Atributos flexibles: talla, color, material, diseño, tamaño, etc. |
| sku | string | Opcional. Código único para identificar la variante. |
| stock_current | integer | Stock actual de esta variante. No puede ser negativo. |
| stock_minimum | integer | Umbral de alerta de esta variante. ≥ 0. |
| location | string | Opcional. Puede diferir de la ubicación del producto. |
| status | enum | Valores: `active`, `out_of_stock`, `discontinued`. |
| created_at | datetime | Generado automáticamente. |
| updated_at | datetime | Actualizado automáticamente. |

**Unicidad:** No puede existir dos variantes del mismo producto con exactamente los mismos atributos.

---

### Category
Catálogo de categorías de productos.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. |
| name | string | Requerido. Único. |
| description | string | Opcional. |
| is_active | boolean | Default `true`. |

**Categorías iniciales:** Llaveros, Imanes, Camisetas, Tazas, Artesanías, Pulseras.

---

### Supplier
Proveedor de productos.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. |
| name | string | Requerido. |
| phone | string | Opcional. |
| email | string | Opcional. Formato de correo válido. |
| address | string | Opcional. |
| notes | text | Opcional. |
| created_at | datetime | Generado automáticamente. |

---

### InventoryMovement
Registro de cada cambio de stock o estado relevante.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. |
| product_id | FK → Product | Requerido. |
| variant_id | FK → Variant | Opcional. Si aplica a una variante específica. |
| type | enum | Valores: `entry`, `exit`, `adjustment`, `edit`, `deactivation`, `import`, `chat_action`. |
| quantity_before | integer | Stock antes del movimiento. |
| quantity_after | integer | Stock después del movimiento. |
| quantity_delta | integer | Diferencia neta (puede ser negativo en salidas). |
| reason | string | Motivo del movimiento. Requerido en ajustes y acciones del chatbot. |
| origin | enum | Valores: `manual`, `import`, `chatbot`. |
| import_batch_id | FK → ImportBatch | Opcional. Si el movimiento viene de una importación. |
| chat_action_id | FK → ChatAction | Opcional. Si el movimiento viene del chatbot. |
| created_at | datetime | Generado automáticamente. |

---

### ImportBatch
Registro de cada importación realizada.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. |
| filename | string | Nombre del archivo importado. |
| file_type | enum | Valores: `csv`, `xlsx`. |
| total_rows | integer | Total de filas en el archivo. |
| valid_rows | integer | Filas importadas exitosamente. |
| error_rows | integer | Filas con error. |
| status | enum | Valores: `pending`, `confirmed`, `cancelled`. |
| errors | JSON | Detalle de errores por fila. |
| created_at | datetime | Generado automáticamente. |
| confirmed_at | datetime | Fecha de confirmación por el usuario. |

---

### ChatAction
Registro de acciones propuestas y ejecutadas por el chatbot.

| Campo | Tipo | Regla |
|---|---|---|
| id | UUID / autoincremental | Generado automáticamente. |
| intent | string | Intención detectada: `query`, `create`, `update`, `stock_adjustment`, `deactivate`, `history`. |
| parameters | JSON | Parámetros de la acción. |
| status | enum | Valores: `proposed`, `confirmed`, `rejected`, `executed`. |
| result | JSON | Resultado de la ejecución. |
| created_at | datetime | Generado automáticamente. |
| confirmed_at | datetime | Fecha de confirmación del usuario. |

---

### AppSettings
Configuración global de la aplicación.

| Campo | Tipo | Regla |
|---|---|---|
| id | integer | Fila única (singleton). |
| currency | string | Default `USD`. |
| openrouter_model | string | Modelo de IA a usar. |
| low_stock_global_threshold | integer | Opcional. Umbral global de stock bajo. |
| active_categories | JSON | Lista de categorías visibles. |
| updated_at | datetime | Actualizado automáticamente. |

---

## Relaciones clave

| Relación | Descripción |
|---|---|
| Product 1:N Variant | Un producto puede tener muchas variantes. |
| Supplier 1:N Product | Un proveedor puede alimentar muchos productos. |
| Category 1:N Product | Una categoría agrupa muchos productos. |
| Product 1:N InventoryMovement | Cada cambio del producto genera un movimiento. |
| Variant 1:N InventoryMovement | Cada cambio de una variante genera un movimiento. |
| ImportBatch 1:N InventoryMovement | Una importación puede crear múltiples movimientos. |
| ChatAction 1:N InventoryMovement | Una acción del chatbot puede producir movimientos auditables. |

---

## Reglas de estado del producto

```
active       → El producto tiene stock > 0 o no tiene variantes con stock 0.
out_of_stock → stock_current = 0 o todas las variantes tienen stock_current = 0.
discontinued → Desactivado manualmente. No se borra. Conserva historial.
```

---

## Decisión técnica pendiente

La elección entre SQLite y Supabase/PostgreSQL depende de si el MVP es local o web. El modelo conceptual es el mismo; solo cambia el motor de base de datos y la estrategia de conexión.
