# Fase 1 — Núcleo de navegación: navbar + layout + footer

> Parte del plan [PLAN.md](./PLAN.md). Estado y continuidad en [PROGRESS.md](./PROGRESS.md).

## Objetivo
Renovar la navegación global: navbar profesional (con auth, página activa, buscador,
español, móvil accesible), footer en todas las páginas y layout con skip link e idioma `es`.
Es la fase de mayor impacto visual y la base sobre la que se apoyan las demás.

## Archivos
- `components/Navigation.tsx` (reescribir — hoy está en estado original)
- `components/Footer.tsx` (nuevo)
- `app/layout.tsx` (ajustar)

## Detalle técnico

### Navbar (`components/Navigation.tsx`)
- Filtrar enlaces: `Admin` solo si `useSession().status === 'authenticated'`.
- Botón **Cerrar sesión** con `signOut({ callbackUrl: '/' })` (desktop + móvil).
- Página activa con `usePathname()` + `aria-current="page"` (resaltado/subrayado).
- Labels español: **Inicio / Productos / Admin / Cerrar sesión**.
- Buscador (desktop + móvil): `router.push('/products?search=<q>')`; sincronizar con
  `searchParams.get('search')` cuando `pathname === '/products'`.
- Menú móvil: `aria-expanded`, `aria-controls`, cierre automático al cambiar de ruta
  (`useEffect` sobre `pathname`).
- Brand mark "AP" (gradiente) + texto "Ave del Paraíso".
- ⚠️ `useSearchParams()` en Next 16 puede exigir `<Suspense>`. Si el build falla con
  "missing suspense boundary", envolver la parte que lo usa en `<Suspense>`.

### Footer (`components/Footer.tsx`)
- Componente de servidor (sin `'use client'`).
- 3 columnas: marca + descripción / enlaces rápidos (Inicio, Productos) / contacto-redes
  (placeholders de texto: WhatsApp, Instagram, email).
- Barra inferior: `© {new Date().getFullYear()} Ave del Paraíso`.
- Estilos coherentes con la navbar (`bg-white dark:bg-gray-800`, borde superior).

### Layout (`app/layout.tsx`)
- `<html lang="es">`.
- Skip link "Saltar al contenido" como primer hijo de `<body>` (`sr-only focus:not-sr-only`),
  apuntando a `#main`.
- `<main id="main" className="flex-1">`.
- `body` con `flex flex-col min-h-screen`; `<Footer />` al final dentro de los providers.

## Task list
- [ ] Reescribir `components/Navigation.tsx` (auth, logout, página activa, español, buscador, móvil).
- [ ] Crear `components/Footer.tsx` (server component, 3 columnas + copyright con año dinámico).
- [ ] Ajustar `app/layout.tsx` (`lang="es"`, skip link, `<main id="main">`, flex layout, `<Footer />`).
- [ ] Resolver `useSearchParams()` / Suspense si el build lo pide.
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Verificar manualmente (ver abajo).

## Verificación
- Sin sesión: NO aparece "Admin" ni "Cerrar sesión"; footer y skip link presentes (Tab).
- Con sesión (`admin/admin`): aparece "Admin", badge y "Cerrar sesión"; logout redirige a `/`.
- Página activa resaltada al navegar Inicio/Productos/Admin.
- Buscar desde la navbar lleva a `/products?search=...`.
- Móvil: menú abre/cierra, se cierra al navegar; buscador móvil funciona.
- Dark mode correcto en navbar y footer; sin errores de hidratación en consola.
