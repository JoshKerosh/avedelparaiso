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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4 ${isPending ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Clear
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          id="filter-search"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Category Level 1 */}
      <div className="mb-6">
        <label htmlFor="filter-cat1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          id="filter-cat1"
          value={current.category1}
          onChange={(e) => pushFilters({ category1: e.target.value, category2: '', category3: '' })}
          className={selectClass}
        >
          <option value="">All Categories</option>
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
            Subcategory
          </label>
          <select
            id="filter-cat2"
            value={current.category2}
            onChange={(e) => pushFilters({ category2: e.target.value, category3: '' })}
            className={selectClass}
          >
            <option value="">All Subcategories</option>
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
            Sub-subcategory
          </label>
          <select
            id="filter-cat3"
            value={current.category3}
            onChange={(e) => pushFilters({ category3: e.target.value })}
            className={selectClass}
          >
            <option value="">All</option>
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
          Sort By
        </label>
        <select
          id="filter-sort"
          value={current.sort}
          onChange={(e) => pushFilters({ sort: e.target.value })}
          className={selectClass}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>
    </div>
  );
}
