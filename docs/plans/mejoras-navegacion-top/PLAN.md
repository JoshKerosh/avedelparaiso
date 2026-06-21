# Plan: Mejoras de navegación — "página top" (Ave del Paraíso)

## Contexto

La tienda funciona, pero la navegación tiene huecos que la hacen sentir "amateur":
el enlace **Admin** es visible para cualquier visitante público, no hay forma de
**cerrar sesión**, no se marca la **página activa**, la UI está en **inglés** mientras
los precios/metadatos están en **español**, y **no existe footer**. El objetivo es
elevar toda la navegación pública (y la coherencia con el panel admin) a un nivel
profesional, manteniendo el stack actual (Next 16 App Router, Tailwind, NextAuth) y sin
introducir librerías nuevas.

El usuario eligió: **alcance "Todo (top completo)"** e **idioma español** para toda la UI.

### Estado actual (importante)
- Rama de trabajo: **`feature/mejoras-navegacion-top`** (creada desde `master`).
- `components/Navigation.tsx` está en su **estado original** (un intento previo de edición no
  se conservó al cambiar de rama). Se implementa desde cero en la Fase 1.
- El plan se divide en **4 fases**, cada una con su archivo y task list, más `PROGRESS.md`
  para llevar la continuidad:
  - `FASE-1-navbar-layout-footer.md`
  - `FASE-2-catalogo-filtros.md`
  - `FASE-3-detalle-tarjetas-home.md`
  - `FASE-4-idioma-estados-admin.md`
  - `PROGRESS.md`
- Hallazgo: el catálogo público (`ProductFilters.tsx`) consume
  `/api/admin/categories/children/[parentId]`, que **no** tiene guard de auth, por lo que
  funciona para visitantes. Se deja funcionando, pero se documenta como deuda menor
  (idealmente exponer una ruta pública `/api/categories/...` reusando
  `getChildCategories` de `lib/products.ts:168`).

## Alcance y cambios por archivo

### 1. Navbar — `components/Navigation.tsx` (implementar desde cero)
Implementar:
- `Admin` solo visible si `status === 'authenticated'` (lista `LINKS` filtrada por `adminOnly`).
- Botón **Cerrar sesión** con `signOut({ callbackUrl: '/' })` (desktop + móvil).
- Página activa con `usePathname()` + `aria-current="page"` (subraya/resalta).
- Labels en español: **Inicio / Productos / Admin / Cerrar sesión**.
- Buscador en la navbar (desktop y móvil) que hace `router.push('/products?search=...')`
  y se sincroniza con `searchParams` cuando ya estás en `/products`.
- Menú móvil: `aria-expanded`, `aria-controls`, se cierra al cambiar de ruta.
- Brand mark "AP" con gradiente + texto "Ave del Paraíso".
- Refinamiento pendiente: el buscador usa `useSearchParams()`, lo que en Next 16 exige que
  el componente quede bajo un `<Suspense>` o se acepte el render dinámico. Verificar en el
  build (ver sección Verificación) y, si hace falta, envolver el `<Navigation />` o la parte
  del buscador en `Suspense`.

### 2. Footer — `components/Footer.tsx` (nuevo)
Componente de servidor (sin `'use client'`). Contenido:
- Columna marca: "Ave del Paraíso" + breve descripción.
- Columna enlaces rápidos: Inicio, Productos.
- Columna contacto/redes (placeholders: WhatsApp/Instagram/email — texto, sin lógica).
- Barra inferior: `© {año} Ave del Paraíso`. El año debe calcularse en servidor con
  `new Date().getFullYear()`.
- Estilos coherentes con la navbar (`bg-white dark:bg-gray-800`, borde superior).

### 3. Layout — `app/layout.tsx`
- `<html lang="es">` (hoy es `"en"`).
- **Skip link** "Saltar al contenido" como primer hijo de `<body>` (visible solo con foco):
  enlace a `#main`, clases `sr-only focus:not-sr-only ...`.
- `<main id="main">` para que el skip link tenga destino.
- Estructura flex de altura completa para que el `<Footer />` quede abajo:
  `body` → `flex flex-col min-h-screen`, `main` → `flex-1`, `<Footer />` al final dentro de
  los providers.

### 4. Catálogo — `app/products/page.tsx`
- Migas de pan (breadcrumb) arriba del `<h1>`: **Inicio / Productos** (reusar el patrón del
  detalle, `app/products/[id]/page.tsx:48`).
- Traducir a español: título "Todos los productos", "N producto(s) encontrado(s)",
  "No se encontraron productos.", paginación **Anterior / Siguiente / Página X de Y**,
  `aria-label="Paginación"`.

