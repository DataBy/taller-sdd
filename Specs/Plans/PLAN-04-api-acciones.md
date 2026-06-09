# PLAN-04 — API y Acciones

**Spec:** SPEC-04  
**Estado:** Pendiente  
**Dependencias:** PLAN-01 aprobado, PLAN-03 aprobado  
**Bloquea:** PLAN-05 (chatbot usa la API), PLAN-08 (implementación)

---

## Objetivo del plan

Cerrar los contratos de la API: endpoints, parámetros, respuestas, errores y validaciones. Este plan no genera código; genera un contrato completo y sin ambigüedades que el frontend y el backend implementarán de forma independiente.

---

## Fases

### Fase 1 — Revisión de endpoints por módulo

Para cada grupo de endpoints de SPEC-04, verificar:

#### Productos
- Confirmar los query params de `GET /products`: ¿cuáles son obligatorios, cuáles opcionales?
- Definir la respuesta completa de `GET /products/:id`: ¿incluye variantes? ¿incluye proveedor?
- Confirmar qué campos son actualizables en `PUT /products/:id`.
- Definir respuesta de `PATCH /products/:id/status`: ¿devuelve el producto actualizado o solo confirmación?

#### Variantes
- Confirmar respuesta de `POST /products/:id/variants`: ¿devuelve la variante creada?
- Definir qué pasa si `PATCH .../stock` resulta en stock = 0: ¿el sistema actualiza el estado automáticamente?
- Confirmar que el cuerpo de `PATCH .../stock` requiere `motivo`.

#### Importación
- Definir el contrato completo de `POST /import/preview`: headers del request (multipart/form-data), tamaño máximo de archivo.
- Confirmar qué devuelve `POST /import/confirm/:batchId` en éxito y en error.
- Definir cuánto tiempo vive un `batchId` sin ser confirmado antes de expirar.

#### Chatbot
- Definir el body completo de `POST /chat/message`: `{ "message": string, "conversation_id": string? }`.
- Definir la respuesta cuando es consulta vs cuando es acción propuesta.
- Confirmar la respuesta de `POST /chat/confirm/:actionId`.

#### Dashboard
- Confirmar qué incluye `recent_movements` en `/dashboard/summary`: cantidad, campos por movimiento.

### Fase 2 — Contratos de request y response

Para cada endpoint crítico, documentar el contrato completo:

**Ejemplo: POST /products**
```
Request:
{
  "name": string (requerido),
  "category_id": uuid (requerido),
  "description": string (opcional),
  "stock_current": integer >= 0 (requerido si no tiene variantes),
  "stock_minimum": integer >= 0 (opcional, default 0),
  "price_purchase": decimal >= 0 (opcional),
  "price_sale": decimal >= 0 (opcional),
  "supplier_id": uuid (opcional),
  "location": string (opcional)
}

Response 201:
{
  "id": uuid,
  "name": string,
  ... todos los campos del producto ...
  "created_at": datetime
}

Response 400:
{
  "error": "Nombre del producto es requerido",
  "field": "name"
}
```

Este nivel de detalle debe existir para: POST /products, PUT /products/:id, POST /products/:id/variants, PATCH .../stock, POST /import/preview, POST /import/confirm, POST /chat/message, POST /chat/confirm.

### Fase 3 — Catálogo de errores

Definir los códigos de error estándar de la API:

| Código HTTP | Cuándo usarlo |
|---|---|
| 400 | Validación fallida (campo faltante, formato inválido, stock negativo). |
| 404 | Recurso no encontrado (producto, variante, proveedor). |
| 409 | Conflicto (variante duplicada, SKU ya existente). |
| 422 | Regla de negocio violada (stock resultante < 0, acción sin confirmar). |
| 500 | Error interno del servidor (fallo de base de datos, fallo de OpenRouter). |
| 503 | OpenRouter no disponible. |

Cada error debe devolver: `{ "error": "mensaje legible", "code": "ERROR_CODE", "field": "campo_opcional" }`.

### Fase 4 — Revisión de validaciones backend

Verificar que cada endpoint tiene sus validaciones documentadas:

| Validación | Endpoint(s) |
|---|---|
| Stock no negativo | POST /products, PUT /products/:id, PATCH .../stock, POST /import/confirm |
| Precios no negativos | POST /products, PUT /products/:id, POST /import/confirm |
| Variante única | POST /products/:id/variants |
| Categoría existente | POST /products, PUT /products/:id, POST /import/confirm |
| Batch confirmado | POST /import/confirm/:batchId |
| Acción confirmada | POST /chat/confirm/:actionId |
| API key en servidor | POST /chat/message (verificación de entorno) |

### Fase 5 — Paginación y rendimiento

- Confirmar que todos los endpoints de listado tienen paginación (`page`, `limit`).
- Definir el límite máximo por página (ej. 100).
- Definir el orden por defecto de cada listado.
- Confirmar que `/movements` y `/products/:id/movements` tienen paginación.

### Fase 6 — Aprobación

- Revisar contratos completos con el responsable.
- Marcar SPEC-04 como **Aprobado**.

---

## Entregables del plan

- SPEC-04 actualizada con contratos request/response completos para endpoints críticos.
- Catálogo de errores documentado.
- Reglas de validación por endpoint cerradas.
- Decisión sobre tiempo de expiración de ImportBatch.

---

## Criterio de salida

- Todos los endpoints del MVP tienen método, ruta, parámetros y respuesta definidos.
- Los errores tienen códigos HTTP y mensajes estándar.
- SPEC-04 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cambios en SPEC-03 después de aprobar SPEC-04. | Sincronizar ambas specs antes de implementar. |
| Chatbot necesita endpoints no definidos aquí. | Resolver en PLAN-05 antes de PLAN-08. |
| Paginación insuficiente para inventarios grandes. | Definir límites claros y documentar en SPEC-04. |
