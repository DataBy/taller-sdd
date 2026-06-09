# Feature Specification: UX/UI y Diseño Visual — Inventario Souvenirs

**Feature Branch**: `002-ux-ui-design`

**Created**: 2026-06-09

**Status**: Draft

**Input**: Diseño visual, layout, pantallas y estados de UI para la app de inventario de souvenirs.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navegación fluida entre módulos (Priority: P1)

Un operador abre la aplicación y puede moverse entre Dashboard, Inventario, Proveedores, Importar, Exportar, Chatbot y Configuración sin perderse ni necesitar instrucciones.

**Why this priority**: La estructura de navegación es la columna vertebral de la app; si el operador no puede orientarse, ningún módulo es usable.

**Independent Test**: Un usuario nuevo puede llegar a cualquier pantalla en máximo 2 clics desde el Dashboard, sin formación previa.

**Acceptance Scenarios**:

1. **Given** la app cargada, **When** el operador hace clic en cualquier sección del menú lateral, **Then** la pantalla correspondiente carga y el ítem de menú queda visualmente activo.
2. **Given** cualquier pantalla, **When** el operador revisa el área de navegación, **Then** puede identificar en qué sección está sin ambigüedad.
3. **Given** la app en pantalla de escritorio, **When** el operador redimensiona la ventana, **Then** el layout se adapta sin romper la estructura ni ocultar acciones críticas.

---

### User Story 2 — Dashboard que comunica el estado del inventario de un vistazo (Priority: P1)

Un operador al abrir la app quiere saber inmediatamente cuántos productos hay, cuáles tienen stock bajo, cuáles están agotados y cuál es el valor del inventario.

**Why this priority**: El Dashboard es la primera pantalla y la más frecuentemente visitada; su utilidad determina si el operador confía en la app.

**Independent Test**: Sin tocar ningún filtro, un operador puede responder en menos de 10 segundos: "¿Hay productos con stock bajo ahora mismo?" y "¿Cuál fue el último movimiento de inventario?"

**Acceptance Scenarios**:

1. **Given** el Dashboard con datos, **When** el operador lo abre, **Then** ve tarjetas con: total de productos activos, total de variantes, productos con stock bajo, productos agotados y valor estimado de compra/venta.
2. **Given** que existen productos con stock bajo, **When** se carga el Dashboard, **Then** aparece una alerta o sección destacada con los productos afectados.
3. **Given** el Dashboard sin ningún producto registrado, **When** se carga, **Then** muestra un estado vacío amigable con una acción sugerida para agregar el primer producto.

---

### User Story 3 — Tabla de inventario con búsqueda, filtros y acciones rápidas (Priority: P1)

Un operador necesita encontrar un producto específico en una lista de cientos, aplicar filtros combinados y acceder a sus acciones sin perder el contexto de la lista.

**Why this priority**: La tabla de inventario es la pantalla de trabajo principal; su usabilidad define la eficiencia diaria del operador.

**Independent Test**: Dado un inventario de 200 productos, el operador puede filtrar por categoría "Camisetas" + stock bajo y ver solo los resultados relevantes en una sola interacción.

**Acceptance Scenarios**:

1. **Given** la tabla de inventario, **When** el operador escribe en la barra de búsqueda, **Then** la tabla filtra en tiempo real por nombre, categoría, proveedor o variante.
2. **Given** la tabla de inventario, **When** el operador aplica filtros combinados (estado + categoría), **Then** solo se muestran productos que cumplen todos los criterios simultáneamente.
3. **Given** un producto en la tabla, **When** el operador hace clic en las acciones, **Then** puede ver detalle, editar o desactivar sin salir de la tabla.
4. **Given** la tabla con filtros aplicados, **When** el operador hace clic en exportar, **Then** la exportación respeta los filtros visibles.

---

### User Story 4 — Formularios claros con validación en tiempo real (Priority: P2)

Un operador crea o edita un producto con variantes y recibe feedback inmediato si algún dato es incorrecto, sin esperar al envío.

**Why this priority**: Los formularios son el punto de entrada de todos los datos; errores silenciosos o mensajes confusos generan datos sucios en el inventario.

**Independent Test**: Al intentar guardar un producto con stock negativo, el campo afectado muestra el error antes de enviar el formulario.

**Acceptance Scenarios**:

1. **Given** el formulario de creación de producto, **When** el operador deja el campo nombre vacío e intenta guardar, **Then** aparece un mensaje de error junto al campo, no en un alert genérico.
2. **Given** el campo de stock, **When** el operador ingresa un valor negativo, **Then** el campo se marca como inválido inmediatamente y el botón de guardar permanece deshabilitado.
3. **Given** una acción de desactivar producto, **When** el operador hace clic, **Then** aparece un modal de confirmación con el nombre del producto antes de ejecutar el cambio.

---

### User Story 5 — Chatbot accesible con confirmaciones visuales claras (Priority: P2)

Un operador usa el panel de chatbot para consultar stock o pedir una acción, y entiende claramente qué va a cambiar antes de confirmar.

