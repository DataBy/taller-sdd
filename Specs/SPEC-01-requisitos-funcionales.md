# SPEC-01 — Requisitos Funcionales

**Estado:** Pendiente  
**Criterio de salida:** Lista de requisitos y criterios de aceptación completos  
**Fase:** 1

---

## Reglas de negocio

| Regla | Criterio |
|---|---|
| Stock negativo | No se permite guardar stock menor que 0. |
| Stock bajo | Variante o producto en stock bajo si stock actual ≤ stock mínimo. |
| Producto agotado | Un producto está agotado si su stock total o todas sus variantes están en 0. |
| Producto descontinuado | Eliminación lógica: se cambia estado a descontinuado; no se borra de la base. |
| Edición con historial | Toda actualización relevante genera entrada en el historial. |
| Importación segura | Ninguna importación se aplica sin validación y confirmación previa. |
| Chatbot con confirmación | Consultas: respuesta directa. Crear, editar, actualizar stock o desactivar: requiere confirmación. |
| Precios | Precio de compra y venta deben ser números positivos o cero. |
| Proveedor | Un producto puede tener proveedor asignado; si no existe se puede crear o dejar pendiente. |
| Ubicación | La ubicación puede estar a nivel de producto o variante. |

---

## Catálogo de productos

| Campo | Regla |
|---|---|
| ID | Identificador único interno, generado automáticamente. |
| Nombre | Nombre visible del producto. |
| Categoría | Llaveros, imanes, camisetas, tazas, artesanías, pulseras u otras. |
| Descripción | Texto corto sobre el producto. |
| Stock actual | Si hay variantes, se calcula desde las variantes activas. |
| Stock mínimo | Umbral para alerta de stock bajo. |
| Precio de compra | Costo unitario para calcular inversión o margen. |
| Precio de venta | Precio final o sugerido de venta. |
| Proveedor | Proveedor asociado al producto. |
| Ubicación | Lugar físico donde se encuentra el producto o variante. |
| Fecha de creación | Fecha de alta del producto. |
| Última actualización | Fecha del último cambio. |
| Estado | Activo, agotado o descontinuado. |

### Categorías iniciales

| Categoría | Notas |
|---|---|
| Llaveros | Por diseño o material. |
| Imanes | Por diseño o colección. |
| Camisetas | Requieren variantes de talla y color. |
| Tazas | Pueden variar por diseño, tamaño o material. |
| Artesanías | Pueden variar por tipo, material, autor o tamaño. |
| Pulseras | Pueden variar por color, material o talla. |

---

## Modelo de variantes

| Regla | Definición |
|---|---|
| Variante flexible | Cada producto puede definir atributos propios (talla, color, material, diseño, tamaño). |
| Stock por variante | Cada variante mantiene su stock actual y stock mínimo. |
| SKU o código | Recomendado para distinguir variantes y facilitar import/export. |
| Unicidad | No debe existir variante duplicada para el mismo producto con los mismos atributos. |
| Agotado | Variante con stock 0 queda agotada. Si todas las variantes están en 0, el producto queda agotado. |

---

## Requisitos funcionales por módulo

### Dashboard
- **RF-01** El sistema DEBE mostrar total de productos activos.
- **RF-02** El sistema DEBE mostrar total de variantes.
- **RF-03** El sistema DEBE mostrar productos y variantes con stock bajo.
- **RF-04** El sistema DEBE mostrar productos agotados.
- **RF-05** El sistema DEBE mostrar valor estimado de compra y venta del inventario.
- **RF-06** El sistema DEBE mostrar los últimos movimientos de stock.

### Inventario
- **RF-07** El sistema DEBE listar todos los productos con paginación u scroll.
- **RF-08** El usuario DEBE poder buscar por nombre, categoría, proveedor o variante.
- **RF-09** El usuario DEBE poder filtrar por estado, categoría, proveedor y stock bajo.
- **RF-10** El usuario DEBE poder ordenar por nombre, stock, precio o fecha.

### Producto
- **RF-11** El usuario DEBE poder crear un producto con todos sus campos.
- **RF-12** El usuario DEBE poder editar un producto activo.
- **RF-13** El usuario DEBE poder desactivar un producto (cambio a descontinuado).
- **RF-14** El sistema DEBE registrar historial en cada cambio relevante del producto.
- **RF-15** El usuario DEBE poder ver el detalle completo de un producto con sus variantes e historial.

### Variantes
- **RF-16** El usuario DEBE poder agregar variantes a un producto con atributos flexibles.
- **RF-17** El usuario DEBE poder editar stock, stock mínimo y ubicación de una variante.
- **RF-18** El sistema DEBE calcular el stock total del producto sumando variantes activas.

