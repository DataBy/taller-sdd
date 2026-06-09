# PLAN-05 — Chatbot IA con OpenRouter

**Spec:** SPEC-05  
**Estado:** Pendiente  
**Dependencias:** PLAN-01 aprobado, PLAN-04 aprobado, decisión de modelo OpenRouter  
**Bloquea:** PLAN-08 (implementación del chatbot)

---

## Objetivo del plan

Cerrar el diseño completo del chatbot: intenciones, system prompt, flujos de confirmación, manejo de errores y arquitectura proxy. Sin código; el resultado es un contrato de comportamiento que puede implementarse y probarse.

---

## Fases

### Fase 1 — Selección del modelo OpenRouter

Antes de diseñar el system prompt, confirmar:

| Decisión | Opciones | Criterio |
|---|---|---|
| Modelo | gpt-4o-mini, claude-haiku, llama-3, mistral, etc. | Costo por token, velocidad de respuesta, capacidad de seguir instrucciones complejas. |
| Temperatura | 0.1 – 0.4 | Baja para respuestas deterministas en acciones; más alta para consultas narrativas. |
| Max tokens por respuesta | 500 – 1000 | Suficiente para respuestas claras sin costo excesivo. |
| Presupuesto mensual estimado | Por definir | Depende del uso esperado de la app. |

### Fase 2 — Diseño del system prompt

El system prompt es la instrucción base que define el comportamiento del chatbot. Debe incluir:

**Secciones del system prompt:**

1. **Rol:** "Eres un asistente de inventario para una tienda de souvenirs. Tu dominio es exclusivamente el inventario: productos, variantes, stock, proveedores e historial de movimientos."

2. **Restricciones:**
   - Solo responder sobre inventario. Rechazar preguntas fuera del dominio.
   - Nunca ejecutar acciones sin confirmación explícita del usuario.
   - Nunca inventar datos. Si no encuentra el producto, decirlo claramente.
   - Responder siempre en español.

3. **Intenciones soportadas:**
   - Listar cada intención con ejemplos de trigger y comportamiento esperado.

4. **Formato de respuestas:**
   - Consultas: respuesta directa en texto o tabla.
   - Acciones propuestas: formato estructurado con todos los campos relevantes.
   - Confirmaciones: formato de tarjeta con antes/después.

5. **Datos de contexto:** El backend inyectará datos relevantes del inventario en cada llamada según la intención detectada.

### Fase 3 — Definición de intenciones

Para cada intención de SPEC-05, documentar:

#### query_stock
- **Trigger:** preguntas sobre disponibilidad, cantidad, stock.
- **Datos necesarios del backend:** consulta a productos/variantes filtrada.
- **Formato de respuesta:** tabla o lista con nombre, variante, stock actual, estado.
- **Sin confirmación.**

#### query_low_stock
- **Trigger:** "¿qué está por agotarse?", "stock bajo", "alertas".
- **Datos necesarios:** productos/variantes donde `stock_current ≤ stock_minimum`.
- **Formato:** lista con nombre, stock actual, mínimo, diferencia.
- **Sin confirmación.**

#### query_history
- **Trigger:** "¿qué pasó con...?", "historial de...", "movimientos de...".
- **Datos necesarios:** últimos N movimientos del producto/variante.
- **Formato:** timeline o tabla con fecha, tipo, cantidad, motivo.
- **Sin confirmación.**

#### create_product
- **Trigger:** "agrega", "crea", "nuevo producto".
- **Datos recolectados:** nombre, categoría, stock, precio, proveedor (opcionales si no se indican).
- **Si faltan datos obligatorios:** preguntar antes de proponer.
- **Propuesta:** tarjeta con todos los campos. Requiere confirmación.

#### update_product
- **Trigger:** "cambia", "actualiza", "modifica".
- **Datos:** campo a modificar, valor anterior (del backend), valor nuevo propuesto.
- **Propuesta:** tarjeta con campo, valor_anterior → valor_nuevo. Requiere confirmación.

#### adjust_stock
- **Trigger:** "entraron", "salieron", "ajusta stock", "recibí", "vendí".
- **Datos:** producto/variante, cantidad, tipo (entrada/salida/ajuste).
- **Siempre preguntar motivo si no se indicó.**
- **Propuesta:** stock_actual → stock_resultante + motivo. Requiere confirmación.

#### deactivate_product
- **Trigger:** "desactiva", "descontinúa", "da de baja".
- **Datos:** producto encontrado, stock actual.
- **Advertencia:** indicar que el producto dejará de aparecer en inventario activo pero se conserva el historial.
- **Requiere confirmación.**

#### export_guidance
- **Trigger:** "quiero exportar", "cómo exporto", "descargar inventario".
- **Comportamiento:** orientar al usuario a usar los filtros en la interfaz de exportación.
- **Sin confirmación.** No ejecuta exportación directamente.

### Fase 4 — Flujo de detección de intención

Definir cómo el backend procesa cada mensaje:

```
1. Recibir mensaje del usuario.
2. Enviar a OpenRouter con system prompt + historial + mensaje.
3. OpenRouter devuelve: intención detectada + parámetros extraídos.
4. Backend consulta la base de datos según intención y parámetros.
5. Si es consulta → construir respuesta con datos reales → devolver al frontend.
6. Si es acción → crear ChatAction con status: proposed → devolver propuesta al frontend.
7. Usuario confirma o rechaza desde el frontend.
8. Si confirma → backend ejecuta acción + registra InventoryMovement.
9. Si rechaza → ChatAction queda en status: rejected.
```

### Fase 5 — Manejo de errores del chatbot

| Error | Comportamiento |
|---|---|
| OpenRouter no responde (timeout) | Mensaje: "El asistente no está disponible. El inventario sigue funcionando normalmente." |
| Producto no encontrado | "No encontré el producto '[nombre]'. ¿Quisiste decir alguno de estos? [lista]" |
| Intención ambigua | Solicitar aclaración antes de proceder. |
| Acción rechazada por validación backend | Informar el motivo del rechazo al usuario. |
| Mensaje fuera del dominio | "Solo puedo ayudarte con consultas y acciones sobre el inventario." |

### Fase 6 — Revisión de seguridad del chatbot

Confirmar que el diseño cumple:
- API key solo en variables de entorno del servidor.
- El frontend nunca recibe ni almacena la API key.
- Toda acción de mutación pasa por confirmación del usuario.
- El backend valida independientemente (no confía solo en lo que dice el chatbot).
- El historial de conversación no almacena datos sensibles.

### Fase 7 — Aprobación

- Revisar flujos de chatbot con el responsable.
- Marcar SPEC-05 como **Aprobado**.

---

## Entregables del plan

- SPEC-05 actualizada con system prompt base documentado.
- Intenciones completas con datos de contexto, formato de respuesta y política de confirmación.
- Flujo de detección de intención cerrado.
- Modelo de OpenRouter seleccionado y documentado.
- Manejo de errores para cada escenario de fallo.

---

## Criterio de salida

- Todos los flujos de chatbot tienen comportamiento definido sin ambigüedad.
- El modelo y temperatura de OpenRouter están seleccionados.
- SPEC-05 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Modelo OpenRouter no sigue instrucciones con precisión. | Probar el system prompt en modo staging antes de implementar. |
| Intenciones mal detectadas generan acciones incorrectas. | Validar parámetros en backend antes de crear ChatAction. |
| Costo de OpenRouter supera presupuesto. | Definir límite de tokens y monitorear desde el inicio. |
| Usuario confirma sin leer la propuesta. | UI debe hacer la tarjeta de confirmación clara y visible. |
