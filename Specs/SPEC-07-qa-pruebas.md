# SPEC-07 - QA y Pruebas

**Estado:** Listo para revisión  
**Criterio de salida:** Checklist de pruebas y regresión aceptado  
**Fase:** 5  
**Feature relacionada:** `Specs/007-qa-pruebas/spec.md`

---

## Objetivo

Definir el contrato de calidad del MVP: qué se prueba, cuándo se prueba, cómo se reporta y qué condiciones deben cumplirse para considerar una funcionalidad como terminada.

Este documento cubre pruebas funcionales, validaciones de negocio, integración, UX, seguridad básica, chatbot, importación/exportación y regresión final.

---

## Alcance de QA

| Área | Cobertura |
|---|---|
| Dashboard | Métricas reales, stock bajo, agotados, últimos movimientos y estados vacíos. |
| Inventario | Listado, búsqueda, filtros, ordenamiento, detalle, edición y desactivación. |
| Productos | Creación, edición, validaciones, estado y eliminación lógica. |
| Variantes | Atributos flexibles, unicidad, stock, stock mínimo y estado. |
| Proveedores | Creación, edición, validación de correo y asociación a productos. |
| Historial | Movimientos por edición, stock, desactivación, importación y chatbot. |
| Importación | CSV/XLSX, previsualización, errores, advertencias, confirmación y cancelación. |
| Exportación | CSV, Excel, PDF y respeto de filtros activos. |
| Chatbot | Consultas, propuestas, confirmación, rechazo, auditoría y fallo de OpenRouter. |
| Configuración | Moneda, categorías y modelo IA. |
| Seguridad | API key, confirmación de mutaciones, stock negativo por API y batch de importación. |

Fuera de alcance de SPEC-07:

- Pruebas de carga avanzadas.
- Pentesting formal.
- Compatibilidad exhaustiva de navegadores.
- Automatización obligatoria de todos los casos desde el primer MVP.

---

## Definition of Done

| Tipo | Criterio |
|---|---|
| Funcional | Cumple criterios de aceptación de la spec relacionada. |
| Datos | Persiste correctamente, no rompe integridad y registra historial requerido. |
| Validación | Rechaza entradas inválidas en frontend cuando aplique y siempre en backend. |
| UX | Muestra estados vacío, cargando, error y éxito sin pantallas mudas. |
| Accesibilidad | Formularios tienen labels, foco visible y errores asociados. |
| IA | El chatbot no ejecuta acciones sin confirmación y backend revalida todo. |
| Seguridad | No expone secretos, no permite stock negativo, no aplica importaciones sin confirmar. |
| Documentación | Variables, importación/exportación y configuración quedan documentadas antes de entrega. |

Una funcionalidad no puede marcarse como "done" si falla un caso crítico de stock, historial, seguridad o confirmación del chatbot.

---

## Severidad de defectos

| Severidad | Definición | Ejemplos | Criterio de salida |
|---|---|---|---|
| Crítica | Rompe datos, seguridad o flujo principal. | Stock negativo, API key expuesta, chatbot muta sin confirmar. | Debe corregirse antes de continuar. |
| Alta | Bloquea un módulo importante. | No se puede crear producto, importación aplica filas erróneas. | Debe corregirse antes de entregar módulo. |
| Media | Afecta uso pero tiene alternativa. | Filtro incorrecto, error visual en estado vacío. | Debe corregirse antes de release. |
| Baja | Pulido o detalle menor. | Texto inconsistente, espaciado menor. | Puede diferirse si no afecta aceptación. |

---

## Matriz de cobertura

| Criterio | Casos |
|---|---|
| Producto válido queda activo | TC-P01 |
| Producto desactivado conserva historial | TC-P05, TC-H02 |
| Stock total suma variantes activas | TC-V05, TC-V06 |
| Stock bajo aparece cuando `stock <= mínimo` | TC-S01, TC-S02 |
| Ajuste registra before/after/motivo/fecha | TC-S04, TC-H04 |
| Búsqueda y filtros devuelven resultados correctos | TC-INV01, TC-INV02, TC-P07 |
| Importación no aplica sin confirmación | TC-I01, TC-I05, TC-I06 |
| Exportación respeta filtros activos | TC-E02, TC-E05 |
| Chatbot consulta sin confirmar | TC-C01 |
| Chatbot acción no muta sin confirmar | TC-C03, TC-C05, TC-C10 |
| Backend rechaza stock negativo | TC-SEC03 |
| API key no se expone | TC-SEC01 |

