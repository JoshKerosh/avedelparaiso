'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import NavSearch from './NavSearch';

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
  const { status } = useSession();
  const isAdmin = status === 'authenticated';
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
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
          <Suspense fallback={<div className="hidden md:block flex-1 max-w-md" />}>
            <NavSearch variant="desktop" />
          </Suspense>

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
            <Suspense fallback={null}>
              <NavSearch variant="mobile" onSubmitted={() => setIsOpen(false)} />
            </Suspense>
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
