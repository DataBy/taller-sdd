# PLAN-06 — Importación y Exportación

**Spec:** SPEC-06  
**Estado:** Pendiente  
**Dependencias:** PLAN-01 aprobado, PLAN-03 aprobado, PLAN-04 aprobado  
**Bloquea:** PLAN-07 (QA necesita casos de archivo), PLAN-08

---

## Objetivo del plan

Cerrar el diseño completo del módulo de importación y exportación: plantillas de archivo, reglas de validación por columna, flujo de confirmación, manejo de errores y formatos de salida. Sin código; el resultado son los contratos de archivo y comportamiento.

---

## Fases

### Fase 1 — Plantillas de importación

Crear y documentar las plantillas de archivo que el usuario debe usar:

#### Plantilla de productos (CSV/Excel)

| Columna | Tipo | Requerido | Ejemplo | Validación |
|---|---|---|---|---|
| name | texto | Sí | Llavero Volcán | No vacío, máx. 200 caracteres. |
| category | texto | Sí | Llaveros | Debe existir en catálogo de categorías. |
| description | texto | No | Souvenir artesanal | Máx. 500 caracteres. |
| stock_current | número entero | Sí | 50 | ≥ 0. |
| stock_minimum | número entero | No | 10 | ≥ 0. Default 0. |
| price_purchase | número decimal | No | 500.00 | ≥ 0. |
| price_sale | número decimal | No | 1200.00 | ≥ 0. |
| supplier | texto | No | Artesanías CR | Si no existe, se crea. |
| location | texto | No | Bodega A - Estante 3 | Libre. |
| status | texto | No | active | Valores: active, discontinued. Default: active. |

#### Plantilla de variantes (CSV/Excel)

| Columna | Tipo | Requerido | Ejemplo | Validación |
|---|---|---|---|---|
| product_name | texto | Sí | Camiseta Logo | Debe existir en el sistema. |
| sku | texto | No | CAM-M-NEGRO | Único en el sistema si se usa. |
| attributes | texto | Sí | talla:M,color:negro | Formato clave:valor separado por comas. |
| stock_current | número entero | Sí | 25 | ≥ 0. |
| stock_minimum | número entero | No | 5 | ≥ 0. Default 0. |
| location | texto | No | Bodega A | Libre. |

### Fase 2 — Reglas de validación detalladas

Para cada tipo de error, definir el mensaje exacto que verá el usuario:

| Error | Mensaje |
|---|---|
| Nombre vacío | "La fila N no tiene nombre. El campo 'name' es requerido." |
| Categoría desconocida | "La categoría 'X' en la fila N no existe. Se puede crear automáticamente." |
| Stock negativo | "La fila N tiene stock negativo (-5). El stock mínimo es 0." |
| Precio inválido | "La fila N tiene un precio inválido. Debe ser un número mayor o igual a 0." |
| Producto duplicado | "La fila N tiene el mismo nombre y categoría que un producto existente (ID: X). Se actualizará." |
| Variante duplicada | "La fila N tiene los mismos atributos que una variante existente. Se actualizará." |
| Formato de atributos inválido | "La fila N tiene atributos con formato incorrecto. Use: talla:M,color:negro." |
| SKU duplicado | "El SKU 'X' en la fila N ya existe en el sistema." |

### Fase 3 — Comportamiento de duplicados

Definir explícitamente qué pasa cuando se importa un registro que ya existe:

| Caso | Comportamiento default |
|---|---|
| Producto con mismo nombre y categoría | Advertencia. Usuario decide: actualizar o saltar. |
| Variante con mismos atributos | Advertencia. Usuario decide: actualizar o saltar. |
| SKU ya existente | Error. No se importa esa fila. |

Este comportamiento debe quedar documentado en SPEC-06 antes de implementar.

### Fase 4 — Flujo de UI de importación

Definir con detalle el flujo de usuario:

```
Paso 1 — Selección de archivo
  - Zona de drag & drop o botón "Seleccionar archivo".
  - Formatos aceptados: .csv, .xlsx.
  - Tamaño máximo: [por definir, ej. 5MB].
  - Mostrar instrucciones de formato esperado con enlace a plantilla descargable.

Paso 2 — Procesamiento
  - Spinner o barra de progreso mientras se valida el archivo.
  - Máximo de filas por importación: [por definir, ej. 500 filas].

Paso 3 — Previsualización
  - Tabla con todas las filas del archivo.
  - Columna de estado por fila: ✓ válida / ⚠ advertencia / ✗ error.
  - Panel resumen superior: X válidas, X advertencias, X errores.
  - Detalle del error visible al hacer hover o expandir la fila.

Paso 4 — Confirmación
  - Botón: "Importar X filas válidas" (deshabilitado si hay 0 válidas).
  - Botón: "Cancelar".
  - Modal de confirmación: "¿Confirmas importar X productos y Y variantes?"

Paso 5 — Resultado
  - Resumen post-importación: X creados, X actualizados, X omitidos.
  - Acceso al historial del ImportBatch.
```

### Fase 5 — Plantillas descargables

Definir que el sistema debe ofrecer:
- Plantilla de productos vacía (CSV y Excel).
- Plantilla de variantes vacía (CSV y Excel).
- Accesibles desde la pantalla de importación.

### Fase 6 — Diseño de exportación

Confirmar las columnas exactas para cada formato:

- **CSV y Excel:** columnas de la tabla principal + columnas de variantes en hoja separada (Excel) o archivo separado (CSV).
- **PDF:** solo columnas principales del producto, sin variantes detalladas (para legibilidad).

Confirmar encabezado del PDF:
- Logo o nombre de la app.
- Fecha y hora de exportación.
- Filtros aplicados listados.
- Total de registros.

### Fase 7 — Aprobación

- Revisar plantillas, mensajes de error y flujo de UI con el responsable.
- Marcar SPEC-06 como **Aprobado**.

---

## Entregables del plan

- Plantillas de importación documentadas con todas las columnas, tipos y validaciones.
- Mensajes de error exactos para cada caso.
- Comportamiento de duplicados definido.
- Flujo de UI de importación detallado paso a paso.
- Columnas de exportación confirmadas por formato.

---

## Criterio de salida

- El diseño de importación es suficientemente detallado para implementar sin ambigüedad.
- Los mensajes de error cubren todos los casos de SPEC-07 (TC-I01 a TC-I07).
- SPEC-06 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Archivos mal formateados por el usuario. | Instrucciones claras + plantillas descargables. |
| Importaciones muy grandes degradan rendimiento. | Definir límite de filas y documentarlo. |
| Comportamiento de duplicados no acordado. | Resolverlo en Fase 3 antes de implementar. |
