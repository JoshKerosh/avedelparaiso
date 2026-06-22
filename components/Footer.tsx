import Link from 'next/link';

/**
 * Site footer rendered on every page (server component). Static content only —
 * brand, quick links and contact placeholders.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm font-extrabold shadow"
              >
                AP
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Ave del Paraíso</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Catálogo de productos. Explora nuestro inventario y encuentra lo que buscas.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Productos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>WhatsApp: +506 0000-0000</li>
              <li>Instagram: @avedelparaiso</li>
              <li>Email: info@avedelparaiso.cr</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {year} Ave del Paraíso. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
