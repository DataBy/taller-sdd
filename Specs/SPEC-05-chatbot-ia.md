# SPEC-05 - Chatbot IA con OpenRouter

**Estado:** Listo para revisión  
**Criterio de salida:** Flujos, seguridad, confirmaciones y manejo de errores aceptados  
**Fase:** 4  
**Feature relacionada:** `Specs/005-chatbot-ia/spec.md`

---

## Objetivo

Definir el comportamiento del chatbot de inventario conectado a OpenRouter. El chatbot permite consultar datos del inventario y proponer acciones operativas, pero nunca ejecuta mutaciones sin confirmación explícita del usuario y validación del backend.

El chatbot es un asistente de dominio cerrado: productos, variantes, stock, proveedores, historial, importación/exportación y configuración relacionada con inventario.

---

## Principios obligatorios

| Principio | Regla |
|---|---|
| Backend como fuente de verdad | El chatbot no decide cambios finales; el backend valida y ejecuta. |
| Confirmación obligatoria | Crear, editar, ajustar stock y desactivar requieren propuesta + confirmación. |
| Sin ejecución directa | Un mensaje del usuario nunca modifica datos por sí solo. |
| Datos verificables | Las consultas se responden con datos leídos del inventario, no inventados. |
| API key protegida | La clave de OpenRouter vive solo en backend, en variables de entorno. |
| Dominio cerrado | Preguntas fuera de inventario se rechazan con mensaje breve. |
| Trazabilidad | Toda acción confirmada crea `ChatAction` y los `InventoryMovement` necesarios. |

---

## Arquitectura de integración

```text
Frontend
  |
  | POST /api/v1/chat/message
  v
Backend / API
  |-- valida mensaje
  |-- consulta datos relevantes
  |-- llama OpenRouter con prompt seguro
  |-- normaliza intención y parámetros
  |-- crea propuesta si es acción
  v
Base de datos

Backend / API
  |
  | HTTPS server-side
  v
OpenRouter API
```

Reglas:

- El frontend nunca llama directamente a OpenRouter.
- El frontend nunca recibe `OPENROUTER_API_KEY`.
- El backend puede usar OpenRouter para interpretar intención y redactar respuestas, pero la ejecución de acciones es lógica propia del backend.
- El backend debe validar stock, precios, existencia de producto, duplicados y estado antes de confirmar cualquier acción.

---

## Endpoints relacionados

| Método | Endpoint | Propósito |
|---|---|---|
| POST | `/api/v1/chat/message` | Enviar mensaje, devolver respuesta o propuesta de acción. |
| POST | `/api/v1/chat/confirm/:actionId` | Confirmar una acción previamente propuesta. |
| POST | `/api/v1/chat/reject/:actionId` | Rechazar una acción previamente propuesta. |
| GET | `/api/v1/chat/history` | Consultar historial de conversación y acciones. |

### Respuesta de consulta

```json
{
  "type": "answer",
  "intent": "query_stock",
  "message": "Hay 12 camisetas talla M activas.",
  "data": {
    "items": []
  }
}
```

### Respuesta de propuesta

```json
{
  "type": "proposal",
  "intent": "adjust_stock",
  "action_id": "uuid",
  "status": "proposed",
  "message": "Propongo registrar una entrada de stock.",
  "summary": {
    "product": "Llavero Volcán",
    "variant": null,
    "quantity_before": 20,
    "quantity_after": 70,
    "quantity_delta": 50,
    "reason": "Reposición de proveedor"
  },
  "requires_confirmation": true
}
```

---

## Modelo de OpenRouter

| Parámetro | Decisión para MVP |
|---|---|
| Modelo inicial | `[PENDIENTE]` Definir antes de implementar. Recomendado: modelo económico y rápido con buen seguimiento de instrucciones. |
| Temperatura | `0.2` por defecto. Rango permitido: `0.1 - 0.4`. |
| Idioma | Español. |
| Max tokens | `800` por respuesta inicial. Ajustable tras pruebas. |
| Timeout | 15 segundos recomendado. |

El modelo exacto queda pendiente porque depende de presupuesto, disponibilidad y despliegue. La implementación no debe hardcodear el modelo; debe leerse desde configuración o variable de entorno.

---

## Intenciones soportadas

