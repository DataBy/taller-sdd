# Feature Specification: UX/UI y Diseño Visual - Inventario Souvenirs

**Feature Branch**: `002-ux-ui-design`  
**Created**: 2026-06-09  
**Status**: Ready for Review  
**Input**: Diseño visual, layout, pantallas y estados de UI para la app de inventario de souvenirs.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegación fluida entre módulos (Priority: P1)

Un operador abre la aplicación y puede moverse entre Dashboard, Inventario, Proveedores, Importar, Exportar, Chatbot y Configuración sin perderse ni necesitar instrucciones.

**Why this priority**: La estructura de navegación es la columna vertebral de la app.

**Independent Test**: Un usuario nuevo puede llegar a cualquier pantalla en máximo 2 clics desde el Dashboard.

**Acceptance Scenarios**:

1. **Given** la app cargada, **When** el operador hace clic en cualquier sección del menú lateral, **Then** la pantalla correspondiente carga y el ítem queda visualmente activo.
2. **Given** cualquier pantalla, **When** el operador revisa la navegación, **Then** puede identificar en qué sección está sin ambigüedad.
3. **Given** la app en escritorio, **When** el operador redimensiona la ventana, **Then** el layout se adapta sin ocultar acciones críticas.

---

### User Story 2 - Dashboard que comunica estado de inventario (Priority: P1)

Un operador quiere saber inmediatamente cuántos productos hay, cuáles tienen stock bajo, cuáles están agotados y cuál es el valor del inventario.

**Why this priority**: El Dashboard es la primera pantalla y debe generar confianza operativa.

**Independent Test**: Sin tocar filtros, un operador puede responder en menos de 10 segundos si hay productos con stock bajo y cuál fue el último movimiento.

**Acceptance Scenarios**:

1. **Given** el Dashboard con datos, **When** el operador lo abre, **Then** ve tarjetas con productos activos, variantes, stock bajo, agotados y valor estimado.
2. **Given** que existen productos con stock bajo, **When** se carga el Dashboard, **Then** aparece una sección destacada con productos afectados.
3. **Given** el Dashboard sin productos, **When** se carga, **Then** muestra estado vacío con acción sugerida.

---

### User Story 3 - Inventario con búsqueda, filtros y acciones rápidas (Priority: P1)

Un operador necesita encontrar productos, aplicar filtros combinados y acceder a acciones sin perder el contexto.

**Why this priority**: La tabla de inventario es la pantalla de trabajo principal.

**Independent Test**: Dado un inventario de 200 productos, el operador filtra por categoría "Camisetas" + stock bajo y ve solo resultados relevantes.

**Acceptance Scenarios**:

1. **Given** la tabla de inventario, **When** el operador escribe en búsqueda, **Then** la tabla filtra por nombre, categoría, proveedor o variante.
2. **Given** filtros combinados, **When** el operador aplica estado + categoría, **Then** solo se muestran productos que cumplen ambos criterios.
3. **Given** un producto en la tabla, **When** el operador abre acciones, **Then** puede ver detalle, editar o desactivar.
4. **Given** filtros aplicados, **When** el operador exporta, **Then** la exportación respeta los filtros visibles.

---

### User Story 4 - Formularios claros con validación inmediata (Priority: P2)

Un operador crea o edita productos y recibe feedback inmediato si algún dato es incorrecto.

**Why this priority**: Los formularios son el punto de entrada de datos del inventario.

**Independent Test**: Al ingresar stock negativo, el campo muestra error antes de enviar.

**Acceptance Scenarios**:

1. **Given** el formulario de producto, **When** el operador deja nombre vacío e intenta guardar, **Then** aparece error junto al campo.
2. **Given** el campo stock, **When** el operador ingresa valor negativo, **Then** el campo se marca inválido y guardar queda deshabilitado.
3. **Given** desactivar producto, **When** el operador inicia la acción, **Then** aparece modal con el nombre del producto.

