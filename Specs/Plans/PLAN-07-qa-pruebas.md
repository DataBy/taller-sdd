# PLAN-07 — QA y Pruebas

**Spec:** SPEC-07  
**Estado:** Pendiente  
**Dependencias:** PLAN-01 a PLAN-06 aprobados  
**Bloquea:** PLAN-08 (implementación inicia con checklist de QA listo)

---

## Objetivo del plan

Completar y validar el plan de pruebas: revisar que los casos de prueba cubren todos los criterios de aceptación, agregar casos límite faltantes y preparar el checklist que se usará durante y después de la implementación.

---

## Fases

### Fase 1 — Revisión de cobertura de criterios de aceptación

Para cada criterio de aceptación de SPEC-01, verificar que existe al menos un caso de prueba en SPEC-07:

| Criterio (SPEC-01) | Caso de prueba (SPEC-07) |
|---|---|
| Producto válido → queda activo en inventario | TC-P01 |
| Producto desactivado → descontinuado, historial conservado | TC-P05 |
| Stock total = suma de variantes activas | TC-V05, TC-V06 |
| Stock bajo → alerta visible | TC-S01, TC-S02 |
| Ajuste de stock → movimiento con before/after/motivo/fecha | TC-S04, TC-H01 |
| Búsqueda por texto → resultados filtrados | TC-P07, TC-P08 |
| Importación con errores → no aplica sin confirmación | TC-I05, TC-I06 |
| Exportación respeta filtros | TC-E02 |
| Chatbot consulta → respuesta sin confirmación | TC-C01 |
| Chatbot acción → no modifica sin confirmación | TC-C03, TC-C05 |

Identificar criterios sin cobertura y agregar casos faltantes.

### Fase 2 — Casos faltantes a agregar

Revisar qué módulos no tienen cobertura suficiente en SPEC-07:

| Módulo | Casos a agregar |
|---|---|
| Proveedores | Crear proveedor válido, crear con correo inválido, asociar a producto. |
| Configuración | Cambiar moneda, cambiar modelo IA, agregar categoría. |
| Dashboard | Verificar que métricas reflejan datos reales, estado vacío sin productos. |
| Exportación PDF | Verificar encabezado, filtros visibles y tabla correcta en el archivo. |
| Chatbot — historial | Consultar historial de un producto con movimientos. |
| Chatbot — update_product | Proponer cambio de campo, confirmar, verificar cambio aplicado. |

### Fase 3 — Revisión de casos límite

Revisar que los casos límite de SPEC-07 cubren los escenarios más propensos a errores:

| Caso límite | Verificación |
|---|---|
| Inventario completamente vacío | Dashboard y listado muestran estado vacío amigable. |
| Producto sin variantes | Stock editable directamente en el producto. |
| Variante con SKU duplicado | Error claro en creación y en importación. |
| Importar archivo vacío | Error global, sin previsualización. |
| Exportar con todos los filtros activos | Solo exporta lo que corresponde. |
| Chatbot: pregunta fuera del dominio | Respuesta acotada al dominio del inventario. |
| Stock llega exactamente a stock mínimo | Alerta aparece en ese momento. |
| Dos variantes con mismos atributos distintas mayúsculas | Validar que la comparación es case-insensitive. |

### Fase 4 — Definición del proceso de QA

Definir cómo se ejecutarán las pruebas durante la implementación:

| Tipo de prueba | Cuándo | Responsable |
|---|---|---|
| Pruebas por feature | Al terminar cada módulo (TC por módulo). | Quien implementa. |
| Prueba de integración | Después de implementar todos los módulos. | Revisor. |
| Regresión final | Antes de marcar SPEC-09 como Aprobado. | Todo el equipo. |
| Pruebas de seguridad | Después de implementar el chatbot y la API. | Revisor técnico. |

### Fase 5 — Formato del reporte de pruebas

Definir qué información se registra para cada caso de prueba ejecutado:

| Campo | Descripción |
|---|---|
| ID del caso | TC-P01, TC-V02, etc. |
| Fecha de ejecución | Fecha en que se probó. |
| Resultado | Pasó / Falló / Bloqueado. |
| Evidencia | Descripción del comportamiento observado. |
| Issue relacionado | Referencia al bug si aplica. |

### Fase 6 — Checklist de regresión final

Revisar y completar el checklist de SPEC-09 (regresión final) con los flujos de extremo a extremo:

- Flujo completo: crear producto → variante → ajustar stock → ver historial.
- Flujo de desactivación: desactivar → verificar en inventario → historial conservado.
- Flujo de importación: cargar → previsualizar → confirmar → ver en inventario.
- Flujo de exportación: filtrar → exportar PDF → verificar contenido.
- Flujo de chatbot: consulta → acción → confirmación → movimiento registrado.
- Resiliencia: simular fallo de OpenRouter → inventario sigue operable.

### Fase 7 — Aprobación

- Revisar SPEC-07 completa con el responsable.
- Confirmar que todos los criterios de aceptación tienen cobertura.
- Marcar SPEC-07 como **Aprobado**.

---

## Entregables del plan

- SPEC-07 actualizada con casos de prueba faltantes agregados.
- Cobertura completa de todos los criterios de aceptación de SPEC-01.
- Proceso de QA definido (cuándo, quién, qué se registra).
- Checklist de regresión final completo.

---

## Criterio de salida

- Todos los criterios de aceptación de SPEC-01 tienen al menos un caso de prueba.
- Los casos límite y pruebas de seguridad están documentados.
- SPEC-07 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Casos de prueba muy generales no detectan bugs reales. | Asegurar que cada caso tiene entrada, acción y resultado esperado específicos. |
| QA se deja para el final. | Ejecutar pruebas por módulo durante la implementación (Fase A–F de PLAN-08). |
| Comportamiento del chatbot difícil de probar. | Preparar prompts de prueba predefinidos para cada intención. |
