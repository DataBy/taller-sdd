# SPEC-08 — Implementación

**Estado:** Pendiente (inicia solo cuando SPEC-01 a SPEC-07 estén aceptadas)  
**Criterio de salida:** MVP funcional  
**Fase:** 6

---

> Esta fase no se inicia hasta que las especificaciones críticas (SPEC-01, SPEC-02, SPEC-03, SPEC-04, SPEC-05) estén cerradas y aceptadas, y las decisiones pendientes estén resueltas.

---

## Prerequisitos antes de programar

| Decisión | Estado |
|---|---|
| Uso de la app (local / intranet / web) | [PENDIENTE] |
| Base de datos (SQLite / Supabase / PostgreSQL) | [PENDIENTE] |
| Moneda principal | [PENDIENTE] |
| Modelo de OpenRouter | [PENDIENTE] |
| Variantes (flexibles / plantilla por categoría) | [PENDIENTE] |
| PIN para acciones críticas | [PENDIENTE] |

---

## Stack técnico confirmado

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | Next.js o React | Por confirmar |
| Estilos | Tailwind CSS | Por confirmar |
| Backend | API routes / Node.js | Por confirmar |
| Base de datos | SQLite / Supabase / PostgreSQL | [PENDIENTE] |
| IA | OpenRouter (backend proxy) | Por confirmar |
| Export PDF | Librería por definir (ej. pdfkit, jsPDF) | Por confirmar |
| Export Excel | Librería por definir (ej. exceljs, xlsx) | Por confirmar |

---

## Orden de implementación por módulos (MVP)

### Fase A — Infraestructura base
1. Setup del proyecto (Next.js / React + Tailwind).
2. Configuración de base de datos y ORM.
3. Estructura de carpetas: frontend, backend/api, db.
4. Variables de entorno base (DB, OpenRouter key).
5. Diseño del sistema de tokens visuales (paleta, tipografía, componentes base).

### Fase B — Datos y API core
6. Migraciones / esquema inicial: Product, Variant, Category, Supplier, InventoryMovement.
7. CRUD completo de Categorías.
8. CRUD completo de Proveedores.
9. CRUD completo de Productos (con validaciones de negocio).
10. CRUD de Variantes (con validaciones de unicidad y stock).
11. Endpoint de historial / movimientos.

### Fase C — Dashboard e Inventario
12. Dashboard con métricas y alertas.
13. Tabla de inventario con búsqueda, filtros y ordenamiento.
14. Vista de detalle de producto con variantes e historial.
15. Formularios de creación y edición de producto.
16. Formulario de creación y edición de variantes.

### Fase D — Import / Export
17. Módulo de importación: carga, validación, previsualización y confirmación.
18. Módulo de exportación: CSV, Excel y PDF con filtros.

### Fase E — Chatbot
19. Backend proxy para OpenRouter con system prompt del inventario.
20. Endpoint `/chat/message` con detección de intención.
21. Flujo de confirmación de acciones (`/chat/confirm`, `/chat/reject`).
22. UI del chatbot: panel lateral con historial y tarjetas de confirmación.
23. Registro de `ChatAction` y `InventoryMovement` vinculados.

### Fase F — Configuración y ajustes finales
24. Módulo de configuración (moneda, categorías, modelo IA).
25. Estados vacíos en todas las vistas.
26. Manejo de errores globales (frontend + backend).
27. Resiliencia: fallback cuando OpenRouter no responde.

---

## Reglas de implementación

- **No programar fuera de spec.** Si un caso no está cubierto en las specs, se detiene y se clarifica.
- **Validaciones en backend siempre.** El frontend puede validar para UX, pero el backend es la fuente de verdad.
- **Historial obligatorio.** Toda mutación de stock o estado genera `InventoryMovement`.
- **API key de OpenRouter solo en servidor.** Sin excepciones.
- **Sin borrado físico.** Solo cambio de estado a `discontinued`.
- **Confirmación del chatbot.** Toda acción pasa por el flujo `proposed → confirmed → executed`.

---

## Estructura de carpetas propuesta

```
taller-sdd/
├── frontend/           ← Next.js / React
│   ├── components/
│   ├── pages/ o app/
│   ├── styles/
│   └── lib/
├── backend/            ← API routes / Node.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── db/
├── shared/             ← Tipos y constantes compartidos
└── .env                ← Variables de entorno (nunca en git)
```

---

## Notas de entrega

- El MVP debe ser funcional y operable sin errores críticos en los flujos principales.
- Las validaciones de negocio deben pasar todos los casos de TC-P, TC-V, TC-S, TC-I, TC-E y TC-C definidos en SPEC-07.
- La UI debe coincidir con la paleta y estilo definidos en SPEC-02.
