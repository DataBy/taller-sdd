# Feature Specification: Modelo de Datos Conceptual — Inventario Souvenirs

**Feature Branch**: `003-modelo-datos`

**Created**: 2026-06-09

**Status**: Draft

**Input**: Modelo conceptual de datos para la app de inventario de souvenirs: entidades, relaciones, reglas de integridad y ciclo de vida de estados.

> Este modelo es conceptual. No describe una implementación ni una migración específica. Es el contrato que define qué datos existen, qué reglas los gobiernan y cómo se relacionan entre sí.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Datos de un producto y sus variantes son siempre consistentes (Priority: P1)

Un operador crea un producto con variantes; el sistema garantiza que el stock total del producto siempre refleja la realidad de sus variantes y que ningún dato queda en estado incoherente.

**Why this priority**: La integridad del modelo de producto-variante es la base de todo el inventario. Si el stock calculado no es confiable, el resto de la app pierde sentido.

**Independent Test**: Crear un producto con 3 variantes, ajustar el stock de una de ellas y verificar que el stock total del producto se actualiza correctamente sin intervención manual.

**Acceptance Scenarios**:

1. **Given** un producto con variantes activas, **When** se consulta su stock total, **Then** el valor devuelto es la suma exacta del stock actual de todas sus variantes activas.
2. **Given** una variante cuyo stock llega a 0, **When** todas las variantes del producto tienen stock 0, **Then** el estado del producto cambia automáticamente a `out_of_stock`.
3. **Given** dos variantes con exactamente los mismos atributos para el mismo producto, **When** se intenta guardar la segunda, **Then** el sistema rechaza la operación con un error de unicidad.
4. **Given** cualquier campo de stock, **When** se intenta guardar un valor negativo, **Then** el sistema rechaza la operación sin aplicar el cambio.

---

### User Story 2 — Cada cambio de stock o estado queda registrado con trazabilidad completa (Priority: P1)

Un operador o auditor puede consultar el historial de cualquier producto o variante y ver exactamente qué cambió, cuándo, por qué y desde qué origen.

**Why this priority**: Sin trazabilidad no hay auditoría posible. El historial es el único mecanismo que permite confiar en los datos del inventario a lo largo del tiempo.

**Independent Test**: Ajustar el stock de una variante manualmente y luego via chatbot. Consultar el historial y verificar que ambos movimientos aparecen con su origen, cantidades antes/después y motivo.

**Acceptance Scenarios**:

1. **Given** un ajuste de stock aplicado, **When** se consulta el historial del producto, **Then** aparece un registro con: tipo de movimiento, stock anterior, stock nuevo, diferencia, motivo, origen y fecha.
2. **Given** una acción del chatbot confirmada, **When** se consulta el historial, **Then** el movimiento tiene origen `chatbot` y referencia al identificador de la acción de chatbot.
3. **Given** una importación confirmada, **When** se consulta el historial, **Then** cada producto importado tiene un movimiento con origen `import` y referencia al lote de importación.
4. **Given** un producto desactivado, **When** se consulta su historial, **Then** el historial conserva todos los movimientos anteriores a la desactivación.

---

### User Story 3 — Las importaciones se procesan como lotes auditables con estado propio (Priority: P2)

Un operador importa un archivo CSV; el sistema registra el lote completo con sus métricas (total, válidas, errores) y no aplica nada hasta recibir confirmación.

**Why this priority**: Los lotes de importación son la única forma de rastrear cargas masivas. Sin este registro, un error de importación no tiene evidencia para diagnóstico.

**Independent Test**: Importar un CSV de 20 filas (15 válidas, 5 con error), confirmar las 15 válidas y verificar que el lote queda registrado con estado `confirmed`, 15 filas válidas y 5 errores.

**Acceptance Scenarios**:

1. **Given** un archivo cargado en el sistema, **When** se procesa, **Then** se crea un lote con estado `pending`, total de filas, filas válidas, filas con error y detalle de errores por fila.
2. **Given** un lote en estado `pending`, **When** el operador confirma, **Then** el estado cambia a `confirmed`, se aplican los datos y se generan los movimientos de inventario correspondientes.
3. **Given** un lote en estado `pending`, **When** el operador cancela, **Then** el estado cambia a `cancelled` y ningún producto se crea ni modifica.

---

### User Story 4 — Las acciones del chatbot tienen ciclo de vida explícito antes de afectar el inventario (Priority: P2)