**Why this priority**: Si la tarjeta de confirmación del chatbot no es clara, el operador puede aprobar cambios sin entenderlos, violando el principio de confirmación obligatoria.

**Independent Test**: El operador puede distinguir visualmente entre una respuesta informativa del chatbot y una tarjeta de acción que requiere su aprobación.

**Acceptance Scenarios**:

1. **Given** el panel de chatbot, **When** el chatbot responde una consulta de stock, **Then** la respuesta se muestra como burbuja de texto sin botones de acción.
2. **Given** el chatbot propone ajustar stock, **When** el operador ve la respuesta, **Then** aparece una tarjeta con stock anterior, stock nuevo y motivo, más dos botones: Confirmar y Rechazar.
3. **Given** el chatbot procesando una solicitud, **When** la IA está respondiendo, **Then** el campo de texto queda deshabilitado y hay un indicador visual de procesamiento.

---

### User Story 6 — Importación con previsualización visual antes de confirmar (Priority: P2)

Un operador carga un archivo CSV, ve exactamente qué filas se importarán y cuáles tienen problemas, y decide qué hacer antes de que cualquier dato cambie.

**Why this priority**: La importación sin previsualización puede introducir cientos de errores de golpe; la UI de previsualización es la única protección visual del operador.

**Independent Test**: Al cargar un CSV con 10 filas válidas y 3 con errores, el operador ve la tabla con estados por fila y puede confirmar solo las 10 válidas.

**Acceptance Scenarios**:

1. **Given** la pantalla de importación, **When** el operador arrastra un archivo CSV, **Then** aparece una tabla con cada fila y su estado: válida (verde), advertencia (amarillo) o error (rojo).
2. **Given** la previsualización con errores, **When** el operador hace hover o clic en una fila con error, **Then** ve el mensaje específico que describe el problema.
3. **Given** la previsualización con al menos una fila válida, **When** el operador hace clic en "Importar filas válidas", **Then** aparece un modal de confirmación con el número exacto de filas a importar.

---

### Edge Cases

- ¿Cómo se ve la tabla de inventario cuando no hay ningún producto registrado?
- ¿Qué muestra el Dashboard si todos los productos están descontinuados?
- ¿Cómo se indica visualmente que un producto está agotado vs. con stock bajo vs. descontinuado?
- ¿Qué pasa visualmente si el chatbot devuelve un error de servicio?
- ¿Cómo se ve la pantalla de importación si el archivo subido no es CSV ni Excel?
- ¿Cómo se muestra el valor de inventario si no se han configurado precios?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Sistema visual

- **FR-UI-01**: La paleta de colores DEBE seguir: fondo lavanda `#F5F3FF`, acento morado `#7C3AED`, morado oscuro `#4C1D95`, rosado pastel `#F9A8D4`, rosado claro `#FCE7F3`, texto slate `#334155`.
- **FR-UI-02**: Las tarjetas DEBEN tener bordes redondeados, fondo blanco o translúcido y sombra suave (Soft UI).
- **FR-UI-03**: Las transiciones y animaciones DEBEN ser suaves en modales, filtros, confirmaciones y panel de chatbot.
- **FR-UI-04**: El contraste de texto sobre fondo DEBE ser mínimo 4.5:1 en toda la interfaz.

#### Layout y navegación

- **FR-UI-05**: El layout DEBE incluir: sidebar lateral izquierdo, área principal central y panel de chatbot lateral derecho.
- **FR-UI-06**: El sidebar DEBE mostrar íconos y etiquetas para: Dashboard, Inventario, Proveedores, Importar, Exportar, Chatbot, Configuración.
- **FR-UI-07**: La sección activa en el sidebar DEBE estar visualmente destacada en morado oscuro `#4C1D95`.
- **FR-UI-08**: El header DEBE mostrar el título de la sección actual y acciones globales relevantes.

#### Dashboard

- **FR-UI-09**: El Dashboard DEBE mostrar tarjetas de métricas: productos activos, variantes, stock bajo, agotados, valor de compra, valor de venta.
- **FR-UI-10**: Los productos con stock bajo DEBEN estar destacados con un badge o sección de alerta con acento rosado o morado.
- **FR-UI-11**: El Dashboard DEBE mostrar los últimos movimientos de stock como lista cronológica.

#### Inventario

- **FR-UI-12**: La tabla de inventario DEBE mostrar columnas: nombre, categoría, stock, estado, proveedor, acciones.
- **FR-UI-13**: La barra de búsqueda DEBE filtrar la tabla en tiempo real.
- **FR-UI-14**: Los filtros DEBEN ser aplicables de forma combinada sin recargar la página.
- **FR-UI-15**: Los estados de producto DEBEN tener badges visuales diferenciados: activo (verde/morado), stock bajo (rosado), agotado (rojo/naranja), descontinuado (gris apagado).

#### Formularios