---

## Casos de prueba por módulo

### Dashboard

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-D01 | Cargar Dashboard con inventario vacío. | Muestra estado vacío y CTA para agregar producto. |
| TC-D02 | Cargar Dashboard con productos activos. | Métricas reflejan totales reales. |
| TC-D03 | Tener productos con stock bajo. | Se muestran alertas de stock bajo. |
| TC-D04 | Tener productos agotados. | Conteo de agotados coincide con datos. |
| TC-D05 | Registrar movimientos recientes. | Lista muestra los últimos movimientos ordenados por fecha. |

### Inventario

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-INV01 | Buscar por nombre de producto. | Solo aparecen productos coincidentes. |
| TC-INV02 | Filtrar por categoría y estado. | Solo aparecen productos que cumplen ambos filtros. |
| TC-INV03 | Filtrar por stock bajo. | Solo aparecen productos o variantes bajo umbral. |
| TC-INV04 | Ordenar por stock. | La tabla cambia el orden correctamente. |
| TC-INV05 | Búsqueda sin resultados. | Muestra mensaje de estado vacío de búsqueda. |
| TC-INV06 | Abrir detalle desde una fila. | Se muestra detalle con producto, variantes e historial. |

### Productos

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-P01 | Crear producto con campos válidos. | Producto activo visible en inventario. |
| TC-P02 | Crear producto sin nombre. | Error de campo requerido. |
| TC-P03 | Crear producto con precio negativo. | Error de validación. |
| TC-P04 | Editar nombre de producto activo. | Cambio guardado y movimiento tipo `edit`. |
| TC-P05 | Desactivar producto activo. | Estado cambia a `discontinued`; historial se conserva. |
| TC-P06 | Desactivar producto ya descontinuado. | No duplica movimiento o muestra mensaje informativo. |
| TC-P07 | Producto sin variantes. | Stock se maneja desde el producto. |
| TC-P08 | Producto con proveedor opcional vacío. | Producto se guarda si proveedor no es obligatorio. |

### Variantes

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-V01 | Crear variante con atributos únicos. | Variante creada y visible. |
| TC-V02 | Crear variante duplicada con mismos atributos. | Error de variante duplicada. |
| TC-V03 | Crear variante duplicada con mayúsculas distintas. | Error si atributos normalizados coinciden. |
| TC-V04 | Actualizar stock de variante a 0. | Variante queda `out_of_stock`. |
| TC-V05 | Todas las variantes quedan en 0. | Producto queda `out_of_stock`. |
| TC-V06 | Al menos una variante tiene stock > 0. | Producto permanece `active`. |
| TC-V07 | Guardar stock negativo. | Backend y UI rechazan el valor. |
| TC-V08 | SKU duplicado si se define como único. | Error claro de duplicado. |

### Stock y alertas

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-S01 | Stock actual igual a stock mínimo. | Se muestra alerta de stock bajo. |
| TC-S02 | Stock actual menor que stock mínimo. | Se muestra alerta de stock bajo. |
| TC-S03 | Stock actual mayor que stock mínimo. | No se muestra alerta. |
| TC-S04 | Ajuste de stock con motivo. | Movimiento registrado con before/after/delta/motivo/fecha. |
| TC-S05 | Ajuste de stock sin motivo. | Error: motivo requerido. |
| TC-S06 | Salida mayor al stock actual. | Rechazo por stock resultante negativo. |

### Proveedores

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-PR01 | Crear proveedor con nombre válido. | Proveedor disponible para asociar. |
| TC-PR02 | Crear proveedor sin nombre. | Error de campo requerido. |
| TC-PR03 | Crear proveedor con correo inválido. | Error de formato de correo. |
| TC-PR04 | Asociar proveedor a producto. | Producto muestra proveedor asociado. |
| TC-PR05 | Editar datos de proveedor. | Cambio visible sin romper productos asociados. |

### Configuración

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-CFG01 | Cambiar moneda del sistema. | Precios muestran nueva moneda. |
| TC-CFG02 | Cambiar modelo IA. | Configuración guarda el modelo seleccionado. |
| TC-CFG03 | Agregar categoría. | Categoría aparece disponible para productos. |
| TC-CFG04 | Desactivar categoría sin borrar datos. | Categoría deja de mostrarse como activa sin perder asociaciones históricas. |

