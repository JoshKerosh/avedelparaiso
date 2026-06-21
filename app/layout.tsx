'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navigation from '@/components/Navigation';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={null}>
              <Navigation />
            </Suspense>
            <main>{children}</main>
            <Toaster position="top-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
