# SPEC-02 - UX/UI y Diseño Visual

**Estado:** Listo para revisión  
**Criterio de salida:** Descripción visual y criterios de UI aceptados  
**Fase:** 2  
**Feature relacionada:** `Specs/002-ux-ui-design/spec.md`

---

## Objetivo

Definir el contrato visual del MVP para que el frontend pueda implementarse sin ambigüedad: sistema visual, layout, navegación, pantallas, componentes, estados de UI, responsive y accesibilidad.

La interfaz debe sentirse administrativa, clara y moderna. El estilo Soft UI / neumorphism ligero + glassmorphism suave se usa para mejorar jerarquía visual, no para decorar en exceso ni reducir legibilidad.

---

## Principios de UX

| Principio | Regla |
|---|---|
| Claridad operativa | Cada pantalla debe mostrar qué se puede hacer y cuál es el estado del inventario. |
| Trazabilidad visible | Las acciones críticas deben mostrar resumen, confirmación y resultado. |
| Bajo esfuerzo | Las tareas frecuentes deben requerir pocos pasos: buscar, filtrar, ajustar stock, exportar. |
| Seguridad visual | Stock bajo, agotado y descontinuado deben distinguirse de forma inmediata. |
| Sin pantallas vacías mudas | Toda pantalla sin datos debe explicar el estado y sugerir una acción. |
| Accesibilidad primero | Contraste, etiquetas, foco y navegación por teclado son parte del contrato. |

---

## Sistema visual

### Paleta base

| Token | Hex | Uso |
|---|---|---|
| `color-primary` | `#7C3AED` | Botones primarios, acciones principales, acentos activos. |
| `color-primary-dark` | `#4C1D95` | Títulos, navegación activa, énfasis fuerte. |
| `color-bg` | `#F5F3FF` | Fondo general de la aplicación. |
| `color-accent-pink` | `#F9A8D4` | Detalles secundarios, highlights suaves. |
| `color-pink-soft` | `#FCE7F3` | Callouts, chips, fondos de alerta suave. |
| `color-text` | `#334155` | Texto principal. |
| `color-surface` | `#FFFFFF` | Tarjetas, paneles, modales. |
| `color-border` | `#E9D5FF` | Bordes suaves y separadores. |
| `color-success` | `#16A34A` | Activo, confirmaciones exitosas. |
| `color-warning` | `#F59E0B` | Advertencias y stock bajo secundario. |
| `color-danger` | `#DC2626` | Errores, agotado y acciones destructivas. |
| `color-muted` | `#64748B` | Texto secundario. |

### Uso de color

- El fondo general usa `#F5F3FF`.
- Las superficies principales son blancas o translúcidas con borde lavanda.
- El morado principal se reserva para acciones primarias y navegación activa.
- El rosado se usa para alertas suaves y detalles, no como color dominante.
- El rojo se usa solo para errores, agotado o riesgo destructivo.
- Texto principal siempre en slate oscuro o morado oscuro; no usar gris claro para contenido crítico.

### Tipografía

| Elemento | Tamaño recomendado | Peso | Uso |
|---|---:|---:|---|
| H1 | 28-32 px | 700 | Título de pantalla. |
| H2 | 22-24 px | 700 | Secciones principales. |
| H3 | 18-20 px | 600 | Subtítulos y tarjetas. |
| Cuerpo | 14-16 px | 400 | Tablas, formularios y texto normal. |
| Label | 13-14 px | 500 | Etiquetas de formulario. |
| Ayuda/Error | 12-13 px | 400/500 | Mensajes de ayuda y validación. |

Fuente recomendada: Inter, system-ui o equivalente sans-serif.

### Bordes, sombras y superficies

