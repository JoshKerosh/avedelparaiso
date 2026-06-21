import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Server-side protection for the admin panel. This is the real gate — the
 * client-side `ProtectedRoute` component is only a UX nicety and must not be
 * relied on for security.
 *
 * `/admin/login` is always allowed (otherwise unauthenticated users would be
 * redirected to it in a loop). Every other `/admin/*` path requires a JWT.
 *
 * Next 16 renamed the `middleware` file convention to `proxy`.
 */
export default withAuth(
  function proxy() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === '/admin/login') return true;
        return !!token;
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
