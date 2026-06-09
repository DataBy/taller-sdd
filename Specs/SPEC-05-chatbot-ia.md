# SPEC-05 — Chatbot IA con OpenRouter

**Estado:** Pendiente  
**Criterio de salida:** Flujos de chatbot aceptados  
**Fase:** 4

---

## Propósito

El chatbot es un asistente operativo del inventario. Su dominio es el stock y la administración del catálogo. Todas las operaciones que modifiquen datos requieren confirmación explícita del usuario. La API key de OpenRouter nunca se expone en el frontend.

---

## Arquitectura de integración

```
Frontend ──► Backend (proxy seguro) ──► OpenRouter API
                   │
                   ▼
              Base de datos
              (lectura/escritura)
```

- El frontend solo llama a `/api/v1/chat/message`.
- El backend interpreta la intención, consulta la base de datos y llama a OpenRouter.
- La API key vive en variables de entorno del servidor.

---

## Intenciones soportadas

| Intención | Trigger de ejemplo | Tipo |
|---|---|---|
| `query_stock` | "¿Cuántas tazas hay?" | Consulta |
| `query_low_stock` | "¿Qué productos están por agotarse?" | Consulta |
| `query_history` | "¿Qué pasó con el imán Volcán?" | Consulta |
| `create_product` | "Agrega un nuevo llavero de volcán" | Acción |
| `update_product` | "Cambia el precio de venta del imán a 5000" | Acción |
| `adjust_stock` | "Entraron 20 tazas de cerámica talla M" | Acción |
| `deactivate_product` | "Desactiva el imán Volcán Arenal" | Acción |
| `export_guidance` | "Quiero exportar solo los llaveros" | Orientación |

---

## Política de confirmación

| Tipo de acción | Regla |
|---|---|
| Consulta | No requiere confirmación. Respuesta directa. |
| Creación | Requiere confirmación mostrando todos los campos que se crearán. |
| Actualización | Requiere mostrar valor anterior y valor nuevo antes de confirmar. |
| Ajuste de stock | Requiere motivo del movimiento y confirmación. |
| Desactivación | Requiere advertencia explícita y confirmación. |
| Importación | Requiere previsualización, validación y confirmación separada. |

---

## Flujos detallados

### Consulta de stock
```
Usuario: "¿Cuántas camisetas talla M hay?"
Chatbot: "Hay 12 camisetas talla M activas. Stock mínimo: 5. Estado: OK."
```

### Detección de stock bajo
```
Usuario: "¿Qué productos están por agotarse?"
Chatbot: Lista de productos/variantes donde stock_current ≤ stock_minimum.
```

### Crear producto
```
Usuario: "Agrega pulsera de cuero negra, precio de venta 3500, stock 30."
Chatbot: "Voy a crear el siguiente producto:
  - Nombre: Pulsera de cuero negra
  - Categoría: Pulseras
  - Precio de venta: 3500
  - Stock inicial: 30
  ¿Confirmas la creación?"
Usuario: "Sí" → Backend ejecuta creación y registra movimiento.
```

### Actualizar campo
```
Usuario: "Cambia el stock mínimo del imán Costa Rica a 10."
Chatbot: "Imán Costa Rica — stock mínimo actual: 5.
  Nuevo valor propuesto: 10.
  ¿Confirmas el cambio?"
Usuario: "Sí" → Backend actualiza y registra historial.
```

### Ajuste de stock
```
Usuario: "Entraron 50 llaveros de volcán."
Chatbot: "Llavero Volcán — stock actual: 20.
  Movimiento: +50 (entrada).
  Stock resultante: 70.
  Motivo: [requerido] ¿Cuál es el motivo de esta entrada?"
Usuario: "Reposición de proveedor"
Chatbot: "¿Confirmas el ajuste?"
Usuario: "Sí" → Backend registra movimiento de entrada.
```

### Desactivar producto
```
Usuario: "Desactiva el imán Volcán Arenal."
Chatbot: "Encontré el producto activo con stock 12.
  Esto no borrará el historial, pero lo ocultará de la vista principal.
  ¿Confirmas la desactivación?"
Usuario: "Sí" → Backend cambia status a discontinued y registra movimiento.
```

---

## Límites y restricciones del chatbot

| Límite | Descripción |
|---|---|
| Solo inventario | El chatbot no responde preguntas fuera del dominio del inventario. |
| Sin ejecución directa | Ninguna acción se ejecuta sin el paso de confirmación del usuario. |
| Validación en backend | El backend valida todas las acciones antes de persistir, independientemente de lo que diga el chatbot. |
| Sin API key en frontend | Nunca. La clave de OpenRouter vive solo en el servidor. |
| Ambigüedad | Si el chatbot no puede identificar el producto con certeza, pregunta antes de proponer acción. |
| Fallo de OpenRouter | Si OpenRouter no responde, el sistema devuelve mensaje de error claro. El inventario sigue operable manualmente. |

---

## Datos de contexto enviados a OpenRouter

El backend construye el contexto para cada llamada incluyendo:

- Instrucciones del sistema (system prompt) con reglas del dominio.
- Historial reciente de la conversación.
- Datos relevantes del inventario consultados en la base de datos según la intención detectada.
- Nunca se envían credenciales ni datos sensibles en el contexto.

---

## Modelo de OpenRouter

- **Modelo:** [PENDIENTE — definir modelo y presupuesto antes de implementar]
- **Temperatura:** Baja (0.2–0.4) para respuestas precisas y deterministas en acciones.
- **Idioma de respuesta:** Español.

---

## ChatAction — registro de acciones

Toda acción propuesta por el chatbot genera un registro `ChatAction`:

| Campo | Valor |
|---|---|
| intent | Intención detectada |
| parameters | Parámetros extraídos del mensaje |
| status | `proposed` → `confirmed` o `rejected` → `executed` |
| result | Resultado de la ejecución (si fue confirmada) |

Si el usuario confirma, la acción se ejecuta y se generan los `InventoryMovement` correspondientes vinculados al `ChatAction`.
