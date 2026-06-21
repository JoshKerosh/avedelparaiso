'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const LINKS: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/products', label: 'Productos' },
  { href: '/admin', label: 'Admin', adminOnly: true },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { status } = useSession();
  const isAdmin = status === 'authenticated';
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLFormElement>(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Keep the navbar search in sync with the catalog's active query.
  useEffect(() => {
    if (pathname === '/products') {
      setSearch(searchParams.get('search') ?? '');
    }
  }, [pathname, searchParams]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setIsOpen(false);
  }

  const visibleLinks = LINKS.filter((l) => !l.adminOnly || isAdmin);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm font-extrabold shadow"
              >
                AP
              </span>
              <span className="hidden sm:inline">Ave del Paraíso</span>
            </Link>
            {isAdmin && (
              <span className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white font-semibold shadow select-none border border-blue-800">
                Admin
              </span>
            )}
          </div>

          {/* Desktop search */}
          <form
            ref={searchRef}
            onSubmit={submitSearch}
            role="search"
            className="hidden md:flex flex-1 max-w-md items-center"
          >
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            {visibleLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
              >
                Cerrar sesión
              </button>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Abrir menú"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={submitSearch} role="search" className="mb-4">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
            <div className="flex flex-col space-y-2">
              {visibleLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-2 py-2 rounded-lg ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="px-2 py-2 text-left rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
