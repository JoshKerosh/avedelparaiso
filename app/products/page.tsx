import Link from 'next/link';
import { getProducts, getRootCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';

export const metadata = {
  title: 'Productos — Ave del Paraíso',
  description: 'Explora todo nuestro catálogo de productos con filtros por categoría.',
};

interface SearchParams {
  search?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

function buildHref(params: SearchParams, page: number): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category1) qs.set('category1', params.category1);
  if (params.category2) qs.set('category2', params.category2);
  if (params.category3) qs.set('category3', params.category3);
  if (params.sort && params.sort !== 'newest') qs.set('sort', params.sort);
  if (page > 1) qs.set('page', String(page));
  const s = qs.toString();
  return s ? `/products?${s}` : '/products';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const filters = {
    search: sp.search ?? '',
    category1: sp.category1 ?? '',
    category2: sp.category2 ?? '',
    category3: sp.category3 ?? '',
    sort: sp.sort ?? 'newest',
  };

  const [rootCategories, { products, total, totalPages }] = await Promise.all([
    getRootCategories(),
    getProducts({ ...filters, page, limit: PAGE_SIZE }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400" aria-label="Ruta de navegación">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-900 dark:text-white" aria-current="page">Productos</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Todos los productos</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ProductFilters rootCategories={rootCategories} current={filters} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron productos.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {total} producto{total === 1 ? '' : 's'} encontrado{total === 1 ? '' : 's'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginación">
                    {page > 1 ? (
                      <Link
                        href={buildHref(filters, page - 1)}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Anterior
                      </Link>
                    ) : (
                      <span className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed">
                        Anterior
                      </span>
                    )}
                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      Página {page} de {totalPages}
                    </span>
                    {page < totalPages ? (
                      <Link
                        href={buildHref(filters, page + 1)}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Siguiente
                      </Link>
                    ) : (
                      <span className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed">
                        Siguiente
                      </span>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
