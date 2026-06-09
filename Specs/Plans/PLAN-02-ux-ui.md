# PLAN-02 — UX/UI y Diseño Visual

**Spec:** SPEC-02  
**Estado:** Pendiente  
**Dependencias:** PLAN-01 aprobado (para conocer módulos y flujos finales)  
**Bloquea:** PLAN-08 (implementación de frontend)

---

## Objetivo del plan

Definir y validar la descripción visual completa de la aplicación: layout, pantallas, estados, navegación y sistema de diseño. Sin wireframes de código; el resultado es una descripción visual aceptada que guía la implementación del frontend.

---

## Fases

### Fase 1 — Sistema de diseño

Definir y documentar los elementos base del sistema visual:

| Elemento | Tarea |
|---|---|
| Paleta de colores | Confirmar los 6 colores de SPEC-02 y agregar variantes de hover/active/disabled si aplica. |
| Tipografía | Definir fuente principal, tamaños de encabezados (h1-h4), cuerpo y etiquetas. |
| Espaciado | Definir escala de espaciado (4px base recomendado con Tailwind). |
| Radio de bordes | Definir radio estándar para tarjetas, botones e inputs (ej. rounded-xl). |
| Sombras | Definir sombra suave para tarjetas neumorphism y sombra de glassmorphism. |
| Íconos | Definir librería de íconos a usar (ej. Lucide, Heroicons). |
| Componentes base | Botón primario, botón secundario, input, select, badge, toast, modal, tabla. |

### Fase 2 — Layout y navegación

Definir la estructura global de la aplicación:

- **Sidebar:** ítems de navegación, estado activo, íconos, colapso en móvil.
- **Header:** título de sección actual, acciones contextuales.
- **Área principal:** ancho máximo, padding, grid de tarjetas en dashboard.
- **Panel chatbot:** posición (lateral derecho fijo o flotante), dimensiones, comportamiento de apertura/cierre.
- **Responsive:** definir si v1.0 requiere soporte móvil o solo escritorio.

### Fase 3 — Descripción detallada de pantallas

Para cada pantalla de SPEC-02, definir:

#### Dashboard
- Layout de tarjetas de métricas (2 o 3 columnas).
- Tarjeta de alertas de stock bajo con badge morado/rosado.
- Lista de últimos movimientos: columnas visibles, cantidad de ítems.
- Estado vacío: mensaje cuando no hay datos aún.

#### Inventario
- Columnas de la tabla: nombre, categoría, stock, estado, proveedor, acciones.
- Barra de búsqueda: posición y comportamiento (búsqueda al escribir o al presionar Enter).
- Filtros: chips o dropdowns, posición respecto a la tabla.
- Indicador visual de stock bajo en la fila (badge, color de fondo, ícono).
- Acciones por fila: ver, editar, desactivar (dropdown o botones inline).
- Estado vacío y estado sin resultados de búsqueda.

#### Detalle de producto
- Sección de datos generales (grid 2 columnas).
- Tabla de variantes con atributos, stock, stock mínimo, estado.
- Sección de proveedor.
- Timeline o tabla de historial de movimientos.

#### Crear / Editar producto
- Secciones del formulario: datos generales, variantes, proveedor.
- Manejo de variantes: tabla editable con fila de agregar.
- Feedback de validación por campo.
- Botones: guardar, cancelar, y en edición: desactivar.

#### Proveedores
- Listado simple con nombre, correo, teléfono y acciones.
- Formulario lateral o modal para crear/editar.

#### Importar
- Zona de drag & drop con instrucciones de formato esperado.
- Tabla de previsualización: columna de estado por fila (válida / advertencia / error).
- Resumen superior: X válidas, X advertencias, X errores.
- Botones: confirmar (solo filas válidas), cancelar.

#### Exportar
- Filtros activos visibles como chips.
- Tres botones de descarga: CSV, Excel, PDF.
- Feedback de descarga en progreso.

#### Chatbot
- Burbujas de conversación: usuario (derecha, morado), bot (izquierda, blanco/lavanda).
- Tarjeta de confirmación: fondo diferenciado, campos antes/después, botones Confirmar/Rechazar.
- Input con botón enviar y estado deshabilitado mientras procesa.
- Indicador de carga (typing indicator o spinner).

#### Configuración
- Formulario de una sola página con secciones: moneda, modelo IA, categorías.
- Gestión de categorías: lista con opción de agregar y activar/desactivar.

### Fase 4 — Estados especiales

Para cada módulo, documentar los estados:

| Estado | Qué se muestra |
|---|---|
| Vacío | Ilustración o mensaje amigable + CTA (ej. "Agrega tu primer producto"). |
| Cargando | Skeleton loader en tablas y tarjetas. Spinner en acciones puntuales. |
| Error de red | Banner o toast con mensaje de error y opción de reintentar. |
| Confirmación | Modal o panel inline con resumen de la acción. |
| Éxito | Toast verde/morado con mensaje breve (desaparece en 3 segundos). |

### Fase 5 — Validación de accesibilidad

Revisar SPEC-02 sección de accesibilidad:
- Confirmar contraste mínimo 4.5:1 en todos los textos sobre fondo.
- Definir orden de tabulación en formularios.
- Confirmar que modales tienen trampa de foco (focus trap).
- Confirmar atributos ARIA necesarios para tabla y chatbot.

### Fase 6 — Aprobación visual

- Revisar descripción de todas las pantallas con el responsable del proyecto.
- Ajustar según feedback.
- Marcar SPEC-02 como **Aprobado**.

---

## Entregables del plan

- Sistema de diseño documentado (tokens visuales, componentes base).
- Descripción detallada de las 8 pantallas del MVP.
- Decisión documentada sobre soporte responsive (escritorio only vs móvil).
- Estados de UI definidos para todos los módulos.

---

## Criterio de salida

- Todas las pantallas del MVP tienen descripción visual aceptada.
- El sistema de diseño tiene suficiente detalle para que un desarrollador frontend pueda implementarlo sin ambigüedades.
- SPEC-02 marcada como **Aprobado**.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Glassmorphism excesivo reduce legibilidad. | Usar transparencia moderada; validar contraste en cada pantalla. |
| Panel de chatbot compite con el contenido. | Definir comportamiento de apertura/cierre claro en el plan. |
| Sin decisión sobre responsive. | Declarar explícitamente "escritorio únicamente en v1.0" si es el caso. |
