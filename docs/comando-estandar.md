# Comando estándar — Flujo de desarrollo por fases

Procedimiento estándar para ejecutar planes divididos en fases en este repositorio.
Aplica a cualquier plan ubicado en `docs/plans/<nombre-del-plan>/`.

## Principios

1. **Rama dedicada.** Cada plan se trabaja en su propia rama (`feature/<nombre>`), creada
   desde `master`.

2. **Ejecución por fases.** El plan se divide en fases; cada fase tiene su archivo
   `FASE-N-*.md` con detalle técnico, **task list** y sección de verificación.

3. **Probar en cada fase.** Al terminar una fase, verificar que **la app sigue funcionando
   igual** (sin regresiones):
   - `npm run lint` sin errores.
   - `npm run build` exitoso.
   - Verificación manual de los puntos listados en el archivo de la fase
     (incl. dark mode y consola sin errores de hidratación cuando aplique).

4. **Commit por fase.** Al cerrar una fase y pasar la verificación, hacer un commit
   descriptivo. Los docs de planificación se commitean por separado antes de empezar.

5. **PROGRESS siempre actualizado.** Tras cada fase: actualizar `PROGRESS.md` (estado de la
   fase, hash de commit, bitácora con "hecho" y "siguiente paso").

6. **Gestión de gaps.**
   - Si durante una fase se encuentran **gaps** (problemas, deuda, cosas faltantes), crear/
     actualizar `GAPS.md` en la carpeta del plan **definiéndolos** (qué es, dónde, impacto,
     fase relacionada) para darles seguimiento.
   - **No se considera terminado** el plan hasta que los gaps abiertos estén resueltos: se
     continúa a la siguiente fase, pero se vuelve a los gaps hasta cerrarlos.
   - Los gaps que **no son solucionables dentro de estas fases de desarrollo** (requieren
     decisión de producto, infraestructura, dependencias externas, etc.) se mueven a
     `KNOWN-GAPS.md` como limitaciones conocidas con su justificación.

7. **Continuidad.** Se avanza fase por fase hasta el final, manteniendo `PROGRESS.md`,
   `GAPS.md` y `KNOWN-GAPS.md` como fuente de verdad para retomar sin contexto previo.

## Archivos por plan

| Archivo | Propósito |
|---------|-----------|
| `PLAN.md` | Plan maestro: contexto, alcance, archivos críticos, verificación global. |
| `FASE-N-*.md` | Detalle + task list + verificación de cada fase. |
| `PROGRESS.md` | Estado de fases, decisiones, bitácora. Se actualiza en cada fase. |
| `GAPS.md` | Gaps abiertos detectados durante el desarrollo, con seguimiento hasta cerrarse. |
| `KNOWN-GAPS.md` | Limitaciones conocidas no resolubles en estas fases (con justificación). |

## Definición de "hecho" (Definition of Done)

Una fase está **completada** cuando:
- [ ] Todas las tareas de su task list están marcadas.
- [ ] `npm run lint` y `npm run build` pasan.
- [ ] La verificación manual de la fase pasa (sin regresiones).
- [ ] Se hizo commit.
- [ ] `PROGRESS.md` quedó actualizado.
- [ ] Los gaps detectados se registraron en `GAPS.md` (o `KNOWN-GAPS.md`).

El **plan** está completado cuando todas las fases están ✅ y `GAPS.md` no tiene gaps
abiertos (los irresolubles viven documentados en `KNOWN-GAPS.md`).