Toda propuesta de acción del chatbot (crear, editar, ajustar stock, desactivar) pasa por estados `proposed` → `confirmed`/`rejected` antes de generar cualquier movimiento.

**Why this priority**: El ciclo de vida de ChatAction es la garantía técnica de que ninguna acción del chatbot modifica datos sin aprobación explícita del usuario.

**Independent Test**: El chatbot propone un ajuste de stock. Se rechaza. El inventario no cambia. Se verifica que la ChatAction quedó en estado `rejected` y no existe movimiento de inventario vinculado.

**Acceptance Scenarios**:

1. **Given** una propuesta del chatbot, **When** se crea, **Then** la ChatAction tiene estado `proposed` y no existe ningún movimiento de inventario vinculado.
2. **Given** una ChatAction en estado `proposed`, **When** el usuario confirma, **Then** el estado cambia a `confirmed`, luego a `executed`, y se generan los movimientos de inventario.
3. **Given** una ChatAction en estado `proposed`, **When** el usuario rechaza, **Then** el estado cambia a `rejected` y no se genera ningún movimiento de inventario.

---

### User Story 5 — La configuración global de la app es un único registro editable (Priority: P3)

El sistema tiene una única configuración global (moneda, modelo de IA, umbral de stock bajo) que cualquier módulo puede consultar y que el operador puede actualizar desde la pantalla de configuración.

**Why this priority**: La configuración singleton simplifica la gestión y garantiza consistencia; no puede haber dos monedas activas al mismo tiempo.

**Independent Test**: Cambiar la moneda de USD a CRC desde configuración y verificar que el valor actualizado se refleja en toda la app sin necesidad de reiniciar.

**Acceptance Scenarios**:

1. **Given** la configuración de la app, **When** se consulta, **Then** existe exactamente un registro de configuración (singleton).
2. **Given** el campo de moneda en configuración, **When** el operador lo actualiza, **Then** el cambio se persiste y se refleja en la interfaz sin recargar la app.

---

### Edge Cases

- ¿Qué pasa con el stock del producto si se desactiva una variante que tenía stock > 0?
- ¿Puede un producto existir sin categoría asignada?
- ¿Qué ocurre si se importa un proveedor con el mismo nombre que uno ya existente?
- ¿Puede un movimiento de inventario no tener motivo? ¿Cuándo es obligatorio?
- ¿Qué pasa con los movimientos vinculados a un lote si ese lote se cancela?
- ¿Puede una ChatAction ejecutarse si el producto o variante fue desactivado entre la propuesta y la confirmación?
- ¿Qué sucede si se elimina una categoría que todavía tiene productos activos asociados?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Producto

- **FR-D-01**: El sistema DEBE garantizar que el stock de un producto nunca sea negativo.
- **FR-D-02**: El sistema DEBE calcular el stock total de un producto como la suma del stock de sus variantes activas cuando el producto tiene variantes.
- **FR-D-03**: El estado del producto DEBE actualizarse automáticamente: `active` si tiene stock, `out_of_stock` si stock = 0, `discontinued` solo por desactivación manual.
- **FR-D-04**: El producto DEBE conservar su historial completo independientemente de su estado actual.

#### Variante

- **FR-D-05**: El sistema DEBE rechazar la creación de dos variantes con exactamente los mismos atributos para el mismo producto.
- **FR-D-06**: El SKU de una variante DEBE ser único en todo el sistema si se proporciona.
- **FR-D-07**: El stock de una variante nunca puede ser negativo.
- **FR-D-08**: Una variante desactivada NO DEBE sumarse al stock total del producto.

#### Categoría

- **FR-D-09**: El nombre de categoría DEBE ser único en el sistema.
- **FR-D-10**: Las categorías iniciales (Llaveros, Imanes, Camisetas, Tazas, Artesanías, Pulseras) DEBEN existir como datos de arranque.
- **FR-D-11**: Una categoría desactivada no DEBE aparecer en los selectores de la interfaz, pero los productos ya asociados conservan su referencia.

#### Proveedor

- **FR-D-12**: El nombre del proveedor es requerido; el resto de campos son opcionales.
- **FR-D-13**: Si se proporciona correo electrónico del proveedor, DEBE tener formato válido.

#### Movimiento de inventario

- **FR-D-14**: Cada cambio de stock o estado relevante DEBE generar automáticamente un registro de movimiento.
- **FR-D-15**: Todo movimiento DEBE registrar: tipo, stock anterior, stock nuevo, diferencia, motivo (cuando aplica), origen y fecha.
- **FR-D-16**: El motivo DEBE ser obligatorio en movimientos de tipo ajuste y acciones del chatbot.
- **FR-D-17**: Los movimientos son inmutables: no se editan ni eliminan una vez creados.

