# PLAN-09 — Entrega

**Spec:** SPEC-09  
**Estado:** Pendiente  
**Dependencias:** PLAN-08 completo (MVP funcional)  
**Bloquea:** Nada — es la fase final

---

## Objetivo del plan

Definir el proceso de cierre del MVP: verificación final, datos iniciales, documentación mínima y criterios de aceptación de entrega. Sin código nuevo; solo validación, documentación y empaquetado.

---

## Fases

### Fase 1 — Verificación funcional completa

Ejecutar el checklist de regresión final de SPEC-09 en el orden definido:

| Flujo | Pasos |
|---|---|
| Flujo de producto completo | Crear producto con variantes → ver en inventario → ajustar stock → ver en historial. |
| Flujo de desactivación | Desactivar producto → no aparece en inventario activo → historial conservado. |
| Flujo de importación | Cargar CSV con errores → previsualizar → confirmar solo válidos → ver en inventario. |
| Flujo de exportación | Aplicar filtro → exportar CSV, Excel y PDF → verificar contenido de cada archivo. |
| Flujo de chatbot (consulta) | Preguntar stock → respuesta correcta sin confirmación. |
| Flujo de chatbot (acción) | Solicitar ajuste de stock → motivo → confirmación → historial actualizado. |
| Resiliencia OpenRouter | Simular fallo de OpenRouter → inventario sigue operable manualmente. |

Registrar resultado de cada flujo con fecha y evidencia.

### Fase 2 — Verificación de seguridad

| Verificación | Método |
|---|---|
| API key no en frontend | Inspeccionar responses del navegador (DevTools → Network). Confirmar que no aparece en ningún response. |
| Acciones sin confirmación rechazadas | Enviar POST /chat/confirm con actionId inválido → debe devolver error. |
| Stock negativo rechazado por API | Enviar PATCH de stock con valor negativo directamente a la API → debe devolver error 422. |
| Importación sin confirmar batch | Enviar POST /import/confirm con batchId inexpirado no confirmado → debe rechazarse. |

### Fase 3 — Carga de datos iniciales

Verificar que los datos de arranque están cargados:

| Dato | Estado esperado |
|---|---|
| Categorías iniciales | Llaveros, Imanes, Camisetas, Tazas, Artesanías, Pulseras — presentes en el sistema. |
| Configuración inicial | Moneda definida, modelo IA configurado. |
| Datos de ejemplo (opcional) | Si se acordó cargar datos de demo, verificar que están presentes. |

### Fase 4 — Documentación mínima

Verificar que los siguientes documentos existen y son correctos:

| Documento | Contenido mínimo |
|---|---|
| `README.md` | Descripción del proyecto, requisitos previos, instrucciones de instalación y arranque local. |
| `.env.example` | Todas las variables de entorno necesarias con descripción de cada una. |
| Guía de importación | Formato esperado del CSV/Excel, columnas, ejemplos y errores comunes. Puede ir en README o en la app. |
| Guía de configuración | Cómo configurar el modelo de OpenRouter y la moneda. |

### Fase 5 — Revisión de UX final

Recorrer la aplicación como usuario nuevo y verificar:

| Aspecto | Verificación |
|---|---|
| Primera impresión | El dashboard comunica el estado del inventario de forma inmediata. |
| Estados vacíos | Cada pantalla sin datos muestra mensaje amigable y acción sugerida. |
| Mensajes de error | Los errores de formulario son claros y apuntan al campo correcto. |
| Confirmaciones | Las tarjetas de confirmación (producto, chatbot, importación) muestran resumen claro. |
| Paleta y diseño | Colores, sombras y espaciado consistentes con SPEC-02. |
| Accesibilidad | Navegación por teclado funcional en formularios principales. |

### Fase 6 — Decisión de despliegue

Antes de entregar, confirmar:

| Decisión | Opción |
|---|---|
| Uso de la app | ¿Local (npm run dev/start), servidor interno o desplegado en web? |
| Base de datos | ¿Archivo SQLite local o Supabase/PostgreSQL? |
| Variables de entorno | ¿Configuradas en `.env` local o en panel de la plataforma de despliegue? |
| URL de acceso | ¿`localhost:3000`, IP de red interna, o dominio público? |

Documentar la decisión final y los pasos exactos para arrancar la app desde cero.

### Fase 7 — Aprobación formal del MVP

- El responsable del proyecto revisa la app funcionando.
- Se ejecutan los flujos del checklist de regresión en su presencia o con evidencia.
- Se firma (o registra) la aprobación del MVP.
- SPEC-09 se marca como **Aprobado**.
- El proyecto entra en modo mantenimiento hasta que se inicie una fase posterior.

---

## Entregables del plan

- Checklist de regresión final ejecutado y documentado.
- Verificación de seguridad completada.
- Datos iniciales cargados y verificados.
- Documentación mínima publicada en el repositorio.
- Decisión de despliegue documentada con pasos de arranque.

---

## Criterio de salida

- Todos los flujos de regresión pasan sin errores críticos.
- La app cumple los criterios de seguridad definidos.
- El README permite a una persona nueva arrancar la app en menos de 10 minutos.
- SPEC-09 marcada como **Aprobado**.

---

## Fases posteriores (fuera del MVP)

Una vez entregado el MVP, las siguientes fases quedan registradas para evolución futura:

| Fase | Descripción |
|---|---|
| v1.1 | Login con PIN simple para acciones críticas. |
| v1.2 | Ventas: registro de tickets y reducción automática de stock. |
| v2.0 | Login completo con roles: administrador, operador, solo lectura. |
| v2.1 | Multi-sucursal: inventario por tienda o almacén. |
| v2.2 | Reportes avanzados: rotación, rentabilidad, productos lentos. |
| v3.0 | App móvil para uso en tienda física. |