| Elemento | Regla |
|---|---|
| Tarjetas | Radio 16 px, fondo blanco o `rgba(255,255,255,0.78)`, borde `#E9D5FF`. |
| Botones | Radio 12 px, altura mínima 40 px. |
| Inputs | Radio 10-12 px, borde visible, foco morado. |
| Modales | Radio 18 px, sombra alta, fondo blanco. |
| Tablas | Contenedor con radio 16 px; filas sin exceso de sombra. |
| Glassmorphism | Solo en sidebar, panel chatbot, tarjetas destacadas y modales. |

Sombra base: suave y difusa. Evitar sombras duras o contrastes que dificulten lectura.

---

## Componentes base

| Componente | Variantes requeridas | Reglas |
|---|---|---|
| Button | primary, secondary, ghost, danger | Debe tener estado hover, focus, disabled y loading. |
| Input | text, number, money, search | Label visible, error inline, helper opcional. |
| Select | simple, filter | Debe mostrar opción seleccionada y estado disabled. |
| Badge | active, low-stock, out-of-stock, discontinued, warning | Colores diferenciados y texto legible. |
| Card | metric, section, action | No anidar cards dentro de cards. |
| Modal | confirmación, formulario | Debe atrapar foco y cerrar con cancelar/escape. |
| Toast | success, error, info | Mensaje breve, no bloqueante. |
| Table | inventario, variantes, movimientos | Cabecera clara y acciones por fila. |
| EmptyState | pantalla, tabla, búsqueda | Mensaje claro + CTA cuando aplique. |
| Skeleton | card, table row, panel | Visible durante carga. |

---

## Layout general

### Estructura desktop

| Zona | Comportamiento |
|---|---|
| Sidebar izquierdo | Navegación principal fija, ancho 248 px, glass suave, íconos + etiquetas. |
| Header | Título de sección, acciones globales/contextuales, altura aproximada 72 px. |
| Área principal | Contenido con padding 24 px, ancho fluido, scroll vertical. |
| Panel chatbot | Lateral derecho colapsable, ancho 360-420 px, disponible desde todas las pantallas. |

### Navegación

El sidebar debe incluir:

1. Dashboard
2. Inventario
3. Proveedores
4. Importar
5. Exportar
6. Chatbot
7. Configuración

Reglas:

- El ítem activo usa `#4C1D95`, fondo lavanda/rosado suave y borde o indicador lateral.
- Cada ítem muestra ícono y etiqueta.
- Desde Dashboard se debe llegar a cualquier sección en máximo 2 clics.
- En pantallas estrechas el sidebar se convierte en drawer o navegación colapsable.

### Responsive

| Ancho | Regla |
|---|---|
| `>= 1280px` | Layout completo: sidebar + contenido + panel chatbot opcional. |
| `1024-1279px` | Sidebar visible; chatbot colapsado por defecto. |
| `768-1023px` | Sidebar colapsable; tablas con scroll horizontal controlado. |
| `< 768px` | Soporte básico responsive: navegación drawer, panel chatbot a pantalla completa, tablas priorizan columnas clave. |

El caso principal del MVP es escritorio, pero la UI no debe romperse en móvil.

---

## Pantallas del MVP

### Dashboard

Contenido:

- Tarjetas de métricas: productos activos, variantes, stock bajo, agotados, valor de compra, valor de venta.
- Sección de alertas de stock bajo con producto, variante, stock actual y mínimo.
- Lista de últimos movimientos con tipo, producto, delta, origen y fecha.
- CTA para crear producto cuando el inventario está vacío.

Layout:

- Grid de métricas de 3 columnas en desktop, 2 en tablet, 1 en móvil.
- Alertas y movimientos debajo de métricas, en dos columnas en desktop.

Estados:

- Vacío: "No hay productos registrados" + botón "Agregar producto".
- Cargando: skeleton en métricas y lista.
- Error: banner con acción "Reintentar".

### Inventario

Contenido:

- Barra de búsqueda superior.
- Filtros por estado, categoría, proveedor y stock bajo.
- Tabla con columnas: nombre, categoría, stock, estado, proveedor, ubicación y acciones.
- Acciones por fila: ver detalle, editar, desactivar.
- Botones de exportación respetando filtros activos.