---

### User Story 5 - Chatbot con confirmaciones visuales claras (Priority: P2)

Un operador usa el chatbot para consultar stock o pedir acciones y entiende claramente qué cambiará antes de confirmar.

**Why this priority**: La confirmación visual evita mutaciones accidentales.

**Independent Test**: El operador distingue entre una respuesta informativa y una tarjeta de acción confirmable.

**Acceptance Scenarios**:

1. **Given** el chatbot responde una consulta, **When** muestra respuesta, **Then** aparece como burbuja sin botones de acción.
2. **Given** el chatbot propone ajustar stock, **When** el operador ve la propuesta, **Then** aparece una tarjeta con stock anterior, nuevo, motivo y botones Confirmar/Rechazar.
3. **Given** la IA procesa, **When** espera respuesta, **Then** el input queda deshabilitado y hay indicador de carga.

---

### User Story 6 - Importación con previsualización antes de confirmar (Priority: P2)

Un operador carga CSV/Excel, ve qué filas se importarán y cuáles tienen problemas antes de modificar datos.

**Why this priority**: La previsualización previene errores masivos.

**Independent Test**: Al cargar un CSV con 10 filas válidas y 3 con errores, el operador ve estados por fila y confirma solo las válidas.

**Acceptance Scenarios**:

1. **Given** la pantalla de importación, **When** el operador arrastra un CSV, **Then** aparece tabla con estados: válida, advertencia o error.
2. **Given** una fila con error, **When** el operador la revisa, **Then** ve el mensaje específico.
3. **Given** al menos una fila válida, **When** el operador elige importar, **Then** aparece modal con número exacto de filas.

---

## Edge Cases

- Inventario vacío.
- Todos los productos descontinuados.
- Diferenciación visual entre activo, stock bajo, agotado y descontinuado.
- Error de servicio del chatbot.
- Archivo de importación inválido.
- Valores de inventario sin precios configurados.
- Tablas con muchas columnas en pantallas medianas.
- Modal de confirmación operado solo con teclado.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Sistema visual

- **FR-UI-01**: La paleta DEBE seguir los tokens definidos en `SPEC-02`: lavanda, morado, morado oscuro, rosado pastel, rosado claro y slate.
- **FR-UI-02**: Las tarjetas DEBEN tener borde redondeado, fondo blanco o translúcido y sombra suave.
- **FR-UI-03**: Las transiciones DEBEN ser suaves en modales, filtros, confirmaciones y chatbot.
- **FR-UI-04**: El contraste de texto DEBE cumplir mínimo 4.5:1.
- **FR-UI-05**: El diseño DEBE usar glassmorphism de forma moderada, sin afectar legibilidad.

#### Layout y navegación

- **FR-UI-06**: El layout DEBE incluir sidebar izquierdo, header, área principal y panel chatbot colapsable.
- **FR-UI-07**: El sidebar DEBE mostrar íconos y etiquetas para Dashboard, Inventario, Proveedores, Importar, Exportar, Chatbot y Configuración.
- **FR-UI-08**: La sección activa DEBE quedar destacada en morado oscuro.
- **FR-UI-09**: El header DEBE mostrar título de sección y acciones contextuales.
- **FR-UI-10**: En móvil/tablet, navegación y chatbot DEBEN transformarse en drawer o panel de pantalla completa.

#### Dashboard

- **FR-UI-11**: El Dashboard DEBE mostrar tarjetas de productos activos, variantes, stock bajo, agotados, valor de compra y valor de venta.
- **FR-UI-12**: Los productos con stock bajo DEBEN aparecer en una sección destacada.
- **FR-UI-13**: El Dashboard DEBE mostrar últimos movimientos como lista cronológica.
- **FR-UI-14**: El Dashboard vacío DEBE mostrar mensaje y CTA para agregar producto.

#### Inventario