- **FR-UI-16**: Cada campo de formulario DEBE tener una etiqueta visible asociada.
- **FR-UI-17**: Los mensajes de error DEBEN aparecer junto al campo que los genera, no como alert global.
- **FR-UI-18**: El botón de guardar DEBE estar deshabilitado mientras existan errores de validación activos.
- **FR-UI-19**: Las acciones destructivas (desactivar, eliminar variante) DEBEN requerir confirmación en modal con nombre del elemento afectado.

#### Chatbot

- **FR-UI-20**: El panel de chatbot DEBE mostrar historial de conversación con burbujas diferenciadas: usuario (derecha) y bot (izquierda).
- **FR-UI-21**: Las acciones propuestas por el chatbot DEBEN mostrarse en tarjetas visuales con: descripción del cambio, valores antes/después, botones Confirmar y Rechazar.
- **FR-UI-22**: El campo de texto del chatbot DEBE deshabilitarse mientras la IA procesa la solicitud.
- **FR-UI-23**: Si el servicio de IA no responde, DEBE mostrarse un mensaje de error claro sin que la app quede inutilizable.

#### Importación

- **FR-UI-24**: La pantalla de importación DEBE incluir zona de drag & drop con indicador visual de área activa.
- **FR-UI-25**: La previsualización DEBE mostrar una columna de estado por fila con íconos: ✓ válida, ⚠ advertencia, ✗ error.
- **FR-UI-26**: El panel superior de previsualización DEBE mostrar el resumen: N válidas, N advertencias, N errores.
- **FR-UI-27**: El botón de importar DEBE mostrar el número exacto de filas válidas a importar.

#### Estados de UI

- **FR-UI-28**: Todas las pantallas DEBEN tener estado vacío con mensaje amigable y acción sugerida cuando no hay datos.
- **FR-UI-29**: Las cargas de datos DEBEN mostrar skeleton loaders o spinners en tarjetas y tablas.
- **FR-UI-30**: Las acciones exitosas DEBEN mostrar feedback visual breve (toast o banner) sin bloquear la interfaz.
- **FR-UI-31**: Los errores del sistema DEBEN mostrar mensaje claro con acción sugerida para resolverlos.

#### Accesibilidad

- **FR-UI-32**: La navegación completa por teclado DEBE funcionar en formularios y modales.
- **FR-UI-33**: Los mensajes de error DEBEN estar asociados programáticamente al campo que los genera.
- **FR-UI-34**: El chatbot DEBE indicar visualmente cuando está procesando para evitar envíos duplicados.

---

### Key Entities

- **Pantalla**: Cada vista principal de la app (Dashboard, Inventario, Detalle de producto, Crear/Editar, Proveedores, Importar, Exportar, Chatbot, Configuración).
- **Componente de UI**: Bloque reutilizable de interfaz (tarjeta de métrica, tabla, badge de estado, formulario, modal de confirmación, tarjeta de acción de chatbot, toast, estado vacío, skeleton loader).
- **Estado de UI**: Condición visual de un componente o pantalla (vacío, cargando, error, éxito, stock bajo, agotado, descontinuado).
- **Paleta de colores**: Conjunto fijo de 6 valores hex que define la identidad visual de toda la app.
- **Layout**: Estructura de tres zonas (sidebar, área principal, panel chatbot) que se mantiene consistente en todas las pantallas.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-01**: Un usuario nuevo puede navegar a cualquier sección de la app en máximo 2 clics desde el Dashboard, sin instrucciones.
- **SC-02**: El Dashboard comunica el estado del inventario en menos de 10 segundos de lectura sin interacción adicional.
- **SC-03**: Los errores de validación en formularios aparecen en menos de 500 ms tras la interacción con el campo.
- **SC-04**: Un operador puede distinguir visualmente entre productos activos, con stock bajo, agotados y descontinuados sin leer el texto de estado.
- **SC-05**: La tarjeta de confirmación del chatbot permite al operador entender qué va a cambiar antes de confirmar, sin ambigüedad.
- **SC-06**: Todas las pantallas con datos muestran un estado de carga visible; ninguna pantalla queda en blanco durante la carga.
- **SC-07**: El contraste de todos los textos sobre sus fondos respectivos cumple mínimo 4.5:1 (WCAG AA).
- **SC-08**: La app es navegable completamente por teclado en los formularios y modales principales.

---

## Assumptions

- El diseño es para pantallas de escritorio en primer lugar (1280px+); móvil es responsive pero no es el caso de uso primario del MVP.
- No se requieren imágenes de productos en el MVP; el diseño usa iconografía y colores como identificadores visuales.
- Las animaciones y transiciones son suaves pero no afectan el rendimiento; en dispositivos lentos se pueden reducir o desactivar.
- El panel de chatbot puede ser lateral flotante o pantalla dedicada; la decisión final se toma en PLAN-02.
- El diseño Soft UI / neumorphism ligero + glassmorphism suave aplica a tarjetas y modales, no a toda la interfaz (para preservar legibilidad y rendimiento).
- Los íconos del sidebar son estándar y reconocibles sin texto adicional, pero se muestran con etiqueta por defecto para maximizar claridad.
- No hay tema oscuro en el MVP; la paleta lavanda-morado-rosado es la única versión.
