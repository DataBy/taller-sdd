# PLAN-00 — Visión y Alcance

**Spec:** SPEC-00  
**Estado:** En revisión  
**Dependencias:** Ninguna — es la base de todo  
**Bloquea:** PLAN-01, PLAN-02, PLAN-03

---

## Objetivo del plan

Cerrar formalmente la visión del producto, validar el alcance del MVP y resolver las decisiones pendientes que bloquean el resto de las specs. Este plan no produce código; produce decisiones documentadas y aceptadas.

---

## Fases

### Fase 1 — Revisión del Project Chart
- Leer y revisar SPEC-00 completo con el equipo o stakeholder.
- Confirmar que el objetivo principal, usuarios previstos y restricciones base son correctos.
- Marcar cada sección como: aprobada / requiere ajuste / en discusión.

### Fase 2 — Cierre de decisiones pendientes

| Decisión | Acción requerida |
|---|---|
| Uso de la app | Definir: ¿local, red interna o pública? Registrar decisión en SPEC-00. |
| Base de datos | Una vez definido el uso, elegir SQLite (local) o Supabase/PostgreSQL (web). |
| Moneda | Confirmar moneda principal. Si no hay certeza, dejar USD como default. |
| Ventas | Confirmar: solo salidas de stock o módulo de ventas. Ajustar alcance si cambia. |
| PIN crítico | Decidir si se agrega PIN para acciones sin login. Documentar en constitución si aplica. |
| Variantes | Confirmar: flexibles (JSON libre) o plantillas por categoría. |
| Modelo OpenRouter | Elegir modelo inicial (ej. openai/gpt-4o-mini) y definir límite de uso estimado. |

### Fase 3 — Actualización de documentos
- Actualizar SPEC-00 con las decisiones tomadas, eliminando los `[PENDIENTE]`.
- Actualizar la constitución (`.specify/memory/constitution.md`) si alguna decisión agrega o modifica principios.
- Actualizar `CLAUDE.md` con el stack técnico confirmado.

### Fase 4 — Aprobación formal
- Revisar SPEC-00 final con el responsable del proyecto.
- Marcar el estado de SPEC-00 como **Aprobado**.
- Notificar que PLAN-01 puede iniciarse.

---

## Criterio de salida

- Todas las decisiones pendientes tienen respuesta documentada.
- SPEC-00 está marcada como Aprobado.
- La constitución y CLAUDE.md reflejan el stack y uso definitivos.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| No se cierra la decisión de base de datos. | Bloquea PLAN-03 y PLAN-04. Escalar antes de avanzar. |
| El alcance crece después de aprobado. | Todo cambio de alcance requiere actualizar SPEC-00 y re-aprobar antes de continuar. |