Reglas:

- La búsqueda filtra por nombre, categoría, proveedor o variante.
- Los filtros combinados aplican simultáneamente.
- El estado visual debe distinguir activo, stock bajo, agotado y descontinuado.
- La tabla mantiene el contexto después de editar o ver detalle.

Estados:

- Sin productos: empty state con CTA.
- Sin resultados: mensaje "No se encontraron productos con estos filtros".
- Cargando: skeleton de filas.

### Detalle de producto

Contenido:

- Encabezado con nombre, estado, categoría y acciones.
- Datos generales en grid: precios, proveedor, ubicación, fechas.
- Tabla de variantes: atributos, SKU, stock, stock mínimo, ubicación, estado.
- Historial paginado de movimientos.

Reglas:

- Si el producto no tiene variantes, mostrar stock directo del producto.
- Si tiene variantes, mostrar stock total calculado y desglose por variante.
- Las acciones críticas deben abrir confirmación.

### Crear / Editar producto

Contenido:

- Sección "Datos generales": nombre, categoría, descripción, precios, stock mínimo, ubicación.
- Sección "Proveedor": seleccionar existente o crear rápido si la spec funcional lo permite.
- Sección "Variantes": tabla editable con atributos, SKU, stock, stock mínimo y ubicación.
- Botones: guardar, cancelar, desactivar en edición.

Reglas:

- Validación inline en menos de 500 ms tras interacción.
- Guardar deshabilitado si hay errores activos.
- Stock y precios negativos se marcan como inválidos.
- Desactivar requiere modal con nombre del producto y advertencia.

### Proveedores

Contenido:

- Tabla/listado con nombre, teléfono, correo, dirección breve y acciones.
- Formulario en modal o panel lateral para crear/editar.
- Vista de productos asociados si hay datos disponibles.

Estados:

- Sin proveedores: empty state con CTA "Agregar proveedor".
- Error de correo: validación inline.

### Importar

Contenido:

- Zona drag & drop y selector de archivo.
- Enlace o botón para descargar plantilla CSV/Excel.
- Resumen de previsualización: filas válidas, advertencias, errores.
- Tabla de previsualización con columna de estado.
- Botones: importar filas válidas, cancelar.

Reglas:

- Ninguna importación se aplica desde esta pantalla sin confirmación.
- Las filas válidas usan estado verde; advertencias amarillo; errores rojo.
- Al confirmar, el modal muestra número exacto de filas válidas a importar.

### Exportar

Contenido:

- Selector de formato: CSV, Excel, PDF.
- Filtros activos visibles como chips.
- Resumen de cantidad estimada de registros.
- Botón de descarga por formato.

Reglas:

- La exportación debe dejar claro si usa inventario completo o filtros activos.
- Durante descarga, mostrar loading en el botón correspondiente.
- Si no hay datos, permitir exportar encabezados o mostrar aviso según API.

### Chatbot

Contenido:

- Historial con burbujas: usuario a la derecha, asistente a la izquierda.
- Campo de texto inferior con botón enviar.
- Indicador de procesamiento.
- Tarjetas de propuesta para crear, editar, ajustar stock o desactivar.

Reglas:

- Respuestas informativas no muestran botones de acción.
- Propuestas de acción muestran valores antes/después cuando aplique.
- Toda acción propuesta tiene botones Confirmar y Rechazar.
- Mientras procesa, input y enviar quedan deshabilitados.
- Si OpenRouter falla, mostrar mensaje claro sin bloquear la app.

### Configuración

Contenido:

- Moneda del sistema.
- Categorías visibles y gestión básica.
- Modelo de OpenRouter.
- Preferencias visuales básicas si se incluyen en MVP.

Reglas:

- Cambios guardados muestran toast.
- Categorías desactivadas no deben confundirse con eliminación física.
- Modelo IA debe mostrarse como configuración administrativa, no como clave secreta.

---

## Estados visuales globales

| Estado | UI requerida |
|---|---|
| Vacío | Mensaje claro, explicación breve y CTA si aplica. |
| Cargando | Skeleton en contenido estructural; spinner solo en acciones puntuales. |
| Error de red | Banner o toast con mensaje y acción de reintento. |
| Error de validación | Mensaje junto al campo y `aria-describedby`. |
| Confirmación | Modal o tarjeta inline con resumen de acción. |
| Éxito | Toast breve, no bloqueante. |
| Stock bajo | Badge rosado/advertencia con stock actual y mínimo disponible. |
| Agotado | Badge rojo/naranja. |
| Descontinuado | Badge gris, fila atenuada, acciones limitadas. |

---

## Accesibilidad

- Contraste mínimo 4.5:1 para texto normal.
- Todos los inputs tienen `label` visible.
- Errores asociados al campo con `aria-describedby`.
- Foco visible en botones, inputs, filtros, filas accionables y modales.
- Modales con focus trap y cierre por Escape.
- Tablas con encabezados claros.
- Botones con texto o `aria-label` descriptivo.
- Chatbot anuncia estado de procesamiento visualmente y evita envíos duplicados.
- No depender solo del color: badges deben incluir texto.

---

## Criterios de aceptación UI

| ID | Criterio |
|---|---|
| CA-UI-01 | Dado el Dashboard, cuando carga con datos, entonces muestra métricas, alertas y últimos movimientos sin interacción adicional. |
| CA-UI-02 | Dado el sidebar, cuando el usuario navega, entonces la sección activa queda claramente destacada. |
| CA-UI-03 | Dada la tabla de inventario, cuando se aplican filtros combinados, entonces solo se muestran resultados que cumplen todos los filtros. |
| CA-UI-04 | Dado un formulario inválido, cuando el usuario edita el campo, entonces el error aparece junto al campo y guardar queda deshabilitado. |
| CA-UI-05 | Dada una acción destructiva, cuando el usuario la inicia, entonces se muestra confirmación con nombre del elemento afectado. |
| CA-UI-06 | Dada una propuesta del chatbot, cuando se muestra, entonces incluye resumen claro y botones Confirmar/Rechazar. |
| CA-UI-07 | Dada una importación con errores, cuando se previsualiza, entonces cada fila muestra estado y motivo. |
| CA-UI-08 | Dada cualquier pantalla sin datos, cuando carga, entonces muestra estado vacío con mensaje útil. |
| CA-UI-09 | Dado el flujo por teclado, cuando el usuario tabula formularios y modales, entonces puede operar sin mouse. |
| CA-UI-10 | Dado texto sobre cualquier superficie, cuando se valida contraste, entonces cumple mínimo 4.5:1. |

---

## Decisiones cerradas para SPEC-02

| Decisión | Resultado |
|---|---|
| Caso principal responsive | Escritorio primero, con soporte responsive básico. |
| Chatbot | Panel lateral derecho colapsable en desktop; drawer/pantalla completa en móvil. |
| Diseño visual | Soft UI y glassmorphism moderado, priorizando legibilidad. |
| Íconos | Usar una librería estándar de íconos en implementación frontend. |
| Tema oscuro | Fuera de alcance del MVP. |
| Imágenes de producto | Fuera de alcance del MVP; usar iconografía y estados visuales. |

---

## Pendientes que dependen de otras specs

| Pendiente | Depende de |
|---|---|
| Campos finales del formulario de producto | SPEC-01 y SPEC-03 aprobadas. |
| Acciones exactas del chatbot | SPEC-05 aprobada. |
| Columnas finales de import/export | SPEC-06 aprobada. |
| Componentes técnicos exactos | SPEC-08, cuando se confirme stack frontend. |
