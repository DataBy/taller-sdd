# Feature Specification: QA y Pruebas - Inventario Souvenirs

**Feature Branch**: `007-qa-pruebas`  
**Created**: 2026-06-09  
**Status**: Ready for Review  
**Input**: Checklist de pruebas funcionales, regresión, seguridad y calidad para el MVP.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validar flujos principales de inventario (Priority: P1)

Un responsable de QA necesita verificar que productos, variantes, stock e historial funcionan de extremo a extremo.

**Why this priority**: El inventario es el núcleo del sistema; errores aquí comprometen datos reales.

**Independent Test**: Crear producto con variante, ajustar stock y verificar historial.

**Acceptance Scenarios**:

1. **Given** datos válidos de producto, **When** se crea, **Then** aparece activo en inventario.
2. **Given** un producto con variantes, **When** cambia stock de una variante, **Then** el stock total se recalcula.
3. **Given** un ajuste de stock, **When** se confirma, **Then** queda registrado en historial.

---

### User Story 2 - Validar importación y exportación (Priority: P1)

Un responsable de QA necesita verificar que los datos entran y salen sin romper reglas de negocio.

**Why this priority**: Import/export puede modificar o exponer muchos datos en una sola acción.

**Independent Test**: Importar CSV con filas válidas e inválidas, confirmar válidas y exportar con filtros.

**Acceptance Scenarios**:

1. **Given** un archivo con errores, **When** se previsualiza, **Then** no se aplica ningún cambio automáticamente.
2. **Given** filas válidas, **When** se confirma importación, **Then** solo se aplican las filas permitidas.
3. **Given** filtros activos, **When** se exporta, **Then** el archivo respeta esos filtros.

---

### User Story 3 - Validar seguridad de reglas críticas (Priority: P1)

Un responsable técnico necesita confirmar que el backend impide estados inválidos aunque se llame directamente a la API.

**Why this priority**: Las validaciones frontend no son suficientes para proteger datos.

**Independent Test**: Enviar una petición directa que deje stock negativo y verificar rechazo.

**Acceptance Scenarios**:

1. **Given** una petición con stock negativo, **When** llega al backend, **Then** se rechaza.
2. **Given** una acción del chatbot sin confirmación, **When** intenta ejecutarse, **Then** se rechaza.
3. **Given** una importación sin batch confirmado, **When** intenta aplicarse, **Then** se rechaza.

---

### User Story 4 - Validar chatbot y confirmaciones (Priority: P1)

Un responsable de QA necesita verificar que el chatbot consulta datos y propone acciones sin ejecutarlas directamente.

**Why this priority**: El chatbot es un punto de alto riesgo porque combina lenguaje natural y mutaciones.

**Independent Test**: Pedir ajuste de stock, rechazarlo, confirmar que inventario no cambió; repetir y confirmar.

**Acceptance Scenarios**:

1. **Given** consulta de stock, **When** el chatbot responde, **Then** no pide confirmación ni modifica datos.
2. **Given** acción propuesta, **When** el usuario rechaza, **Then** no cambia inventario.
3. **Given** acción propuesta, **When** el usuario confirma, **Then** backend revalida, ejecuta y registra historial.

---

### User Story 5 - Validar UX, errores y accesibilidad mínima (Priority: P2)

Un responsable de QA necesita asegurar que la app no muestra pantallas mudas y que los flujos se pueden operar con claridad.

**Why this priority**: Una app funcional pero confusa genera errores operativos.

**Independent Test**: Navegar formularios con teclado y provocar errores de validación.

**Acceptance Scenarios**:

1. **Given** pantalla sin datos, **When** carga, **Then** muestra estado vacío con mensaje útil.
2. **Given** error de campo, **When** ocurre, **Then** aparece junto al campo afectado.
3. **Given** un modal, **When** se navega con teclado, **Then** el foco permanece controlado.

---

## Edge Cases

- Inventario vacío.
- Producto sin variantes.
- Producto con muchas variantes.
- Duplicados de variantes con mayúsculas/minúsculas distintas.
- Stock exactamente igual al mínimo.
- Archivo vacío o formato no soportado.
- Exportación con filtros combinados.
- OpenRouter no disponible.
- Acción chatbot confirmada dos veces.
- API key expuesta accidentalmente.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Cobertura y proceso

