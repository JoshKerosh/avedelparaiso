'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CategoryRef } from '@/types/product';

export interface ProductFilterValues {
  search: string;
  category1: string;
  category2: string;
  category3: string;
  sort: string;
}

interface ProductFiltersProps {
  rootCategories: CategoryRef[];
  current: ProductFilterValues;
}

/**
 * Client-side filter controls for the catalog. They never fetch products —
 * they only write the selected filters to the URL, and the server component
 * re-renders the grid from the new `searchParams`.
 */
export default function ProductFilters({ rootCategories, current }: ProductFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [categories2, setCategories2] = useState<CategoryRef[]>([]);
  const [categories3, setCategories3] = useState<CategoryRef[]>([]);
  const [searchInput, setSearchInput] = useState(current.search);

  // Keep the local search box in sync if the URL changes externally.
  useEffect(() => {
    setSearchInput(current.search);
  }, [current.search]);

  // Load level-2 options for the selected level-1 category.
  useEffect(() => {
    if (!current.category1) {
      setCategories2([]);
      return;
    }
    let active = true;
    fetch(`/api/admin/categories/children/${current.category1}`)
      .then((r) => r.json())
      .then((d) => active && setCategories2(d.categories ?? []))
      .catch(() => active && setCategories2([]));
    return () => {
      active = false;
    };
  }, [current.category1]);

  // Load level-3 options for the selected level-2 category.
  useEffect(() => {
    if (!current.category2) {
      setCategories3([]);
      return;
    }
    let active = true;
    fetch(`/api/admin/categories/children/${current.category2}`)
      .then((r) => r.json())
      .then((d) => active && setCategories3(d.categories ?? []))
      .catch(() => active && setCategories3([]));
    return () => {
      active = false;
    };
  }, [current.category2]);

  // Debounce the search input before pushing it to the URL.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== current.search) {
        pushFilters({ search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function pushFilters(overrides: Partial<ProductFilterValues>) {
    const merged = { ...current, ...overrides };
    const params = new URLSearchParams();
    if (merged.search) params.set('search', merged.search);
    if (merged.category1) params.set('category1', merged.category1);
    if (merged.category2) params.set('category2', merged.category2);
    if (merged.category3) params.set('category3', merged.category3);
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/products?${qs}` : '/products'));
  }

  function clearFilters() {
    setSearchInput('');
    startTransition(() => router.push('/products'));
  }

  const selectClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

  const SORT_LABELS: Record<string, string> = {
    'price-asc': 'Precio: menor a mayor',
    'price-desc': 'Precio: mayor a menor',
    name: 'Nombre: A-Z',
  };

  const catName = (list: CategoryRef[], id: string) => list.find((c) => c._id === id)?.name ?? '';

  // Build the list of active filter "chips". Each chip knows how to remove itself.
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (current.search) {
    activeChips.push({ label: `Búsqueda: "${current.search}"`, onRemove: () => { setSearchInput(''); pushFilters({ search: '' }); } });
  }
  if (current.category1) {
    activeChips.push({ label: catName(rootCategories, current.category1) || 'Categoría', onRemove: () => pushFilters({ category1: '', category2: '', category3: '' }) });
  }
  if (current.category2) {
    activeChips.push({ label: catName(categories2, current.category2) || 'Subcategoría', onRemove: () => pushFilters({ category2: '', category3: '' }) });
  }
  if (current.category3) {
    activeChips.push({ label: catName(categories3, current.category3) || 'Sub-subcategoría', onRemove: () => pushFilters({ category3: '' }) });
  }
  if (current.sort && current.sort !== 'newest') {
    activeChips.push({ label: SORT_LABELS[current.sort] ?? current.sort, onRemove: () => pushFilters({ sort: 'newest' }) });
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4 ${isPending ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Limpiar
        </button>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/70"
              aria-label={`Quitar filtro ${chip.label}`}
            >
              <span>{chip.label}</span>
              <span aria-hidden className="font-semibold">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buscar
        </label>
        <input
          id="filter-search"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Category Level 1 */}
      <div className="mb-6">
        <label htmlFor="filter-cat1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoría
        </label>
        <select
          id="filter-cat1"
          value={current.category1}
          onChange={(e) => pushFilters({ category1: e.target.value, category2: '', category3: '' })}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {rootCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Level 2 */}
      {current.category1 && categories2.length > 0 && (
        <div className="mb-6">
          <label htmlFor="filter-cat2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategoría
          </label>
          <select
            id="filter-cat2"
            value={current.category2}
            onChange={(e) => pushFilters({ category2: e.target.value, category3: '' })}
            className={selectClass}
          >
            <option value="">Todas las subcategorías</option>
            {categories2.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Level 3 */}
      {current.category2 && categories3.length > 0 && (
        <div className="mb-6">
          <label htmlFor="filter-cat3" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sub-subcategoría
          </label>
          <select
            id="filter-cat3"
            value={current.category3}
            onChange={(e) => pushFilters({ category3: e.target.value })}
            className={selectClass}
          >
            <option value="">Todas</option>
            {categories3.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort */}
      <div>
        <label htmlFor="filter-sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ordenar por
        </label>
        <select
          id="filter-sort"
          value={current.sort}
          onChange={(e) => pushFilters({ sort: e.target.value })}
          className={selectClass}
        >
          <option value="newest">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name">Nombre: A-Z</option>
        </select>
      </div>
    </div>
  );
}
