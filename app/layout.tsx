'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider>
          <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                  Ave del Paraíso
                </Link>
                <div className="flex space-x-8">
                  <Link href="/" className="text-gray-700 hover:text-gray-900">
                    Home
                  </Link>
                  <Link href="/products" className="text-gray-700 hover:text-gray-900">
                    Products
                  </Link>
                  <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