| Intención | Tipo | Confirmación | Ejemplos |
|---|---|---|---|
| `query_stock` | Consulta | No | "¿Cuántas tazas hay?", "stock de camisetas M" |
| `query_low_stock` | Consulta | No | "¿Qué está por agotarse?", "muéstrame stock bajo" |
| `query_history` | Consulta | No | "historial del imán Volcán", "qué pasó con este producto" |
| `create_product` | Acción | Sí | "agrega pulsera negra stock 30" |
| `update_product` | Acción | Sí | "cambia el precio del imán a 5000" |
| `adjust_stock` | Acción | Sí | "entraron 20 tazas", "salieron 5 llaveros" |
| `deactivate_product` | Acción | Sí | "desactiva el imán Volcán Arenal" |
| `export_guidance` | Orientación | No | "quiero exportar los llaveros" |
| `out_of_domain` | Rechazo | No | Preguntas no relacionadas con inventario |

---

## Contrato por intención

### `query_stock`

| Campo | Definición |
|---|---|
| Propósito | Responder disponibilidad y cantidades actuales. |
| Datos requeridos | Producto, variante, categoría, proveedor o ubicación si aplica. |
| Backend consulta | Productos/variantes activos que coincidan con el texto. |
| Respuesta | Lista o resumen con nombre, variante, stock actual, stock mínimo y estado. |
| Confirmación | No requiere. |

Si hay múltiples coincidencias, el chatbot debe listar opciones y pedir precisión.

### `query_low_stock`

| Campo | Definición |
|---|---|
| Propósito | Mostrar productos o variantes donde `stock_current <= stock_minimum`. |
| Backend consulta | Inventario activo con stock bajo. |
| Respuesta | Lista ordenada por criticidad: agotados primero, luego menor diferencia. |
| Confirmación | No requiere. |

### `query_history`

| Campo | Definición |
|---|---|
| Propósito | Mostrar movimientos históricos de producto o variante. |
| Backend consulta | Últimos movimientos por `product_id` o `variant_id`. |
| Respuesta | Fecha, tipo, delta, stock anterior, stock nuevo, motivo y origen. |
| Confirmación | No requiere. |

### `create_product`

| Campo | Definición |
|---|---|
| Propósito | Proponer creación de producto y stock inicial. |
| Datos mínimos | Nombre y categoría. Stock, precios, proveedor, ubicación pueden ser opcionales según SPEC-01. |
| Si faltan datos mínimos | Preguntar antes de crear propuesta. |
| Propuesta | Mostrar todos los campos que se crearán. |
| Confirmación | Obligatoria. |
| Ejecución | Backend crea producto y registra movimiento inicial si hay stock. |

### `update_product`

| Campo | Definición |
|---|---|
| Propósito | Proponer cambio de un campo del producto o variante. |
| Datos mínimos | Producto identificado, campo, valor nuevo. |
| Backend consulta | Valor actual para mostrar antes/después. |
| Propuesta | Campo, valor anterior, valor nuevo, impacto si aplica. |
| Confirmación | Obligatoria. |
| Ejecución | Backend actualiza y registra movimiento tipo `edit`. |

### `adjust_stock`

| Campo | Definición |
|---|---|
| Propósito | Proponer entrada, salida o ajuste de stock. |
| Datos mínimos | Producto/variante, cantidad, tipo de movimiento. |
| Motivo | Obligatorio. Si no viene en el mensaje, debe preguntarse. |
| Validación | Stock resultante no puede ser negativo. |
| Propuesta | Stock actual, delta, stock resultante, motivo y origen `chatbot`. |
| Confirmación | Obligatoria. |
| Ejecución | Backend actualiza stock y registra `InventoryMovement`. |

### `deactivate_product`

| Campo | Definición |
|---|---|
| Propósito | Proponer descontinuar producto o variante. |
| Datos mínimos | Producto identificado sin ambigüedad. |
| Advertencia | Debe indicar que no se borra historial ni registros físicos. |
| Propuesta | Nombre, stock actual, estado actual y nuevo estado `discontinued`. |
| Confirmación | Obligatoria. |
| Ejecución | Backend cambia estado y registra movimiento tipo `deactivation`. |

### `export_guidance`

| Campo | Definición |
|---|---|
| Propósito | Orientar al usuario para exportar desde la UI o explicar filtros. |
| Mutación | Ninguna. |
| Confirmación | No requiere. |
| Regla | El chatbot no descarga archivos directamente en el MVP. |

