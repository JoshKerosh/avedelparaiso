# Referencia del Proyecto: Ave del Paraíso

Este archivo sirve como referencia rápida para entender la estructura, tecnologías y convenciones principales del proyecto. Úsalo para onboarding, mantenimiento y para que cualquier asistente AI pueda comprender el contexto rápidamente.

---

## Descripción
E-commerce de plantas y productos de jardinería, con panel de administración, gestión de inventario, categorías multinivel y dark mode.

## Tecnologías principales
- **Next.js 16 (App Router, SSR, CSR)**
- **React 19**
- **Tailwind CSS v4**
- **MongoDB Atlas + Mongoose**
- **NextAuth v4 (autenticación)**
- **Cloudinary (imágenes)**
- **react-hot-toast (notificaciones)**
- **react-icons (íconos)**

## Estructura de carpetas
- `/app` - Páginas principales y rutas API
- `/components` - Componentes reutilizables (Navigation, ThemeProvider, ThemeToggle, etc.)
- `/models` - Modelos de Mongoose (Product, Category, User)
- `/lib` - Utilidades (mongodb, cloudinary)
- `/hooks` - Custom hooks (ej: useIsAdmin)
- `/public` - Imágenes y assets estáticos

## Funcionalidades clave
- **Dark/Light mode:** Implementado con next-themes y Tailwind (clase `dark`)
- **Responsive:** Menú hamburguesa en mobile, diseño adaptable
- **Admin panel:** Gestión de productos, categorías, stock, historial
- **Búsqueda:** Regex en nombre y descripción de productos
- **Filtros:** Por categoría, con debounce en búsqueda
- **Autenticación:** NextAuth, roles (admin, user)
- **Badge Admin:** Se muestra en el header si el usuario está logueado

## Convenciones y tips
- Los modales usan `bg-white dark:bg-gray-900` para soportar dark mode
- Los labels usan `text-gray-700 dark:text-gray-200` para contraste
- Los botones de acción en admin usan íconos pequeños (lápiz, basurero)
- El doble click en la fila de productos abre el modal de edición
- El badge "Admin" aparece debajo de "Ave del Paraíso" si hay sesión activa

## Variables de entorno
- `.env.local` contiene las claves de MongoDB, Cloudinary, NextAuth, etc.

## Notas de mantenimiento
- Si agregas nuevos roles, ajusta `/hooks/useIsAdmin.ts`
- Si cambias la estructura de productos/categorías, actualiza los modelos y los formularios
- Para nuevos features, sigue la convención de dark mode y responsive

---

Este archivo puede ser extendido con más detalles según evolucione el proyecto.
