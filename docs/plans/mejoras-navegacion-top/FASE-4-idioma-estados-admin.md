# Fase 4 — Coherencia de idioma: páginas de estado y panel admin

> Parte del plan [PLAN.md](./PLAN.md). Estado y continuidad en [PROGRESS.md](./PROGRESS.md).

## Objetivo
Eliminar el inglés residual para que toda la experiencia sea coherente en español:
páginas de estado (404 / error) y dashboard admin.

## Archivos
- `app/not-found.tsx` (ajustar)
- `app/error.tsx` (ajustar)
- `app/admin/page.tsx` (ajustar — solo textos visibles)

## Detalle técnico

### 404 (`app/not-found.tsx`)
- "Page not found" → "Página no encontrada".
- Descripción → "La página o el producto que buscas no existe.".
- Botones → "Ir al inicio" / "Ver productos".

### Error (`app/error.tsx`)
- "Something went wrong" → "Algo salió mal".
- Descripción → "Ocurrió un error inesperado. Inténtalo de nuevo.".
- Botón "Try again" → "Reintentar".

### Dashboard admin (`app/admin/page.tsx`) — solo textos, sin tocar lógica
- "Admin Dashboard" → "Panel de administración"; "Manage your inventory" → "Gestiona tu inventario".
- Tarjetas: Products/Categories/Settings/View Site →
  "Productos"/"Categorías"/"Configuración"/"Ver sitio" (y sus subtítulos).
- Stats: "Total Products"/"Low Stock Items"/"Out of Stock" →
  "Total de productos"/"Bajo stock"/"Agotados".
- Alertas y tabla "Recent Stock Changes" → "Cambios de stock recientes"
  (encabezados Product/Change/Reason/Date → Producto/Cambio/Motivo/Fecha; mensajes y toasts).
- `toLocaleDateString()` → `toLocaleDateString('es-CR')`.

> Nota: el resto del panel admin (products, categories, settings) puede traducirse en una
> pasada futura; queda fuera del alcance de navegación de este plan.

## Task list
- [ ] Traducir `app/not-found.tsx`.
- [ ] Traducir `app/error.tsx`.
- [ ] Traducir textos visibles de `app/admin/page.tsx` (incluye toasts y formato de fecha).
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Verificar manualmente (ver abajo).

## Verificación
- Visitar una URL inexistente → 404 en español con botones funcionales.
- Forzar un error (o revisar el copy) → mensaje en español; "Reintentar" funciona.
- Dashboard admin completamente en español; fechas en formato es-CR.
- Dark mode correcto.