### Historial

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-H01 | Editar campo relevante de producto. | Movimiento tipo `edit` con fecha. |
| TC-H02 | Desactivar producto. | Movimiento tipo `deactivation`. |
| TC-H03 | Importar productos. | Se genera `ImportBatch` y movimientos tipo `import`. |
| TC-H04 | Ajustar stock manualmente. | Movimiento incluye stock anterior, nuevo, delta y motivo. |
| TC-H05 | Acción chatbot confirmada. | Se genera `ChatAction` y movimientos vinculados. |
| TC-H06 | Acción chatbot rechazada. | `ChatAction` queda `rejected`; no hay movimiento de stock. |

### Importación

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-I01 | Cargar CSV válido. | Previsualización correcta, sin aplicar cambios. |
| TC-I02 | Cargar XLSX válido. | Previsualización correcta, sin aplicar cambios. |
| TC-I03 | Archivo con fila sin nombre. | Fila marcada como error. |
| TC-I04 | Archivo con stock negativo. | Fila marcada como error. |
| TC-I05 | Confirmar importación con errores. | Solo se aplican filas válidas si el flujo lo permite. |
| TC-I06 | Cancelar importación validada. | No se aplica ningún cambio. |
| TC-I07 | Archivo vacío. | Error global, sin previsualización. |
| TC-I08 | Formato no soportado. | Error global claro. |
| TC-I09 | Categoría desconocida. | Advertencia o flujo definido para crear/ignorar. |
| TC-I10 | Variante duplicada en archivo. | Advertencia o error según regla definida. |

### Exportación

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-E01 | Exportar inventario completo a CSV. | Archivo contiene todos los productos esperados. |
| TC-E02 | Exportar con filtro de categoría. | Archivo contiene solo la categoría filtrada. |
| TC-E03 | Exportar a Excel. | XLSX generado correctamente. |
| TC-E04 | Exportar a PDF. | PDF contiene encabezado, fecha, filtros y tabla. |
| TC-E05 | Exportar con filtros combinados. | Archivo respeta todos los filtros activos. |
| TC-E06 | Exportar inventario vacío. | Archivo con encabezados o aviso claro según diseño. |

### Chatbot

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-C01 | Consultar stock de producto existente. | Respuesta con cantidad actual, sin confirmación. |
| TC-C02 | Consultar producto inexistente. | Informa que no se encontró. |
| TC-C03 | Solicitar creación de producto. | Muestra propuesta; no crea hasta confirmar. |
| TC-C04 | Confirmar creación propuesta. | Producto creado y movimiento registrado. |
| TC-C05 | Rechazar creación propuesta. | No se crea nada. |
| TC-C06 | Solicitar ajuste de stock sin motivo. | Pide motivo antes de proponer. |
| TC-C07 | Confirmar ajuste de stock. | Stock cambia y movimiento queda vinculado a `ChatAction`. |
| TC-C08 | Solicitar desactivación. | Muestra advertencia y requiere confirmación. |
| TC-C09 | OpenRouter no disponible. | Error claro; inventario manual sigue operable. |
| TC-C10 | Confirmar dos veces la misma propuesta. | No duplica ejecución ni movimientos. |
| TC-C11 | Pregunta fuera del dominio. | Respuesta limitada al dominio de inventario. |
| TC-C12 | Consultar historial por chatbot. | Lista movimientos existentes. |

---

## Pruebas de seguridad básicas

| ID | Prueba | Criterio |
|---|---|---|
| TC-SEC01 | API key de OpenRouter. | No aparece en responses, frontend, bundle ni logs de cliente. |
| TC-SEC02 | Acción chatbot sin confirmación. | Backend rechaza cualquier mutación sin confirmación. |
| TC-SEC03 | Stock negativo por API directa. | Backend rechaza peticiones que resulten en stock < 0. |
| TC-SEC04 | Importación sin confirmar batch. | Backend no aplica cambios sin confirmación explícita. |
| TC-SEC05 | Producto descontinuado. | No se borra físicamente en operación normal. |
| TC-SEC06 | Mensajes de error. | No exponen stack traces, secretos ni detalles internos sensibles. |

---

## Pruebas de UX y accesibilidad

