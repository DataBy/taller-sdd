# PLAN-01 — Requisitos Funcionales

**Spec:** SPEC-01  
**Estado:** Pendiente  
**Dependencias:** PLAN-00 aprobado  
**Bloquea:** PLAN-02, PLAN-03, PLAN-04, PLAN-05

---

## Objetivo del plan

Validar, completar y cerrar la lista de requisitos funcionales y criterios de aceptación. Este plan produce una SPEC-01 estable que sirve como contrato entre diseño, datos y API.

---

## Fases

### Fase 1 — Revisión de requisitos por módulo

Revisar cada grupo de requisitos funcionales (RF-01 a RF-42) contra el Project Chart:

| Módulo | Revisión requerida |
|---|---|
| Dashboard | Confirmar qué métricas son esenciales para el MVP y cuáles son opcionales. |
| Inventario | Validar filtros y ordenamientos necesarios en v1.0. |
| Producto | Confirmar campos obligatorios vs opcionales del formulario. |
| Variantes | Confirmar si las variantes son JSON libre o por plantilla según decisión de PLAN-00. |
| Proveedores | Confirmar campos requeridos: nombre, teléfono, correo, dirección, notas. |
| Historial | Definir qué tipos de movimiento se registran en el MVP. |
| Importación | Confirmar encabezados exactos del CSV/Excel esperado. |
| Exportación | Confirmar columnas incluidas en cada formato. |
| Chatbot | Validar lista de intenciones soportadas en v1.0. |
| Configuración | Confirmar qué ajustes son configurables por el usuario en el MVP. |

### Fase 2 — Revisión de reglas de negocio

Para cada regla en SPEC-01:
- Confirmar que la regla es correcta y completa.
- Identificar casos límite no cubiertos.
- Agregar reglas faltantes si se detectan en la revisión.

Casos a revisar explícitamente:
- ¿Qué pasa si se importa un producto que ya existe? ¿Se actualiza o se rechaza?
- ¿El stock del producto padre se actualiza automáticamente cuando cambia una variante?
- ¿Un proveedor puede eliminarse si tiene productos asociados?
- ¿Las categorías pueden eliminarse si tienen productos?

### Fase 3 — Cierre de criterios de aceptación

Revisar los 10 criterios de aceptación de SPEC-01:
- Cada criterio debe estar en formato: **Dado / Cuando / Entonces**.
- Agregar criterios faltantes para los módulos no cubiertos (proveedores, configuración, exportación).
- Asegurar que cada criterio es testeable y verificable.

### Fase 4 — Validación contra constitución

Revisar que ningún requisito contradice los principios de la constitución:
- Stock negativo no permitido → validar que todos los RF de stock lo respetan.
- Historial obligatorio → verificar que todos los RF de mutación lo contemplan.
- Eliminación lógica → verificar que ningún RF usa borrado físico.
- Chatbot con confirmación → verificar RF-34 a RF-39.

### Fase 5 — Aprobación

- Revisar SPEC-01 completa con el responsable del proyecto.
- Marcar estado como **Aprobado**.
- Los módulos aprobados habilitan sus specs dependientes.

---

## Entregables del plan

- SPEC-01 actualizada con reglas de negocio cerradas.
- Lista completa de criterios de aceptación en formato Given/When/Then.
- Decisión documentada sobre variantes (flexibles vs plantilla).
- Decisión documentada sobre comportamiento de importación con duplicados.

---

## Criterio de salida

- Todos los RF del MVP tienen criterio de aceptación verificable.
- No quedan `[NEEDS CLARIFICATION]` sin respuesta.
- SPEC-01 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Requisitos ambiguos en chatbot. | Resolverlos antes de iniciar PLAN-05. |
| Variantes flexibles vs plantilla no decidido. | Bloquea diseño de SPEC-03. Escalar a PLAN-00. |
| Alcance crece durante revisión. | Documentar como "fase posterior" y no incluir en SPEC-01 del MVP. |