- **FR-UI-15**: La tabla DEBE mostrar nombre, categoría, stock, estado, proveedor, ubicación y acciones.
- **FR-UI-16**: La búsqueda DEBE filtrar por nombre, categoría, proveedor o variante.
- **FR-UI-17**: Los filtros DEBEN combinarse sin recargar la página.
- **FR-UI-18**: Los estados de producto DEBEN tener badges diferenciados.
- **FR-UI-19**: Las acciones por fila DEBEN permitir ver, editar y desactivar.

#### Formularios

- **FR-UI-20**: Cada campo DEBE tener label visible.
- **FR-UI-21**: Los errores DEBEN aparecer junto al campo que los genera.
- **FR-UI-22**: Guardar DEBE estar deshabilitado si hay errores activos.
- **FR-UI-23**: Acciones destructivas DEBEN requerir modal de confirmación.

#### Chatbot

- **FR-UI-24**: El panel DEBE mostrar burbujas diferenciadas para usuario y asistente.
- **FR-UI-25**: Las propuestas DEBEN mostrarse como tarjetas con resumen, antes/después y Confirmar/Rechazar.
- **FR-UI-26**: El input DEBE deshabilitarse mientras la IA procesa.
- **FR-UI-27**: Si OpenRouter falla, la UI DEBE mostrar error claro sin bloquear el inventario.

#### Importación y exportación

- **FR-UI-28**: Importar DEBE incluir zona drag & drop y selector de archivo.
- **FR-UI-29**: La previsualización DEBE mostrar estado por fila.
- **FR-UI-30**: El resumen DEBE mostrar válidas, advertencias y errores.
- **FR-UI-31**: Exportar DEBE mostrar formato, filtros activos y estado de descarga.

#### Estados y accesibilidad

- **FR-UI-32**: Todas las pantallas DEBEN tener estado vacío, cargando y error.
- **FR-UI-33**: Las acciones exitosas DEBEN mostrar toast o banner breve.
- **FR-UI-34**: La navegación por teclado DEBE funcionar en formularios y modales.
- **FR-UI-35**: Los errores DEBEN asociarse programáticamente con el campo.
- **FR-UI-36**: Los badges NO DEBEN depender solo del color; deben incluir texto.

---

### Key Entities

- **Pantalla**: Dashboard, Inventario, Detalle, Crear/Editar, Proveedores, Importar, Exportar, Chatbot, Configuración.
- **Componente de UI**: Botón, input, select, badge, card, modal, toast, tabla, empty state, skeleton.
- **Estado de UI**: Vacío, cargando, error, éxito, confirmación, stock bajo, agotado, descontinuado.
- **Paleta de colores**: Tokens visuales definidos para identidad del MVP.
- **Layout**: Estructura global con sidebar, header, contenido y chatbot.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-01**: Un usuario nuevo navega a cualquier sección en máximo 2 clics desde Dashboard.
- **SC-02**: El Dashboard comunica el estado del inventario en menos de 10 segundos.
- **SC-03**: Los errores de formulario aparecen en menos de 500 ms tras interacción.
- **SC-04**: Un operador distingue activo, stock bajo, agotado y descontinuado sin depender solo del texto.
- **SC-05**: La tarjeta del chatbot permite entender el cambio antes de confirmar.
- **SC-06**: Ninguna pantalla queda en blanco durante carga.
- **SC-07**: Todo texto cumple contraste mínimo 4.5:1.
- **SC-08**: Formularios y modales principales son operables por teclado.

---

## Assumptions

- El diseño prioriza escritorio de 1280 px o más.
- Móvil tiene soporte responsive básico, no es el flujo principal del MVP.
- No hay imágenes de producto en v1.0.
- No hay tema oscuro en v1.0.
- El chatbot será panel lateral derecho colapsable en desktop y drawer/pantalla completa en móvil.
- El estilo Soft UI aplica a tarjetas, modales y paneles, no a toda la interfaz.