### 5. Detalle de producto — `app/products/[id]/page.tsx`
- Hacer **clicables** las categorías del breadcrumb y de la sección "Categoría":
  cada una enlaza a `/products?category1=<id>` (y `category2`/`category3` con los params
  correspondientes), reusando los `_id` ya presentes en `category1Id`/`category2Id`/`category3Id`.
- Traducir: "Disponibilidad", "unidades en stock", "Categoría", "Descripción",
  "Volver a productos".

### 6. Filtros — `components/ProductFilters.tsx`
- **Chips de filtros activos** encima de los controles: una "píldora" por cada filtro
  aplicado (búsqueda, categoría 1/2/3, orden ≠ newest) con botón "×" que lo quita
  llamando a `pushFilters({ ... : '' })`. Mostrar nombres de categoría (ya disponibles en
  `rootCategories`, `categories2`, `categories3`).
- Traducir labels: "Filtros", "Limpiar", "Buscar", "Buscar productos...", "Categoría",
  "Subcategoría", "Sub-subcategoría", "Todas...", "Ordenar por",
  "Más recientes / Precio: menor a mayor / Precio: mayor a menor / Nombre: A-Z".

### 7. Tarjeta y estado de stock
- `lib/product-ui.ts:15` `getStockStatus`: textos a español →
  "Agotado" / "Pocas unidades" / "Disponible".
- `components/ProductCard.tsx:38`: "N en stock" → "N disponibles".

### 8. Home — `app/page.tsx`
- Traducir: "Productos destacados", "Descubre nuestro inventario más reciente",
  "Aún no hay productos disponibles.", "Agrega tu primer producto →", "Ver todos los productos".

### 9. Páginas de estado (coherencia de idioma)
- `app/not-found.tsx`: "Página no encontrada", descripción, botones
  "Ir al inicio" / "Ver productos".
- `app/error.tsx`: "Algo salió mal", descripción, botón "Reintentar".

### 10. Coherencia con el panel admin (parte de "top completo")
- `app/admin/page.tsx`: traducir títulos visibles del dashboard
  ("Panel de administración", "Productos / Categorías / Configuración / Ver sitio", stats y
  tabla "Cambios de stock recientes"). Cambio cosmético, sin tocar lógica de datos.
- (Las demás páginas admin pueden traducirse en una pasada posterior; no son navegación
  pública. Se mencionan pero quedan como opcional para no inflar este cambio.)

## Archivos críticos
- `components/Navigation.tsx` (refinar) · `components/Footer.tsx` (nuevo)
- `app/layout.tsx` · `app/page.tsx` · `app/products/page.tsx` · `app/products/[id]/page.tsx`
- `components/ProductFilters.tsx` · `components/ProductCard.tsx` · `lib/product-ui.ts`
- `app/not-found.tsx` · `app/error.tsx` · `app/admin/page.tsx`

## Reutilización (no reinventar)
- Filtrado por categoría ya soportado vía query params (`lib/products.ts:43` `buildProductQuery`)
  → las categorías clicables solo construyen URLs `/products?categoryN=<id>`.
- Patrón de breadcrumb existente en el detalle → replicar en el catálogo.
- `pushFilters`/`clearFilters` ya existen en `ProductFilters` → los chips solo los invocan.
- `getChildCategories` (`lib/products.ts:168`) disponible si se decide la ruta pública (deuda).

## Verificación (end-to-end)
1. `npm run lint` y `npm run build` — confirmar que no rompe el uso de `useSearchParams()`
   en la navbar (si el build exige Suspense, envolver y reconstruir).
2. `npm run dev` y probar manualmente (Playwright MCP disponible):
   - **Sin sesión**: la navbar NO muestra "Admin" ni "Cerrar sesión"; sí muestra footer y
     skip link (con Tab). Buscar desde la navbar lleva a `/products?search=...`.
   - **Con sesión** (login `admin/admin`, `npm run seed` si hace falta): aparece "Admin",
     badge y "Cerrar sesión"; el botón cierra sesión y redirige a `/`.
   - **Página activa**: navegar Inicio/Productos/Admin resalta el link correcto.
   - **Catálogo**: breadcrumb visible; aplicar filtros muestra chips; quitar un chip
     actualiza la URL y la grilla; paginación en español.
   - **Detalle**: clic en una categoría navega a `/products?categoryN=<id>` y filtra.
   - **Responsive**: menú móvil abre/cierra, se cierra al navegar, buscador móvil funciona.
   - **Dark mode**: navbar, footer y chips se ven bien en claro y oscuro.
3. Revisar consola del navegador sin errores de hidratación (`suppressHydrationWarning`
   ya está en `<html>`).

## Fuera de alcance
- Carrito/checkout, i18n con librería, login social, rediseño visual mayor.
- Mover `/api/admin/categories/children` a ruta pública (deuda documentada, opcional).
