# Fase 1 — Bug real: modal de reducir stock triplicado

## Context

En `app/admin/products/page.tsx`, los modales `showReduceModal` ("Reduce Stock") y
`showConfirmReduce` ("Confirm Reduction") están renderizados **dentro del
`products.map(...)`**, en el `<td>` de la columna de stock. Con N productos se montan N
overlays `fixed inset-0 z-50` idénticos y apilados.

No es solo cosmético: los overlays superpuestos **interceptan los eventos de puntero**, de
modo que el botón Accept de las filas inferiores queda bloqueado. Confirmado en la
verificación con Playwright: el primer clic a Accept fue interceptado y solo respondió el
modal de la última fila renderizada.

## Objetivo

Que exista **una sola instancia** de cada modal, controlada por estado, sin overlays
apilados ni interceptación de clics — replicando el patrón ya correcto de los otros dos
modales del mismo archivo.

## Archivo a modificar

- `app/admin/products/page.tsx`

## Cambios

1. **Cortar** los dos bloques JSX condicionales de dentro del `<td>` de stock
   (actualmente justo después del botón `−`, aprox. líneas 384-430 del archivo actual):
   - `{showReduceModal && reduceProduct && ( ... )}`
   - `{showConfirmReduce && ( ... )}`
2. **Pegarlos** a nivel de componente, en el bloque de retorno donde ya viven los otros
   modales: después del contenedor `</table>` y junto a `{showModal && (...)}` y
   `{showHistoryModal && (...)}`, antes del cierre `</ProtectedRoute>`.
3. El botón `−` conserva intacto su `onClick={() => openReduceModal(product)}`.

**No se tocan** estado ni handlers: `showReduceModal`, `showConfirmReduce`, `reduceProduct`,
`reduceAmount`, `reduceReason`, `reduceNotes`, `openReduceModal` y `handleReduceStock` ya
están a nivel de componente. Solo se reubica el JSX.

## Patrón de referencia (en el mismo archivo)

Los modales `showModal` (add/edit) y `showHistoryModal` ya están fuera del `map`, como
instancia única. Replicar exactamente esa ubicación.

## Verificación

Con el dev server corriendo y sesión admin activa, vía Playwright:
1. `/admin/products` → clic en `−` de la **primera** fila → "Reduce Stock" aparece **una
   sola vez** (antes se repetía en cada fila).
2. Accept → "Confirm Reduction" aparece una vez y Confirm responde **sin** interceptación.
3. Confirmar → el stock baja en 1 y el modal se cierra.
4. Repetir `−` en otra fila para confirmar que no hay overlays apilados.

## Criterios de aceptación

- [ ] Un solo modal "Reduce Stock" en el DOM al abrirlo (no uno por fila).
- [ ] El botón Accept/Confirm responde en cualquier fila sin TimeoutError de puntero.
- [ ] La reducción de stock sigue creando su registro en el historial.
- [ ] `npx tsc --noEmit` limpio.
