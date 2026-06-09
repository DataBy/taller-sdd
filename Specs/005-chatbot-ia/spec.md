# Feature Specification: Chatbot IA con OpenRouter - Inventario Souvenirs

**Feature Branch**: `005-chatbot-ia`  
**Created**: 2026-06-09  
**Status**: Ready for Review  
**Input**: Chatbot operativo para consultas y acciones confirmadas sobre inventario.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar stock en lenguaje natural (Priority: P1)

Un operador pregunta por la cantidad disponible de productos o variantes sin navegar manualmente el inventario.

**Why this priority**: Las consultas de stock son el uso más frecuente y de menor riesgo del chatbot.

**Independent Test**: Preguntar "¿Cuántas camisetas talla M hay?" y verificar que la respuesta coincide con el inventario.

**Acceptance Scenarios**:

1. **Given** un producto existente, **When** el operador pregunta por su stock, **Then** el chatbot responde con cantidad, variante si aplica y estado.
2. **Given** múltiples coincidencias, **When** el operador pregunta por un nombre ambiguo, **Then** el chatbot pide precisión antes de responder.
3. **Given** un producto inexistente, **When** el operador pregunta por stock, **Then** el chatbot indica que no lo encontró.

---

### User Story 2 - Detectar productos con stock bajo (Priority: P1)

Un operador pide al chatbot listar productos o variantes próximos a agotarse.

**Why this priority**: Ayuda a priorizar reposición y reduce revisión manual.

**Independent Test**: Crear productos con `stock_current <= stock_minimum` y pedir "¿Qué está por agotarse?"

**Acceptance Scenarios**:

1. **Given** productos con stock bajo, **When** el operador consulta alertas, **Then** el chatbot lista nombre, stock actual y stock mínimo.
2. **Given** no hay stock bajo, **When** el operador consulta alertas, **Then** el chatbot informa que no hay productos por debajo del umbral.

---

### User Story 3 - Proponer acciones sin ejecutarlas automáticamente (Priority: P1)

Un operador solicita crear, editar, ajustar stock o desactivar un producto, y el chatbot prepara una propuesta clara sin modificar datos.

**Why this priority**: Es la regla central de seguridad del chatbot.

**Independent Test**: Pedir "Entraron 20 tazas" y verificar que no cambia stock hasta confirmar.

**Acceptance Scenarios**:

1. **Given** una solicitud de ajuste de stock, **When** falta motivo, **Then** el chatbot pide motivo antes de proponer.
2. **Given** una solicitud completa de ajuste, **When** el chatbot responde, **Then** muestra stock anterior, delta, stock final y motivo.
3. **Given** una propuesta no confirmada, **When** se consulta el inventario, **Then** ningún dato cambió.

---

### User Story 4 - Confirmar o rechazar acciones propuestas (Priority: P1)

Un operador revisa una propuesta del chatbot y decide confirmarla o rechazarla.

**Why this priority**: La confirmación explícita es obligatoria para evitar cambios accidentales.

**Independent Test**: Solicitar una creación, rechazarla y verificar que no se creó producto.

**Acceptance Scenarios**:

1. **Given** una propuesta activa, **When** el operador confirma, **Then** el backend revalida, ejecuta y registra historial.
2. **Given** una propuesta activa, **When** el operador rechaza, **Then** no se modifica ningún dato.
3. **Given** una propuesta ya ejecutada, **When** se intenta confirmar de nuevo, **Then** el backend no duplica la acción.

---

### User Story 5 - Ver historial mediante chatbot (Priority: P2)

Un operador pregunta qué ocurrió con un producto o variante.

**Why this priority**: Facilita auditoría sin buscar manualmente movimientos.

**Independent Test**: Ajustar stock de un producto y preguntar "¿Qué pasó con este producto?"

**Acceptance Scenarios**:

1. **Given** movimientos existentes, **When** el operador consulta historial, **Then** el chatbot lista fecha, tipo, delta, motivo y origen.
2. **Given** sin movimientos, **When** el operador consulta historial, **Then** el chatbot informa que no hay movimientos registrados.

---

### User Story 6 - Manejar fallos y preguntas fuera del dominio (Priority: P2)

El chatbot debe fallar de forma clara sin bloquear el inventario.

**Why this priority**: OpenRouter es una dependencia externa; el sistema principal debe seguir operando.

**Independent Test**: Simular timeout de OpenRouter y verificar que la UI muestra error claro.

**Acceptance Scenarios**:

1. **Given** OpenRouter no responde, **When** el operador envía mensaje, **Then** se muestra error claro y no se crea acción.
2. **Given** una pregunta fuera de inventario, **When** el operador la envía, **Then** el chatbot responde que solo ayuda con inventario.
3. **Given** un ajuste que dejaría stock negativo, **When** se confirma, **Then** el backend rechaza la ejecución.

---

## Edge Cases