- **FR-QA-01**: Cada criterio de aceptación del MVP DEBE tener al menos un caso de prueba asociado.
- **FR-QA-02**: Cada caso de prueba DEBE tener ID, acción y resultado esperado.
- **FR-QA-03**: El proceso de QA DEBE registrar resultado, evidencia y commit/build probado.
- **FR-QA-04**: Los casos críticos DEBEN ejecutarse antes de entrega.

#### Pruebas funcionales

- **FR-QA-05**: QA DEBE cubrir creación, edición, búsqueda, filtrado y desactivación de productos.
- **FR-QA-06**: QA DEBE cubrir creación, duplicados y stock de variantes.
- **FR-QA-07**: QA DEBE cubrir proveedores y configuración.
- **FR-QA-08**: QA DEBE cubrir historial para toda mutación relevante.
- **FR-QA-09**: QA DEBE cubrir dashboard y estados vacíos.

#### Import/export

- **FR-QA-10**: QA DEBE validar importación CSV y XLSX.
- **FR-QA-11**: QA DEBE validar errores y advertencias de importación.
- **FR-QA-12**: QA DEBE validar que importación no aplica sin confirmación.
- **FR-QA-13**: QA DEBE validar exportación CSV, Excel y PDF.
- **FR-QA-14**: QA DEBE validar que exportación respeta filtros activos.

#### Chatbot

- **FR-QA-15**: QA DEBE validar consultas del chatbot sin confirmación.
- **FR-QA-16**: QA DEBE validar propuestas del chatbot sin mutación automática.
- **FR-QA-17**: QA DEBE validar confirmación y rechazo de acciones.
- **FR-QA-18**: QA DEBE validar fallo de OpenRouter.
- **FR-QA-19**: QA DEBE validar preguntas fuera del dominio.

#### Seguridad y datos

- **FR-QA-20**: QA DEBE validar que stock negativo se rechaza desde UI y API.
- **FR-QA-21**: QA DEBE validar que API key no aparece en frontend ni responses.
- **FR-QA-22**: QA DEBE validar eliminación lógica y conservación de historial.
- **FR-QA-23**: QA DEBE validar que no hay mutaciones silenciosas.

#### UX y accesibilidad

- **FR-QA-24**: QA DEBE validar estados vacío, cargando, error y éxito.
- **FR-QA-25**: QA DEBE validar labels y errores inline en formularios.
- **FR-QA-26**: QA DEBE validar navegación por teclado en formularios y modales.
- **FR-QA-27**: QA DEBE validar contraste mínimo en contenido principal.

---

### Key Entities

- **TestCase**: Caso con ID, módulo, precondición, acción y resultado esperado.
- **TestRun**: Ejecución de casos sobre un build o commit específico.
- **Defect**: Hallazgo con severidad, evidencia y pasos de reproducción.
- **RegressionChecklist**: Lista de flujos end-to-end obligatorios antes de entrega.
- **Evidence**: Captura, archivo generado, response o descripción verificable.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-QA-01**: 100% de casos críticos pasan antes de entrega.
- **SC-QA-02**: 100% de mutaciones de stock probadas generan historial.
- **SC-QA-03**: 100% de acciones chatbot probadas requieren confirmación.
- **SC-QA-04**: 100% de importaciones probadas requieren previsualización y confirmación.
- **SC-QA-05**: 100% de formatos de exportación requeridos generan archivo válido.
- **SC-QA-06**: 0 respuestas frontend contienen API keys o secretos.
- **SC-QA-07**: 0 flujos principales quedan bloqueados por estados vacíos o errores sin mensaje.
- **SC-QA-08**: La regresión final completa se ejecuta y queda registrada.

---

## Assumptions

- La automatización de pruebas se definirá cuando exista stack técnico confirmado.
- El MVP puede iniciar con ejecución manual documentada de casos críticos.
- Los casos de seguridad básicos son obligatorios aunque no haya login.
- Las pruebas de chatbot deben usar prompts predefinidos para reducir ambigüedad.
- La validación final se hará contra la rama/build candidata a entrega.
