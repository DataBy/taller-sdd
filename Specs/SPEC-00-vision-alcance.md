# SPEC-00 — Visión y Alcance

**Estado:** En revisión  
**Criterio de salida:** Project Chart aprobado  
**Fase:** 1

---

## Resumen ejecutivo

La aplicación es una web app para controlar inventario de souvenirs. Permite administrar productos, variantes, proveedores, stock, historial de movimientos, importaciones, exportaciones y un chatbot que interactúa con el inventario mediante OpenRouter.

| Elemento | Descripción |
|---|---|
| Objetivo principal | Controlar inventario de souvenirs de forma simple, visual y asistida por chatbot. |
| Problema que resuelve | Evita inventario disperso, errores de stock, falta de historial y consultas manuales. |
| Usuarios previstos | Persona encargada de inventario, dueño de tienda, operador administrativo. |
| Valor clave | Stock consultable, editable, exportable e importable, con alertas y trazabilidad. |
| Restricción base | No habrá login en la primera versión. La API key de OpenRouter se mantiene en backend. |
| Resultado esperado | Aplicación funcional para crear, consultar, actualizar, desactivar y auditar productos y variantes. |

---

## Alcance funcional

| Área | Incluye |
|---|---|
| Inventario | Ver, buscar, filtrar, crear, editar, desactivar y actualizar productos y variantes. |
| Productos | ID, nombre, categoría, descripción, stock, precios, proveedor, ubicación, fechas y estado. |
| Variantes | Stock por variación: talla, color, material, diseño, tamaño u otros atributos flexibles. |
| Proveedores | Registro y asociación con productos. |
| Alertas | Alertas cuando stock actual ≤ stock mínimo. |
| Historial | Registro de movimientos: entrada, salida, ajuste, edición, desactivación, importación, chatbot. |
| Importación | Carga masiva desde CSV o Excel. |
| Exportación | Salida en CSV, Excel y PDF. |
| Chatbot | Consulta y acciones sobre inventario mediante OpenRouter (backend seguro). |
| Diseño | Soft UI / neumorphism ligero + glassmorphism suave, paleta morado-lavanda-rosado. |

---

## Fuera de alcance — v1.0

| No incluido | Motivo |
|---|---|
| Login completo | No se implementa autenticación en el MVP. |
| Imágenes de producto | No contemplado en el alcance definido. |
| POS completo | No es caja registradora; solo salidas de stock. |
| Multi-sucursal avanzado | Ubicación como campo simple; sucursales complejas son evolución posterior. |
| Roles y permisos | No hay usuarios ni roles en v1.0. |

---

## Principio de diseño

La app debe sentirse ligera, moderna y administrativa sin sacrificar claridad: tarjetas suaves, fondo lavanda, acentos morados y rosados, bordes redondeados y transparencia moderada.

---

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| Dashboard | Indicadores clave, alertas y últimos movimientos. |
| Inventario | Tabla principal con búsqueda, filtros, ordenamiento y acciones. |
| Producto | Crear, editar, desactivar, ver detalle e historial. |
| Variantes | Atributos flexibles, stock, stock mínimo, ubicación y estado. |
| Proveedores | Registro y asociación con productos. |
| Movimientos | Historial de entradas, salidas, ajustes y acciones del chatbot. |
| Importar | CSV/Excel con previsualización, validación y confirmación. |
| Exportar | CSV, Excel y PDF del inventario filtrado o completo. |
| Chatbot | Consultas y acciones confirmadas vía OpenRouter. |
| Configuración | Moneda, categorías, modelo IA y preferencias visuales. |

---

## Versión del MVP recomendado

| ID | Entregable |
|---|---|
| MVP-1 | Dashboard básico con métricas y alertas. |
| MVP-2 | CRUD de productos. |
| MVP-3 | Variantes con stock y stock mínimo. |
| MVP-4 | Proveedores. |
| MVP-5 | Historial de movimientos. |
| MVP-6 | Import/export CSV y Excel. |
| MVP-7 | Chatbot con consultas y acciones confirmadas. |
| MVP-8 | Validaciones y reglas de negocio completas. |

---

## Decisiones pendientes

| Decisión | Pregunta |
|---|---|
| Uso de la app | ¿Local, red interna o pública en internet? |
| Base de datos | ¿SQLite, Supabase o PostgreSQL? |
| Moneda | ¿USD, CRC u otra? |
| Ventas | ¿Solo salidas de stock o módulo de ventas completo? |
| PIN crítico | ¿Se agrega PIN para acciones críticas sin login? |
| Variantes | ¿Completamente flexibles o plantilla por categoría? |
| Modelo OpenRouter | ¿Qué modelo y presupuesto? |
