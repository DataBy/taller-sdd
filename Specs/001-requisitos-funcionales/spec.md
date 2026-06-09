# Feature Specification: Requisitos Funcionales — Inventario Souvenirs

**Feature Branch**: `001-requisitos-funcionales`

**Created**: 2026-06-09

**Status**: Draft

**Input**: Módulo de requisitos funcionales para app de inventario de souvenirs con chatbot IA.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Gestión completa de productos e inventario (Priority: P1)

Un operador de tienda necesita registrar, consultar, actualizar y desactivar productos y sus variantes (talla, color, material) para mantener el inventario al día.

**Why this priority**: Sin gestión de productos no existe el inventario. Es el núcleo de toda la aplicación.

**Independent Test**: Puede probarse creando un producto con variantes, ajustando stock y verificando que el historial refleja cada cambio.

**Acceptance Scenarios**:

1. **Given** un formulario con datos válidos de producto, **When** el usuario guarda, **Then** el producto queda activo y visible en el listado de inventario.
2. **Given** un producto activo, **When** el usuario lo desactiva, **Then** el producto queda en estado descontinuado sin borrar su historial.
3. **Given** un producto con variantes, **When** se consulta el stock total, **Then** el sistema muestra la suma del stock de todas sus variantes activas.
4. **Given** stock actual ≤ stock mínimo en una variante, **When** se visualiza el inventario, **Then** aparece alerta de stock bajo.
5. **Given** un ajuste de stock confirmado, **When** se consulta el historial, **Then** se registra cantidad anterior, nueva cantidad, motivo y fecha.

---

### User Story 2 — Importación y exportación masiva (Priority: P2)

Un operador necesita cargar varios productos desde un archivo CSV o Excel y exportar el inventario filtrado en distintos formatos para reportes externos.

**Why this priority**: Acelera la carga inicial y la integración con herramientas externas; sin esto el onboarding de datos es manual y lento.

**Independent Test**: Cargar un CSV con filas válidas e inválidas, previsualizar la tabla, confirmar solo las válidas y verificar que aparecen en inventario.

**Acceptance Scenarios**:

1. **Given** un archivo CSV con algunas filas con errores, **When** el usuario lo carga, **Then** el sistema muestra previsualización con columna de estado por fila (válida/advertencia/error) sin aplicar cambios.
2. **Given** una previsualización con filas válidas, **When** el usuario confirma la importación, **Then** solo las filas válidas se crean o actualizan en el inventario y se registra un lote de importación en el historial.
3. **Given** filtros activos en el inventario, **When** el usuario exporta, **Then** el archivo (CSV, Excel o PDF) contiene únicamente los productos que coinciden con esos filtros.

---

### User Story 3 — Chatbot de inventario con confirmación (Priority: P3)

Un operador consulta el stock o solicita al chatbot acciones como crear productos, ajustar stock o desactivar artículos mediante lenguaje natural.

**Why this priority**: Diferenciador de la app; reduce fricción para acciones rápidas sin navegar formularios.

**Independent Test**: Preguntar al chatbot el stock de un producto y verificar el dato. Luego pedir un ajuste de stock, rechazarlo, y confirmar que el inventario no cambió.

**Acceptance Scenarios**:

1. **Given** una pregunta de stock en lenguaje natural, **When** el chatbot tiene información suficiente, **Then** responde con productos y cantidades verificables en el inventario sin requerir confirmación.
2. **Given** una solicitud de ajuste de stock al chatbot, **When** el usuario no ha confirmado, **Then** el sistema no modifica ningún dato.
3. **Given** una acción propuesta por el chatbot (crear, editar, ajustar stock, desactivar), **When** el usuario confirma, **Then** el cambio se aplica y queda registrado en el historial con origen "chatbot".
4. **Given** que el servicio de IA no responde, **When** el operador intenta usar el chatbot, **Then** el inventario sigue siendo operable de forma manual sin interrupciones.

---

### User Story 4 — Configuración y proveedores (Priority: P4)

Un administrador de la tienda configura la moneda, las categorías visibles y el modelo de IA, y registra proveedores para asociarlos a los productos.

