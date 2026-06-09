# SPEC-02 — UX/UI y Diseño Visual

**Estado:** Pendiente  
**Criterio de salida:** Wireframes o descripción visual aceptada  
**Fase:** 2

---

## Estilo visual

| Elemento | Especificación |
|---|---|
| Estilo general | Soft UI / neumorphism ligero con glassmorphism suave. |
| Fondo | Lavanda muy claro `#F5F3FF` o degradado pastel. |
| Tarjetas | Blancas o translúcidas, bordes redondeados, sombra suave. |
| Acento principal | Morado `#7C3AED` para botones primarios, encabezados y acciones importantes. |
| Acento secundario | Rosado pastel `#F9A8D4` para detalles y estados suaves. |
| Fondo rosado | `#FCE7F3` para callouts, chips y alertas visuales suaves. |
| Texto principal | Slate `#334155` para legibilidad. Evitar gris claro en texto. |
| Morado oscuro | `#4C1D95` para títulos y navegación activa. |
| Animaciones | Transiciones suaves en modales, filtros, confirmaciones y chatbot. No afectar rendimiento. |
| Accesibilidad | Estados visibles, foco de teclado, etiquetas claras, contraste suficiente. |

### Paleta completa

| Color | Hex | Uso |
|---|---|---|
| Morado principal | `#7C3AED` | Botones primarios, encabezados, acciones. |
| Morado oscuro | `#4C1D95` | Títulos, navegación activa. |
| Lavanda fondo | `#F5F3FF` | Fondo general y tarjetas suaves. |
| Rosado pastel | `#F9A8D4` | Detalles visuales y acentos secundarios. |
| Rosado claro | `#FCE7F3` | Callouts, chips y alertas suaves. |
| Slate | `#334155` | Texto principal. |

---

## Layout general

| Área | Descripción |
|---|---|
| Sidebar lateral | Navegación principal izquierda con íconos y etiquetas. |
| Área principal | Dashboard y contenido a la derecha del sidebar. |
| Panel chatbot | Lateral derecho flotante o página dedicada con historial de conversación. |
| Header | Barra superior con título de sección y acciones globales. |

---

## Pantallas propuestas

### Dashboard
- Vista rápida con tarjetas de métricas: productos activos, variantes, stock bajo, agotados.
- Valor estimado de compra y venta.
- Lista de últimos movimientos.
- Alertas visuales de stock bajo con acento rosado o morado.

### Inventario
- Tabla de productos con columnas: nombre, categoría, stock, estado, proveedor, acciones.
- Barra de búsqueda superior.
- Filtros por estado, categoría, proveedor y stock bajo.
- Ordenamiento por columna.
- Acciones rápidas: ver, editar, desactivar.

### Detalle de producto
- Datos generales del producto.
- Listado de variantes con stock individual.
- Información del proveedor.
- Historial de movimientos paginado.

### Crear / Editar producto
- Formulario con secciones: datos generales, variantes, proveedor.
- Validaciones en tiempo real.
- Confirmación antes de guardar cambios críticos.

### Proveedores
- Listado con nombre, correo, teléfono.
- Formulario de creación y edición.
- Asociación a productos.

### Importar
- Área de carga de archivo (drag & drop o selector).
- Previsualización de filas: válidas, advertencias y errores.
- Confirmación antes de aplicar.
- Reporte post-importación.

### Exportar
- Selector de formato: CSV, Excel, PDF.
- Filtros activos visibles antes de exportar.
- Botón de descarga.

### Chatbot
- Panel lateral derecho o pantalla dedicada.
- Historial de conversación con burbujas diferenciadas usuario/bot.
- Campo de texto en la parte inferior.
- Tarjetas de confirmación para acciones (crear, editar, desactivar, ajustar stock).
- Estado de carga visible mientras el chatbot responde.

### Configuración
- Moneda del sistema.
- Gestión de categorías.
- Modelo de OpenRouter.
- Preferencias visuales básicas.

---

## Estados de UI requeridos

| Estado | Descripción |
|---|---|
| Estado vacío | Mensaje amigable cuando no hay datos (sin productos, sin movimientos, etc.). |
| Cargando | Skeleton loader o spinner en tarjetas y tablas. |
| Error | Mensaje claro con acción sugerida. |
| Confirmación | Modal o inline con resumen de la acción antes de ejecutar. |
| Éxito | Feedback visual breve (toast o banner) al completar una acción. |
| Stock bajo | Badge o indicador visual destacado en inventario y dashboard. |
| Agotado | Badge diferenciado del stock bajo. |
| Descontinuado | Estilo apagado o tachado en la lista. |

---

## Consideraciones de accesibilidad

- Todos los campos de formulario deben tener etiqueta visible (`label`).
- Contraste mínimo 4.5:1 en texto sobre fondo.
- Navegación completa por teclado en formularios y modales.
- Mensajes de error asociados al campo que los genera.
- El chatbot debe indicar cuando está procesando para evitar envíos duplicados.
