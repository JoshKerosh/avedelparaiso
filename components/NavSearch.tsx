'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface NavSearchProps {
  variant: 'desktop' | 'mobile';
  onSubmitted?: () => void;
}

/**
 * Search box for the navbar. Pushes the query to the catalog and stays in sync
 * with the active `?search=` param when already on /products. Isolated in its
 * own component because `useSearchParams()` requires a Suspense boundary above
 * it — see <Suspense> wrapper in Navigation.tsx.
 */
export default function NavSearch({ variant, onSubmitted }: NavSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  // Keep the box in sync with the catalog's active query.
  useEffect(() => {
    if (pathname === '/products') {
      setSearch(searchParams.get('search') ?? '');
    }
  }, [pathname, searchParams]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    onSubmitted?.();
  }

  if (variant === 'mobile') {
    return (
      <form onSubmit={submit} role="search" className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </form>
    );
  }

  return (
    <form onSubmit={submit} role="search" className="hidden md:flex flex-1 max-w-md items-center">
      <div className="relative w-full">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
      </div>
    </form>
  );
}