**Why this priority**: Datos maestros que condicionan el funcionamiento del resto de la app, pero pueden configurarse después del lanzamiento inicial.

**Independent Test**: Cambiar la moneda del sistema y verificar que los precios del inventario se muestran con el nuevo símbolo.

**Acceptance Scenarios**:

1. **Given** un formulario de proveedor válido, **When** el usuario guarda, **Then** el proveedor queda disponible para asociarse a productos.
2. **Given** la pantalla de configuración, **When** el usuario cambia la moneda o el modelo de IA, **Then** el cambio se refleja inmediatamente en toda la aplicación.

---

### Edge Cases

- ¿Qué ocurre si se intenta guardar stock con valor negativo?
- ¿Qué hace el sistema si se importa un producto cuyo nombre ya existe?
- ¿Cómo responde el chatbot ante preguntas fuera del dominio de inventario?
- ¿Qué pasa si el archivo de importación está vacío o tiene formato incorrecto?
- ¿Qué ocurre si dos variantes del mismo producto tienen exactamente los mismos atributos?
- ¿Cómo se comporta la app si la conexión a la IA se pierde en mitad de una propuesta de acción?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Dashboard

- **FR-01**: El sistema DEBE mostrar total de productos activos.
- **FR-02**: El sistema DEBE mostrar total de variantes.
- **FR-03**: El sistema DEBE mostrar productos y variantes con stock bajo.
- **FR-04**: El sistema DEBE mostrar productos agotados.
- **FR-05**: El sistema DEBE mostrar valor estimado de compra y venta del inventario.
- **FR-06**: El sistema DEBE mostrar los últimos movimientos de stock.

#### Inventario

- **FR-07**: El sistema DEBE listar todos los productos con paginación u scroll.
- **FR-08**: El usuario DEBE poder buscar por nombre, categoría, proveedor o variante.
- **FR-09**: El usuario DEBE poder filtrar por estado, categoría, proveedor y stock bajo.
- **FR-10**: El usuario DEBE poder ordenar por nombre, stock, precio o fecha.

#### Producto

- **FR-11**: El usuario DEBE poder crear un producto con todos sus campos.
- **FR-12**: El usuario DEBE poder editar un producto activo.
- **FR-13**: El usuario DEBE poder desactivar un producto (cambio a descontinuado, sin borrado físico).
- **FR-14**: El sistema DEBE registrar historial en cada cambio relevante del producto.
- **FR-15**: El usuario DEBE poder ver el detalle completo de un producto con sus variantes e historial.

#### Variantes

- **FR-16**: El usuario DEBE poder agregar variantes con atributos flexibles (talla, color, material, diseño, tamaño).
- **FR-17**: El usuario DEBE poder editar stock, stock mínimo y ubicación de una variante.
- **FR-18**: El sistema DEBE calcular el stock total del producto sumando las variantes activas.

#### Proveedores

- **FR-19**: El usuario DEBE poder registrar un proveedor con nombre, teléfono, correo, dirección y notas.
- **FR-20**: El usuario DEBE poder asociar un proveedor a uno o más productos.

#### Historial / Movimientos

- **FR-21**: El sistema DEBE registrar cada entrada, salida, ajuste, edición, desactivación e importación.
- **FR-22**: Cada movimiento DEBE contener: tipo, cantidad, stock anterior, stock nuevo, motivo, producto, variante, origen y fecha.

#### Importación

- **FR-23**: El usuario DEBE poder cargar un archivo CSV o Excel.
- **FR-24**: El sistema DEBE mostrar previsualización con filas válidas, advertencias y errores antes de aplicar.
- **FR-25**: El sistema DEBE validar: campos obligatorios, precios, stock negativo, duplicados y categorías desconocidas.
- **FR-26**: La importación NO DEBE aplicarse hasta que el usuario confirme explícitamente.
- **FR-27**: Toda importación DEBE generar un registro de lote en el historial.

#### Exportación

- **FR-28**: El usuario DEBE poder exportar el inventario en CSV.
- **FR-29**: El usuario DEBE poder exportar en Excel.
- **FR-30**: El usuario DEBE poder exportar en PDF.
- **FR-31**: La exportación DEBE respetar los filtros activos en el momento de exportar.

