# SPEC-07 — QA y Pruebas

**Estado:** Pendiente  
**Criterio de salida:** Checklist de pruebas listo  
**Fase:** 5

---

## Alcance del plan de pruebas

Este documento define los casos de prueba funcionales, validaciones, casos límite y regresión para el MVP. Las pruebas deben ejecutarse antes de considerar una feature como "done".

---

## Definition of Done

| Tipo | Criterio |
|---|---|
| Done — funcional | Cumple todos los criterios de aceptación definidos en SPEC-01 y maneja los errores principales. |
| Done — datos | Persiste correctamente, registra historial y no rompe reglas de stock. |
| Done — UX | Es legible, responde rápido y no presenta estados confusos o vacíos sin mensaje. |
| Done — IA | El chatbot no ejecuta acciones críticas sin confirmación y valida cambios en backend. |
| Done — entrega | Incluye documentación mínima de uso, importación, exportación y configuración. |

---

## Casos de prueba por módulo

### Productos

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-P01 | Crear producto con todos los campos válidos. | Producto activo visible en inventario. |
| TC-P02 | Crear producto sin nombre. | Error de validación: campo requerido. |
| TC-P03 | Crear producto con precio de venta negativo. | Error de validación: precio inválido. |
| TC-P04 | Editar nombre de producto activo. | Cambio guardado + registro en historial. |
| TC-P05 | Desactivar un producto activo. | Estado cambia a `discontinued`. No se borra. |
| TC-P06 | Desactivar un producto ya descontinuado. | Sin cambio o mensaje informativo. |
| TC-P07 | Buscar producto por nombre. | Solo aparecen productos que coinciden. |
| TC-P08 | Filtrar por estado `out_of_stock`. | Solo aparecen productos agotados. |
| TC-P09 | Ver detalle de producto con variantes. | Muestra variantes y stock total calculado. |

### Variantes

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-V01 | Crear variante con atributos únicos. | Variante creada y visible en el producto. |
| TC-V02 | Crear variante duplicada (mismo producto, mismos atributos). | Error: variante duplicada. |
| TC-V03 | Actualizar stock de variante a 0. | Estado variante cambia a `out_of_stock`. |
| TC-V04 | Intentar guardar stock negativo. | Error de validación: stock no puede ser negativo. |
| TC-V05 | Producto con todas las variantes en stock 0. | Producto cambia a `out_of_stock`. |
| TC-V06 | Producto con al menos una variante con stock > 0. | Producto permanece `active`. |

### Stock y alertas

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-S01 | Stock actual = stock mínimo. | Aparece alerta de stock bajo en inventario y dashboard. |
| TC-S02 | Stock actual < stock mínimo. | Aparece alerta de stock bajo. |
| TC-S03 | Stock actual > stock mínimo. | No aparece alerta. |
| TC-S04 | Ajuste de stock con motivo. | Movimiento registrado con before/after/motivo/fecha. |
| TC-S05 | Ajuste de stock sin motivo. | Error de validación: motivo requerido. |

### Historial

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-H01 | Editar un campo de producto. | Se genera movimiento tipo `edit` con fecha. |
| TC-H02 | Desactivar producto. | Se genera movimiento tipo `deactivation`. |
| TC-H03 | Importar productos. | Se genera `ImportBatch` + movimientos tipo `import`. |
| TC-H04 | Acción del chatbot confirmada. | Se genera `ChatAction` + movimientos vinculados. |

### Importación

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-I01 | Importar CSV válido. | Previsualización correcta; aplicación exitosa al confirmar. |
| TC-I02 | Importar CSV con fila sin nombre. | Fila marcada como error; no se aplica esa fila. |
| TC-I03 | Importar CSV con stock negativo. | Fila marcada como error. |
| TC-I04 | Importar CSV con categoría desconocida. | Advertencia; usuario decide si continuar. |
| TC-I05 | Confirmar importación con errores. | Solo se aplican filas válidas. |
| TC-I06 | Cancelar importación previamente validada. | No se aplica ningún cambio. |
| TC-I07 | Importar archivo con formato incorrecto. | Error global; no se muestra previsualización. |

### Exportación

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-E01 | Exportar inventario completo a CSV. | Archivo descargado con todos los productos. |
| TC-E02 | Exportar con filtro de categoría aplicado. | Solo productos de esa categoría en el archivo. |
| TC-E03 | Exportar a Excel. | Archivo XLSX descargado correctamente. |
| TC-E04 | Exportar a PDF. | PDF con encabezado, filtros visibles y tabla correcta. |

### Chatbot

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-C01 | Consultar stock de un producto existente. | Respuesta con cantidad actual, sin confirmación. |
| TC-C02 | Consultar stock de producto inexistente. | Respuesta indicando que no se encontró el producto. |
| TC-C03 | Solicitar creación de producto. | Se muestra resumen; no se crea hasta confirmar. |
| TC-C04 | Confirmar creación propuesta. | Producto creado + movimiento registrado. |
| TC-C05 | Rechazar creación propuesta. | No se crea nada. |
| TC-C06 | Solicitar ajuste de stock. | Se pide motivo y confirmación antes de aplicar. |
| TC-C07 | Solicitar desactivación de producto. | Advertencia + confirmación requerida. |
| TC-C08 | OpenRouter no disponible. | Mensaje de error claro; inventario sigue operable. |
| TC-C09 | Verificar que API key no está en respuesta del frontend. | No debe aparecer en ningún response del cliente. |

---

## Casos límite

| Caso | Comportamiento esperado |
|---|---|
| Inventario vacío (sin productos). | Dashboard muestra estado vacío con mensaje amigable. |
| Producto sin variantes. | Stock del producto es su propio campo `stock_current`. |
| Producto con 100+ variantes. | Carga correcta sin degradación visible. |
| Importar archivo de 500 filas. | Previsualización completa; importación exitosa dentro de tiempo razonable. |
| Búsqueda sin resultados. | Mensaje de estado vacío: "No se encontraron productos". |
| Exportar inventario vacío. | Archivo descargado con encabezados pero sin filas de datos. |
| Chatbot con mensaje muy largo. | Responde sin errores; no rompe el layout. |

---

## Pruebas de seguridad básicas

| Prueba | Criterio |
|---|---|
| API key de OpenRouter. | No debe aparecer en respuestas del frontend, logs del cliente ni código JavaScript público. |
| Acción del chatbot sin confirmación. | El backend debe rechazar cualquier mutación sin `status: confirmed`. |
| Stock negativo por API. | El backend debe rechazar peticiones con stock < 0 aunque lleguen directamente. |
| Importación sin confirmar batch. | El backend no debe aplicar importación sin confirmación explícita del batchId. |