#### Lote de importación

- **FR-D-18**: Cada importación DEBE generar un lote con estado inicial `pending`.
- **FR-D-19**: El lote DEBE registrar: nombre del archivo, tipo, total de filas, filas válidas, filas con error y detalle de errores.
- **FR-D-20**: Los datos solo se aplican al inventario cuando el lote pasa de `pending` a `confirmed`.
- **FR-D-21**: Un lote cancelado (`cancelled`) no genera movimientos de inventario.

#### Acción de chatbot

- **FR-D-22**: Toda acción propuesta por el chatbot DEBE crearse con estado `proposed`.
- **FR-D-23**: Los movimientos de inventario derivados de una acción del chatbot SOLO se generan cuando la acción pasa a estado `executed`.
- **FR-D-24**: Una acción rechazada (`rejected`) no genera ni modifica ningún dato del inventario.
- **FR-D-25**: Los parámetros y el resultado de cada acción DEBEN quedar registrados para auditoría.

#### Configuración

- **FR-D-26**: Existe exactamente un registro de configuración global (singleton) en todo momento.
- **FR-D-27**: La configuración DEBE incluir: moneda, modelo de IA activo y umbral global de stock bajo.

---

### Key Entities

- **Product**: Unidad básica del inventario. Tiene nombre, categoría, stock (calculado o directo), precios, proveedor, ubicación y estado. Punto de entrada de todos los movimientos.
- **Variant**: Sub-unidad de un producto con atributos propios. Tiene stock individual. La unicidad de atributos por producto es invariante.
- **Category**: Clasificador de productos. Nombre único. Tiene datos de arranque predefinidos.
- **Supplier**: Proveedor que puede estar asociado a múltiples productos. Solo el nombre es obligatorio.
- **InventoryMovement**: Registro inmutable de cada evento que afecta stock o estado. Trazabilidad completa con origen (manual / import / chatbot).
- **ImportBatch**: Agrupador de una importación masiva. Tiene ciclo de vida propio: pending → confirmed / cancelled.
- **ChatAction**: Propuesta del chatbot con ciclo de vida explícito: proposed → confirmed → executed / rejected. Garantiza que ninguna acción modifica datos sin aprobación.
- **AppSettings**: Singleton de configuración global. Una única fila en todo el sistema.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-01**: El 100% de los cambios de stock (manual, importación o chatbot) generan un movimiento de inventario con todos sus campos obligatorios.
- **SC-02**: Ninguna operación puede resultar en stock negativo; el sistema rechaza el 100% de los intentos.
- **SC-03**: Ninguna acción del chatbot modifica datos sin pasar por el estado `confirmed`; 0 excepciones.
- **SC-04**: Ninguna importación aplica datos sin lote en estado `confirmed`; 0 excepciones.
- **SC-05**: La unicidad de atributos por variante se cumple en el 100% de los casos; no existen variantes duplicadas.
- **SC-06**: El stock total de un producto con variantes es siempre igual a la suma de sus variantes activas; 0 discrepancias.
- **SC-07**: Existe exactamente un registro de AppSettings en todo momento; el sistema no permite crear un segundo.
- **SC-08**: Los registros de historial (InventoryMovement) son inmutables; no existe ningún mecanismo para editarlos o eliminarlos.

---

## Assumptions

- El modelo es independiente del motor de base de datos; aplica igual a SQLite (local) y PostgreSQL/Supabase (web). La decisión de motor se cierra en PLAN-00.
- Los identificadores pueden ser UUID o autoincremental entero según el motor elegido; el contrato conceptual no depende del tipo.
- Los atributos de variante (talla, color, etc.) se almacenan como pares clave-valor flexibles; no hay un esquema fijo de atributos.
- El campo `reason` (motivo) en InventoryMovement es obligatorio para ajustes y acciones del chatbot, pero opcional para entradas, salidas simples y movimientos de importación.
- La desactivación de una variante no borra su stock ni su historial; solo cambia su estado y la excluye del cálculo del total del producto.
- La configuración global es un singleton gestionado por semilla de datos inicial; no hay interfaz para crear un segundo registro.
- No se implementa soft-delete en Category ni Supplier en el MVP; se usa un campo `is_active` para ocultarlos de selectores sin borrarlos.