#### Chatbot

- **FR-32**: El chatbot DEBE responder consultas de stock por producto, categoría, proveedor, ubicación o variante.
- **FR-33**: El chatbot DEBE listar productos o variantes con stock bajo.
- **FR-34**: El chatbot DEBE proponer la creación de un producto mostrando resumen antes de confirmar.
- **FR-35**: El chatbot DEBE proponer actualizaciones de campos mostrando valor anterior y nuevo.
- **FR-36**: El chatbot DEBE registrar movimientos de stock con motivo y confirmación previa del usuario.
- **FR-37**: El chatbot DEBE proponer desactivar un producto con advertencia y confirmación.
- **FR-38**: El chatbot DEBE mostrar historial de movimientos de un producto o variante.
- **FR-39**: La clave de integración con el servicio de IA NUNCA debe estar expuesta en el cliente.

#### Configuración

- **FR-40**: El usuario DEBE poder configurar la moneda del sistema.
- **FR-41**: El usuario DEBE poder administrar las categorías visibles.
- **FR-42**: El usuario DEBE poder configurar el modelo de IA a usar.

---

### Key Entities

- **Producto**: Unidad básica del inventario. Atributos: nombre, categoría, descripción, stock total calculado, stock mínimo, precios, proveedor, ubicación, estado (activo/agotado/descontinuado), fechas.
- **Variante**: Sub-unidad de un producto con atributos propios (talla, color, material, etc.), stock individual y ubicación. Un producto puede tener cero o más variantes.
- **Categoría**: Clasificación del producto (Llaveros, Imanes, Camisetas, Tazas, Artesanías, Pulseras, otras). Configurable.
- **Proveedor**: Empresa o persona que abastece uno o más productos. Atributos: nombre, teléfono, correo, dirección, notas.
- **Movimiento de inventario**: Registro de cada cambio de estado o stock. Tipos: entrada, salida, ajuste, edición, desactivación, importación, acción de chatbot.
- **Lote de importación**: Registro agrupado de todos los productos/variantes creados o actualizados en una importación.
- **Acción de chatbot**: Propuesta del chatbot con ciclo de vida: propuesta → confirmada/rechazada. Vinculada a movimientos generados.
- **Configuración de la app**: Moneda, categorías visibles, modelo de IA activo.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-01**: Un operador puede registrar un producto completo con variantes en menos de 3 minutos desde una pantalla vacía.
- **SC-02**: La búsqueda y filtros del inventario devuelven resultados visibles en menos de 2 segundos con hasta 1.000 productos.
- **SC-03**: Una importación de 100 filas CSV muestra previsualización completa en menos de 5 segundos.
- **SC-04**: El chatbot responde consultas de stock en menos de 5 segundos cuando el servicio de IA está disponible.
- **SC-05**: El 100% de los ajustes de stock (manuales o vía chatbot) quedan trazados en el historial con cantidad anterior, nueva y motivo.
- **SC-06**: Ninguna acción de mutación del chatbot se aplica sin confirmación explícita del usuario (0 excepciones).
- **SC-07**: El inventario sigue siendo totalmente operable cuando el servicio de IA no está disponible.
- **SC-08**: La exportación en los tres formatos (CSV, Excel, PDF) respeta el 100% de los filtros activos.

---

## Assumptions

- Sin autenticación en v1.0: cualquier usuario con acceso a la URL puede operar el sistema.
- El inventario es para una sola tienda o ubicación en el MVP (sin multi-sucursal).
- Los precios son informativos (no se procesan ventas en el MVP).
- La moneda es configurable pero no hay conversión de divisas.
- El stock no puede ser negativo en ningún momento; la validación aplica en frontend y backend.
- La eliminación de productos es siempre lógica (estado descontinuado); no hay borrado físico.
- El servicio de IA (OpenRouter) requiere una clave de integración gestionada exclusivamente en el servidor.
- Las categorías iniciales son: Llaveros, Imanes, Camisetas, Tazas, Artesanías, Pulseras — ampliables desde configuración.
- El volumen esperado del MVP es de hasta 1.000 productos y 5.000 variantes.
- La app puede funcionar tanto en entorno local como desplegada en web (stack portable).