### `out_of_domain`

| Campo | Definición |
|---|---|
| Propósito | Rechazar preguntas fuera de inventario. |
| Respuesta | "Solo puedo ayudarte con consultas y acciones sobre el inventario." |
| Confirmación | No requiere. |

---

## Flujo de procesamiento

```text
1. Usuario envía mensaje.
2. Frontend llama POST /api/v1/chat/message.
3. Backend valida longitud y formato del mensaje.
4. Backend arma contexto mínimo necesario.
5. Backend llama OpenRouter con system prompt y contexto.
6. Backend recibe intención y parámetros.
7. Backend normaliza y valida intención.
8. Si es consulta:
   8.1 consulta base de datos
   8.2 devuelve respuesta verificable
9. Si es acción:
   9.1 valida datos mínimos
   9.2 si falta información, pregunta
   9.3 si está completo, crea ChatAction status proposed
   9.4 devuelve propuesta al frontend
10. Usuario confirma o rechaza.
11. Si confirma:
   11.1 backend revalida reglas de negocio
   11.2 ejecuta mutación
   11.3 registra InventoryMovement
   11.4 marca ChatAction como executed
12. Si rechaza:
   12.1 marca ChatAction como rejected
```

---

## Ciclo de vida de `ChatAction`

| Estado | Significado |
|---|---|
| `proposed` | Acción detectada, validada parcialmente y presentada al usuario. |
| `confirmed` | Usuario confirmó explícitamente la propuesta. |
| `executed` | Backend ejecutó la acción y registró efectos. |
| `rejected` | Usuario rechazó la propuesta. |
| `failed` | La acción confirmada no pudo ejecutarse por validación o error. |

Transiciones válidas:

```text
proposed -> confirmed -> executed
proposed -> rejected
proposed -> confirmed -> failed
```

No se permite ejecutar una acción que no venga de `confirmed`.

---

## Política de confirmación

| Caso | Requiere confirmación | Información obligatoria antes de confirmar |
|---|---|---|
| Consulta de stock | No | Datos consultados y fuente implícita del inventario. |
| Stock bajo | No | Lista de productos/variantes afectados. |
| Historial | No | Movimientos encontrados. |
| Crear producto | Sí | Campos completos que se crearán. |
| Editar producto | Sí | Campo, valor anterior, valor nuevo. |
| Ajustar stock | Sí | Stock anterior, delta, stock final, motivo. |
| Desactivar | Sí | Elemento afectado, stock actual, advertencia de descontinuado. |

Confirmación explícita significa clic o acción de UI sobre "Confirmar". Un mensaje ambiguo como "ok" solo puede confirmar si está ligado a una propuesta activa y visible.

---

## Manejo de ambigüedad

| Situación | Comportamiento |
|---|---|
| Producto no encontrado | Informar que no se encontró y pedir otro nombre. |
| Múltiples productos coinciden | Mostrar opciones y pedir selección. |
| Variante no especificada | Preguntar variante si el producto tiene más de una. |
| Falta cantidad | Preguntar cantidad antes de proponer ajuste. |
| Falta motivo de stock | Preguntar motivo antes de proponer confirmación. |
| Campo no editable | Explicar que ese campo no puede modificarse desde chatbot. |

---

## Manejo de errores

| Error | Respuesta al usuario | Acción backend |
|---|---|---|
| OpenRouter timeout | "El asistente no está disponible. El inventario sigue funcionando normalmente." | No crear acción. |
| OpenRouter devuelve formato inválido | "No pude interpretar la solicitud. Intenta reformularla." | Registrar error técnico si aplica. |
| Validación backend falla | Mostrar motivo específico. | Marcar `ChatAction` como `failed` si ya existía. |
| Stock resultante negativo | "No puedo aplicar el ajuste porque dejaría stock negativo." | Rechazar ejecución. |
| Acción ya ejecutada | "Esta propuesta ya fue ejecutada." | No duplicar movimientos. |
| Acción expirada | "La propuesta expiró. Vuelve a solicitar el cambio." | No ejecutar. |
| Mensaje fuera de dominio | "Solo puedo ayudarte con consultas y acciones sobre el inventario." | No llamar datos sensibles. |

---

## System prompt base

