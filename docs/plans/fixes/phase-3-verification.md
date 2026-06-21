# Fase 3 — Verificación end-to-end

## Context

Tras aplicar las fases 1 y 2, se valida que ambos arreglos funcionan y que no hubo
regresiones en el resto de la app (login, dashboard, categorías, settings, ajuste de stock,
historial, tienda pública).

## Requisitos previos

- Dev server corriendo en http://localhost:3000 (`npm run dev`).
- Sesión admin activa en el navegador (login `admin` con la contraseña vigente).
- BD accesible (cluster de Atlas activo).

## Pasos de verificación (Playwright)

### Fix 1 — modal de stock
1. `/admin/products` → clic `−` en la **primera** fila → un único modal "Reduce Stock".
2. Accept → un único "Confirm Reduction"; Confirm responde sin interceptación de puntero.
3. Confirmar → stock −1 y modal cerrado.
4. Repetir `−` en otra fila (verificar ausencia de overlays apilados).
5. (Opcional) `+` para restaurar el stock.

### Fix 2 — badge home
1. `/` → un producto con `0 < stock <= lowStockThreshold` muestra **"Low Stock"** (amarillo).
2. Comparar con `/products`: mismo estado para el mismo producto.
3. Verificar estados límite: stock 0 → "Out of Stock"; stock alto → "In Stock".

### Regresión rápida (smoke)
- `/admin` → dashboard con métricas y historial.
- `/admin/categories` → expandir una categoría nivel 1 (carga de hijos en cascada).
- `/admin/settings` → hero banner visible.
- `/products` → búsqueda con debounce (p. ej. "anillo").
- `/products/[id]` → detalle con breadcrumb y carrusel.
- Revisar consola: **0 errores** en cada página.

## Type-check y lint

- `npx tsc --noEmit` → exit 0.
- `npm run lint` → sin errores nuevos.

## Criterios de aceptación

- [ ] Ambos fixes verificados visualmente con Playwright.
- [ ] 0 errores de consola en las páginas recorridas.
- [ ] `tsc` y `lint` limpios.
- [ ] (Opcional) commit + push de los cambios, según indique el usuario.
