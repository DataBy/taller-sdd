# SPEC-06 — Importación y Exportación

**Estado:** Pendiente  
**Criterio de salida:** Casos de archivo y errores cubiertos  
**Fase:** 5

---

## Importación

### Formatos soportados
- CSV (delimitado por comas, encabezados en primera fila)
- Excel (XLSX, una hoja estándar)

### Flujo de importación

```
1. Usuario selecciona o arrastra el archivo.
2. Sistema valida formato y lee encabezados.
3. Sistema muestra previsualización:
   - Filas válidas (verde)
   - Filas con advertencias (amarillo)
   - Filas con errores (rojo)
4. Usuario revisa y decide:
   - Confirmar solo filas válidas
   - Cancelar la importación
5. Sistema aplica importación confirmada.
6. Sistema registra ImportBatch en historial.
```

### Encabezados esperados — Productos

| Columna | Tipo | Requerido | Notas |
|---|---|---|---|
| name | string | Sí | Nombre del producto. |
| category | string | Sí | Debe coincidir con una categoría existente. |
| description | string | No | Texto corto. |
| stock_current | integer | Sí | ≥ 0. |
| stock_minimum | integer | No | ≥ 0. Default 0. |
| price_purchase | decimal | No | ≥ 0. |
| price_sale | decimal | No | ≥ 0. |
| supplier | string | No | Nombre del proveedor. Si no existe, se crea. |
| location | string | No | Ubicación física. |
| status | string | No | active | discontinued. Default: active. |

### Encabezados esperados — Variantes

| Columna | Tipo | Requerido | Notas |
|---|---|---|---|
| product_name | string | Sí | Nombre del producto al que pertenece la variante. |
| sku | string | No | Código de variante. |
| attributes | string | Sí | Formato: `talla:M,color:negro`. |
| stock_current | integer | Sí | ≥ 0. |
| stock_minimum | integer | No | ≥ 0. Default 0. |
| location | string | No | Ubicación de esta variante. |

---

### Validaciones de importación

| Validación | Acción |
|---|---|
| Campos obligatorios faltantes | Error — fila marcada en rojo. |
| Precio negativo | Error — fila marcada en rojo. |
| Stock negativo | Error — fila marcada en rojo. |
| Categoría desconocida | Advertencia — se puede crear o ignorar. |
| Producto duplicado (mismo nombre y categoría) | Advertencia — se puede actualizar o saltar. |
| Variante duplicada (mismo producto y atributos) | Advertencia — se puede actualizar o saltar. |
| Formato de archivo incorrecto | Error global — no se muestra previsualización. |
| Archivo vacío | Error global. |
| Hoja de cálculo no encontrada (Excel) | Error global. |

---

### Comportamiento post-importación

- Se genera un `ImportBatch` con total, válidas, errores y estado `confirmed`.
- Cada producto o variante importado genera un `InventoryMovement` de tipo `import`.
- Se muestra resumen al usuario: X productos creados, X variantes creadas, X errores omitidos.

---

## Exportación

### Formatos soportados
- CSV
- Excel (XLSX)
- PDF

### Datos exportados

La exportación incluye el inventario completo o filtrado según los filtros activos en el momento de exportar.

| Columna exportada | Descripción |
|---|---|
| ID | Identificador interno. |
| Nombre | Nombre del producto. |
| Categoría | Categoría del producto. |
| Descripción | Descripción del producto. |
| Stock total | Stock actual total (suma de variantes si aplica). |
| Stock mínimo | Umbral de alerta. |
| Precio de compra | Precio de compra unitario. |
| Precio de venta | Precio de venta unitario. |
| Proveedor | Nombre del proveedor asociado. |
| Ubicación | Ubicación física. |
| Estado | active / out_of_stock / discontinued. |
| Fecha de creación | Fecha de alta. |
| Última actualización | Fecha del último cambio. |

### Exportación de variantes
Opcionalmente se puede incluir una sección o hoja adicional con el detalle de variantes:

| Columna | Descripción |
|---|---|
| Producto | Nombre del producto padre. |
| SKU | Código de variante. |
| Atributos | Atributos en formato legible (talla: M, color: negro). |
| Stock actual | Stock de esta variante. |
| Stock mínimo | Umbral de alerta de esta variante. |
| Ubicación | Ubicación de la variante. |
| Estado | Estado de la variante. |

---

### Filtros que aplican a exportación

Los mismos filtros del módulo de inventario aplican:
- Categoría
- Proveedor
- Estado
- Stock bajo

---

### Formato PDF

El PDF debe ser un reporte legible con:
- Encabezado con nombre de la app y fecha de exportación.
- Filtros aplicados visibles.
- Tabla de productos con columnas principales.
- Total de registros al pie.
- Colores de la paleta institucional (morado y lavanda) en encabezados.

---

## Auditoría

| Acción | Registro |
|---|---|
| Importación confirmada | `ImportBatch` + `InventoryMovement` por cada producto/variante. |
| Exportación | Registro opcional de actividad en historial (tipo `export`). |
