import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The page or product you are looking for does not exist.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