- Producto ambiguo con varios resultados.
- Variante obligatoria no especificada.
- Motivo faltante en ajuste de stock.
- Acción confirmada dos veces.
- Stock cambió entre propuesta y confirmación.
- Propuesta expirada.
- OpenRouter devuelve JSON inválido.
- Usuario pide revelar API key o configuración secreta.
- Mensaje demasiado largo.
- Pregunta fuera del dominio.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Integración y seguridad

- **FR-C-01**: El frontend DEBE comunicarse solo con endpoints backend del chatbot.
- **FR-C-02**: La API key de OpenRouter NUNCA DEBE enviarse al frontend.
- **FR-C-03**: El backend DEBE leer la API key desde variables de entorno o configuración segura.
- **FR-C-04**: El chatbot DEBE responder siempre en español.
- **FR-C-05**: El chatbot DEBE rechazar preguntas fuera del dominio de inventario.

#### Intenciones de consulta

- **FR-C-06**: El chatbot DEBE consultar stock por producto, variante, categoría, proveedor o ubicación.
- **FR-C-07**: El chatbot DEBE listar productos y variantes con stock bajo.
- **FR-C-08**: El chatbot DEBE mostrar historial de movimientos por producto o variante.
- **FR-C-09**: Las consultas NO DEBEN requerir confirmación ni modificar datos.

#### Acciones propuestas

- **FR-C-10**: El chatbot DEBE proponer creación de producto sin ejecutarla automáticamente.
- **FR-C-11**: El chatbot DEBE proponer edición mostrando valor anterior y nuevo.
- **FR-C-12**: El chatbot DEBE proponer ajustes de stock mostrando stock anterior, delta, stock final y motivo.
- **FR-C-13**: El chatbot DEBE proponer desactivación con advertencia de eliminación lógica.
- **FR-C-14**: Toda acción propuesta DEBE crear un `ChatAction` con estado `proposed`.

#### Confirmación y ejecución

- **FR-C-15**: Ninguna acción de mutación DEBE ejecutarse sin confirmación explícita.
- **FR-C-16**: Confirmar una acción DEBE revalidar reglas de negocio en backend.
- **FR-C-17**: Rechazar una acción DEBE dejar el inventario sin cambios.
- **FR-C-18**: Una acción ya ejecutada NO DEBE poder ejecutarse otra vez.
- **FR-C-19**: Toda acción ejecutada DEBE registrar `InventoryMovement` con origen `chatbot`.

#### Validación y errores

- **FR-C-20**: El backend DEBE rechazar cualquier acción que produzca stock negativo.
- **FR-C-21**: Si falta información obligatoria, el chatbot DEBE pedir aclaración antes de proponer.
- **FR-C-22**: Si OpenRouter falla, el sistema DEBE mostrar error claro y mantener inventario manual operable.
- **FR-C-23**: Si OpenRouter devuelve formato inválido, el backend DEBE manejarlo sin exponer detalles técnicos.
- **FR-C-24**: El chatbot NO DEBE inventar productos, cantidades ni historial.

#### Auditoría

- **FR-C-25**: `ChatAction` DEBE conservar intención, parámetros, estado, resultado y fechas.
- **FR-C-26**: Acciones rechazadas DEBEN conservarse para auditoría básica.
- **FR-C-27**: Movimientos generados por chatbot DEBEN vincularse a `chat_action_id`.
- **FR-C-28**: El historial visible NO DEBE mostrar secretos ni variables de entorno.

---

### Key Entities

- **ChatMessage**: Mensaje enviado por usuario o asistente en la conversación.
- **ChatAction**: Acción propuesta por el chatbot con ciclo de vida `proposed`, `confirmed`, `executed`, `rejected` o `failed`.
- **Intent**: Clasificación del mensaje: consulta, acción, orientación o fuera de dominio.
- **ActionProposal**: Resumen visual y estructurado que se muestra antes de confirmar.
- **InventoryMovement**: Registro auditable generado al ejecutar una acción confirmada.
- **OpenRouterRequest**: Llamada server-side al proveedor IA con contexto mínimo y seguro.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-C-01**: El 100% de acciones de mutación requieren confirmación explícita antes de ejecutarse.
- **SC-C-02**: El 100% de ajustes de stock por chatbot generan `InventoryMovement`.
- **SC-C-03**: El sistema rechaza el 100% de ajustes que producirían stock negativo.
- **SC-C-04**: Consultas de stock responden en menos de 5 segundos cuando OpenRouter está disponible.
- **SC-C-05**: Si OpenRouter falla, el inventario manual permanece operable.
- **SC-C-06**: Ninguna respuesta del frontend contiene API keys o secretos.
- **SC-C-07**: Una acción confirmada dos veces no produce duplicados.
- **SC-C-08**: Preguntas fuera del dominio se rechazan sin crear acciones.

---

## Assumptions

- El chatbot usa OpenRouter únicamente desde backend.
- El modelo final se define antes de implementar.
- La temperatura debe mantenerse baja para reducir variabilidad.
- La UI de confirmación sigue lo definido en SPEC-02.
- La validación de negocio se implementa en backend aunque el chatbot detecte correctamente la intención.
- El chatbot no ejecuta exportaciones directamente en el MVP; solo guía al usuario.