### Proveedores
- **RF-19** El usuario DEBE poder registrar un proveedor con nombre, teléfono, correo, dirección y notas.
- **RF-20** El usuario DEBE poder asociar un proveedor a uno o más productos.

### Historial / Movimientos
- **RF-21** El sistema DEBE registrar cada entrada, salida, ajuste, edición, desactivación e importación.
- **RF-22** Cada movimiento DEBE contener: tipo, cantidad, stock anterior, stock nuevo, motivo, producto, variante, origen y fecha.

### Importación
- **RF-23** El usuario DEBE poder cargar un archivo CSV o Excel.
- **RF-24** El sistema DEBE mostrar previsualización con filas válidas, advertencias y errores.
- **RF-25** El sistema DEBE validar campos obligatorios, precios, stock negativo, duplicados y categorías desconocidas.
- **RF-26** La importación NO DEBE aplicarse hasta que el usuario confirme.
- **RF-27** Toda importación DEBE generar un registro de ImportBatch en historial.

### Exportación
- **RF-28** El usuario DEBE poder exportar el inventario filtrado o completo en CSV.
- **RF-29** El usuario DEBE poder exportar en Excel.
- **RF-30** El usuario DEBE poder exportar en PDF.
- **RF-31** La exportación DEBE respetar los filtros activos en el momento de exportar.

### Chatbot
- **RF-32** El chatbot DEBE poder responder consultas de stock por producto, categoría, proveedor, ubicación o variante.
- **RF-33** El chatbot DEBE poder listar productos o variantes con stock bajo.
- **RF-34** El chatbot DEBE poder proponer la creación de un producto mostrando resumen antes de confirmar.
- **RF-35** El chatbot DEBE poder proponer actualizaciones de campos específicos mostrando valor anterior y nuevo.
- **RF-36** El chatbot DEBE poder registrar movimientos de stock con motivo y confirmación previa.
- **RF-37** El chatbot DEBE poder desactivar un producto con advertencia y confirmación.
- **RF-38** El chatbot DEBE poder mostrar historial de movimientos de un producto o variante.
- **RF-39** La API key de OpenRouter NUNCA debe estar expuesta en el frontend.

### Configuración
- **RF-40** El usuario DEBE poder configurar la moneda del sistema.
- **RF-41** El usuario DEBE poder administrar categorías visibles.
- **RF-42** El usuario DEBE poder configurar el modelo de OpenRouter a usar.

---

## Criterios de aceptación

| Área | Criterio |
|---|---|
| Productos | Dado un formulario válido, cuando se guarda, entonces el producto queda activo y visible en inventario. |
| Productos | Dado un producto activo, cuando se desactiva, entonces queda descontinuado y no se borra su historial. |
| Variantes | Dado un producto con variantes, cuando se consulta stock total, entonces se suma el stock de todas sus variantes activas. |
| Stock | Dado stock actual ≤ stock mínimo, cuando se visualiza inventario, entonces se muestra alerta de stock bajo. |
| Historial | Dado un ajuste de stock, cuando se confirma, entonces se registra cantidad anterior, nueva cantidad, motivo y fecha. |
| Búsqueda | Dado un texto, cuando coincide con nombre, categoría, proveedor o variante, entonces el resultado aparece filtrado. |
| Importación | Dado un archivo con errores, cuando se previsualiza, entonces no se aplica hasta corregir o confirmar solo filas válidas. |
| Exportación | Dado un filtro aplicado, cuando se exporta, entonces el archivo respeta el filtro seleccionado. |
| Chatbot consulta | Dada una pregunta de stock, cuando existe información suficiente, entonces responde con productos y cantidades verificables. |
| Chatbot acción | Dada una solicitud de crear, editar, ajustar stock o desactivar, cuando falta confirmación, entonces no modifica datos. |

---

## Requisitos no funcionales

| Atributo | Requisito |
|---|---|
| Seguridad | La clave de OpenRouter no debe estar en el frontend. Las acciones del chatbot se validan en backend. |
| Usabilidad | Crear o actualizar productos requiere pocos pasos, con mensajes de error claros. |
| Rendimiento | Búsqueda, filtros y carga de tabla responden rápido en inventarios pequeños y medianos. |
| Confiabilidad | Cada cambio de stock queda registrado en historial. |
| Mantenibilidad | Separar lógica de inventario, interfaz, datos e integración IA. |
| Accesibilidad | Contraste suficiente, navegación por teclado y formularios etiquetados. |
| Portabilidad | El stack permite correr localmente o desplegarse en web. |
| Resiliencia | Si OpenRouter falla, el inventario sigue funcionando manualmente. |
| Validación | Todas las entradas de usuario e importaciones se validan antes de persistir. |
| Auditoría | Historial de movimientos y acciones IA conserva trazabilidad básica. |
