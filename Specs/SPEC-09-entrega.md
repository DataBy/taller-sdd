# SPEC-09 — Entrega

**Estado:** Pendiente  
**Criterio de salida:** App lista para uso  
**Fase:** 6

---

## Criterios de entrega del MVP

La entrega se considera completa cuando todos los ítems de esta lista están verificados.

### Funcionalidad

- [ ] Dashboard muestra métricas reales del inventario.
- [ ] CRUD de productos funcional con validaciones.
- [ ] CRUD de variantes funcional con validaciones.
- [ ] Búsqueda y filtros operativos en el módulo de inventario.
- [ ] Alertas de stock bajo visibles en dashboard e inventario.
- [ ] Historial de movimientos registra todos los cambios relevantes.
- [ ] Importación de CSV y Excel con previsualización, validación y confirmación.
- [ ] Exportación a CSV, Excel y PDF respetando filtros activos.
- [ ] Chatbot responde consultas de stock correctamente.
- [ ] Chatbot ejecuta acciones solo tras confirmación explícita del usuario.
- [ ] Configuración permite cambiar moneda, modelo IA y categorías.

### Seguridad

- [ ] La API key de OpenRouter no aparece en ningún response del frontend.
- [ ] El backend rechaza acciones del chatbot sin confirmación.
- [ ] El backend rechaza stock negativo independientemente del origen.
- [ ] Las importaciones no se aplican sin batch confirmado.

### Calidad visual

- [ ] Paleta morado-lavanda-rosado aplicada consistentemente.
- [ ] Todos los estados vacíos tienen mensaje amigable.
- [ ] Todos los formularios tienen validación visible en tiempo real.
- [ ] Las confirmaciones muestran resumen claro antes de ejecutar.
- [ ] La interfaz es usable en pantallas de escritorio.

### Datos iniciales

- [ ] Categorías iniciales cargadas: Llaveros, Imanes, Camisetas, Tazas, Artesanías, Pulseras.
- [ ] Configuración inicial cargada: moneda, modelo IA por defecto.
- [ ] Datos de ejemplo cargados (opcional para demo).

### Documentación mínima

- [ ] README con instrucciones de instalación y arranque local.
- [ ] Variables de entorno documentadas en `.env.example`.
- [ ] Instrucciones de importación: formato esperado del CSV/Excel.
- [ ] Instrucciones de configuración del modelo OpenRouter.

---

## Checklist de regresión final

Antes de entregar, verificar que los siguientes flujos principales funcionan de extremo a extremo:

| Flujo | Verificado |
|---|---|
| Crear producto con variantes → ver en inventario → ajustar stock → ver en historial. | [ ] |
| Desactivar producto → verificar que no aparece en inventario activo → historial conservado. | [ ] |
| Importar CSV con datos válidos y errores → confirmar solo válidos → ver en inventario. | [ ] |
| Exportar inventario filtrado a PDF → verificar que solo contiene lo filtrado. | [ ] |
| Chatbot consulta de stock → respuesta sin confirmación. | [ ] |
| Chatbot solicitud de ajuste de stock → motivo → confirmación → historial actualizado. | [ ] |
| OpenRouter no responde → inventario sigue operable manualmente. | [ ] |

---

## Fases posteriores (fuera del MVP)

| Evolución | Descripción |
|---|---|
| Login y roles | Administrador, operador, solo lectura. |
| Ventas completas | Tickets, clientes, reportes de margen y reducción automática de stock. |
| Multi-sucursal | Inventario por tienda o almacén. |
| Reportes avanzados | Rotación, rentabilidad, productos lentos, valor por categoría. |
| Código de barras | SKU escaneable para búsqueda y actualización rápida. |
| Backups | Exportación programada o respaldo automático. |
| App móvil | Versión adaptada para uso en tienda física. |

---

## Riesgos mitigados en entrega

| Riesgo | Mitigación aplicada |
|---|---|
| Sin login | App corriendo en red interna o acceso restringido por URL no pública. |
| API key expuesta | Backend proxy + variables de entorno verificadas antes de despliegue. |
| Chatbot modifica mal | Confirmaciones obligatorias + validación server-side verificadas en TC-C. |
| Importaciones corruptas | Previsualización + rollback + ImportBatch verificados en TC-I. |
| Stock inconsistente | Historial obligatorio verificado en todos los flujos de mutación. |