```text
Eres un asistente de inventario para una tienda de souvenirs.

Tu dominio es exclusivamente inventario: productos, variantes, categorías,
proveedores, stock, ubicaciones, historial de movimientos, importación,
exportación y configuración operativa relacionada.

Reglas obligatorias:
- Responde siempre en español.
- No inventes datos. Si falta información, dilo claramente.
- No ejecutes acciones. Solo puedes identificar intenciones y proponer cambios.
- Toda creación, edición, ajuste de stock o desactivación requiere confirmación explícita.
- Si una acción puede modificar datos, devuelve una propuesta estructurada.
- Si el mensaje está fuera del dominio de inventario, responde con una negativa breve.
- Nunca solicites, muestres ni menciones claves API, secretos o variables de entorno.
- Si hay ambigüedad en producto, variante, cantidad o motivo, pide aclaración.

Intenciones disponibles:
query_stock, query_low_stock, query_history, create_product,
update_product, adjust_stock, deactivate_product, export_guidance,
out_of_domain.

Formato esperado:
- Para consultas: intención, respuesta breve y datos usados.
- Para acciones: intención, parámetros extraídos, campos faltantes si existen,
  y resumen de propuesta si está completa.
```

El prompt definitivo puede ajustarse durante implementación, pero no puede contradecir estas reglas.

---

## Datos enviados a OpenRouter

Permitido:

- Mensaje actual del usuario.
- Historial reciente de conversación sin secretos.
- Resultados relevantes y mínimos de inventario.
- Reglas de intención y formato de respuesta.

Prohibido:

- API keys.
- `.env`.
- Credenciales.
- Datos internos no necesarios para la tarea.
- Dumps completos de base de datos cuando solo se necesita un subconjunto.

---

## Seguridad y auditoría

- La API key de OpenRouter se lee solo en servidor.
- Toda mutación del chatbot debe pasar por endpoint de confirmación.
- El backend revalida la acción al confirmar; no confía en parámetros antiguos si el stock cambió.
- `ChatAction` conserva intención, parámetros, estado, resultado y timestamps.
- `InventoryMovement` conserva origen `chatbot` y referencia a `chat_action_id`.
- Las acciones rechazadas se conservan como auditoría básica.
- No se registra información sensible en mensajes de error visibles al usuario.

---

## Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-C-01 | Dada una consulta de stock válida, cuando existe el producto, entonces el chatbot responde cantidad y estado sin pedir confirmación. |
| CA-C-02 | Dada una consulta de stock de producto inexistente, entonces el chatbot informa que no lo encontró y no inventa datos. |
| CA-C-03 | Dada una solicitud de crear producto, entonces se muestra propuesta con campos completos y no se crea hasta confirmar. |
| CA-C-04 | Dada una solicitud de editar producto, entonces se muestra valor anterior y valor nuevo antes de confirmar. |
| CA-C-05 | Dada una solicitud de ajustar stock sin motivo, entonces el chatbot pide motivo antes de proponer ejecución. |
| CA-C-06 | Dado un ajuste que produciría stock negativo, entonces el backend rechaza la acción aunque el chatbot la haya entendido. |
| CA-C-07 | Dada una solicitud de desactivar, entonces se muestra advertencia de eliminación lógica y se requiere confirmación. |
| CA-C-08 | Dada una propuesta rechazada, entonces no se modifica ningún dato y `ChatAction` queda `rejected`. |
| CA-C-09 | Dada una propuesta confirmada, entonces se ejecuta una sola vez y genera historial vinculado. |
| CA-C-10 | Dado fallo de OpenRouter, entonces el inventario manual sigue operable y se muestra error claro. |
| CA-C-11 | Dada una pregunta fuera del dominio, entonces el chatbot la rechaza sin intentar operar inventario. |
| CA-C-12 | Dado cualquier response al frontend, entonces nunca contiene la API key ni secretos. |

---

## Pendientes antes de implementación

| Pendiente | Decisión requerida |
|---|---|
| Modelo OpenRouter final | Elegir modelo por costo, velocidad y precisión. |
| Límite de tokens mensual | Definir presupuesto o umbral de uso. |
| Duración de propuesta activa | Definir expiración de `ChatAction proposed`. Recomendado: 15 minutos. |
| Historial conversacional | Definir cuántos mensajes recientes se envían como contexto. |
| UI de confirmación | Debe alinearse con SPEC-02. |