| ID | Caso | Resultado esperado |
|---|---|---|
| TC-UX01 | Navegar por sidebar. | Sección activa visible y navegación clara. |
| TC-UX02 | Formularios con teclado. | Se puede completar y cancelar sin mouse. |
| TC-UX03 | Modal de confirmación. | Foco queda dentro del modal y Escape/cancelar funcionan. |
| TC-UX04 | Error de campo. | Error aparece junto al campo y está asociado programáticamente. |
| TC-UX05 | Contraste de texto. | Cumple mínimo 4.5:1 en contenido principal. |
| TC-UX06 | Estado cargando. | Skeleton/spinner visible, sin pantalla en blanco. |
| TC-UX07 | Estado vacío. | Mensaje útil y CTA cuando aplique. |

---

## Casos límite

| Caso | Comportamiento esperado |
|---|---|
| Inventario completamente vacío. | Dashboard e inventario muestran estados vacíos. |
| Producto sin variantes. | Stock del producto se usa directamente. |
| Producto con 100+ variantes. | Vista carga sin degradación visible severa. |
| Importar archivo de 500 filas. | Previsualización responde en tiempo razonable. |
| Búsqueda sin resultados. | Mensaje claro sin romper filtros. |
| Exportar con todos los filtros activos. | Resultado respeta filtros combinados. |
| Stock llega exactamente al mínimo. | Se considera stock bajo. |
| Stock resultante negativo. | Se rechaza siempre. |
| Chatbot con mensaje largo. | No rompe layout; puede pedir reformulación. |
| OpenRouter falla. | Inventario manual sigue operable. |

---

## Proceso de QA

| Momento | Acción |
|---|---|
| Al terminar cada módulo | Ejecutar casos del módulo y registrar resultado. |
| Antes de integrar frontend/backend | Ejecutar pruebas de contrato API y validaciones backend. |
| Después de chatbot | Ejecutar TC-C y TC-SEC relacionados. |
| Después de import/export | Ejecutar TC-I, TC-E y seguridad de batch. |
| Antes de entrega | Ejecutar regresión final completa. |

---

## Formato de reporte de pruebas

| Campo | Descripción |
|---|---|
| ID | Caso ejecutado, por ejemplo `TC-P01`. |
| Fecha | Fecha de ejecución. |
| Build/commit | Referencia del código probado. |
| Resultado | Pasó, falló o bloqueado. |
| Evidencia | Captura, archivo generado, response o descripción concreta. |
| Observación | Detalle útil para reproducir. |
| Issue | Referencia al bug si aplica. |

---

## Checklist de regresión final

- [ ] Crear producto con variantes -> ver en inventario -> ajustar stock -> ver historial.
- [ ] Desactivar producto -> verificar que no aparece como activo -> historial conservado.
- [ ] Crear proveedor -> asociarlo a producto -> verificar en detalle e inventario.
- [ ] Importar CSV con filas válidas y errores -> confirmar válidas -> ver en inventario.
- [ ] Exportar inventario filtrado a CSV, Excel y PDF -> verificar contenido.
- [ ] Chatbot consulta stock -> responde sin confirmación.
- [ ] Chatbot propone ajuste -> usuario rechaza -> inventario no cambia.
- [ ] Chatbot propone ajuste -> usuario confirma -> stock e historial actualizados.
- [ ] Simular fallo OpenRouter -> inventario manual sigue operable.
- [ ] Verificar que API key no aparece en frontend ni responses.
- [ ] Ejecutar pruebas de stock negativo desde UI y API.

---

## Criterios de aceptación de QA

| ID | Criterio |
|---|---|
| CA-QA-01 | Todos los casos críticos pasan antes de entrega. |
| CA-QA-02 | Todo criterio de aceptación funcional tiene al menos un caso de prueba asociado. |
| CA-QA-03 | Ninguna mutación de stock queda sin `InventoryMovement`. |
| CA-QA-04 | Ninguna acción del chatbot se ejecuta sin confirmación explícita. |
| CA-QA-05 | Importaciones nunca se aplican sin previsualización y confirmación. |
| CA-QA-06 | Exportaciones respetan filtros activos. |
| CA-QA-07 | Errores principales muestran mensajes claros. |
| CA-QA-08 | No hay exposición de API keys o secretos en cliente. |

---

## Pendientes antes de implementación

| Pendiente | Decisión requerida |
|---|---|
| Herramienta de testing | Definir stack cuando se confirme implementación. |
| Automatización mínima | Decidir qué casos serán automatizados en MVP. |
| Datos seed para QA | Definir dataset de prueba con productos, variantes y proveedores. |
| Evidencia de PDF/Excel | Definir cómo se validarán archivos generados. |
